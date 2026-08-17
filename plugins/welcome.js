import Group from '../lib/database/models/zen-groups.js'
import { jidNormalizedUser } from '@whiskeysockets/baileys'
import { groupCache, groupDbCache } from '../lib/caches.js'

const DEFAULT_BV = '*╭┈ ✧ BEM-VINDO(A)! ✧ ┈*\n*│* 👋🏻 Olá, %user\n*│* ⛩️ Grupo: *%group*\n*│* 👥 Membro nº: *%count*\n*╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈*\n> 🌟 _Aproveite o grupo e lembre-se de ler as regras._'
const DEFAULT_DP = '*╭┈ ✧ ATÉ MAIS! ✧ ┈*\n*│* 🚪 %user saiu do grupo.\n*│* 📉 Agora somos *%count* membros.\n*╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈*\n> 🥀 _Quem sabe a gente se vê de novo._'
const DEFAULT_IMG = 'https://i.ibb.co/sphnd13T/images-4.jpg'

async function getBuffer(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch {
    return null
  }
}

const parsear = (texto, user, group, count) => {
  const u = (user || '').split('@')[0]
  return (texto || '')
    .replace(/%user/g, `@${u}`)
    .replace(/%group/g, String(group || 'grupo'))
    .replace(/%count/g, String(count || '?'))
}

const handler = async (m, { args, command, groupDb }) => {
  const option = args[0]?.toLowerCase()
  const text = args.join(' ')

  if (['welcome', 'bienvenida', 'boasvindas'].includes(command)) {
    if (!option) return m.reply(`*⌬┤ ⚙️ ├⌬ CONFIGURAÇÃO DE BOAS-VINDAS*\n> Estado: ${groupDb.welcome ? '✅ ON' : '❌ OFF'}\n> *Uso:* .boasvindas on / off`)

    if (['on', '1', 'true', 'ativar', 'activar'].includes(option)) {
      groupDb.welcome = true
      await groupDb.save()
      return m.reply(`*⌬┤ ✅ ├⌬ BOAS-VINDAS ATIVADAS*`)
    }

    if (['off', '0', 'false', 'desativar', 'desactivar'].includes(option)) {
      groupDb.welcome = false
      await groupDb.save()
      return m.reply(`*⌬┤ ❌ ├⌬ BOAS-VINDAS DESATIVADAS*`)
    }

    return m.reply(`*⌬┤ ❕ ├⌬ OPÇÃO INVÁLIDA*\n> Use: .boasvindas on / off`)
  }

  if (['bye', 'despedida', 'saida'].includes(command)) {
    if (!option) return m.reply(`*⌬┤ ⚙️ ├⌬ CONFIGURAÇÃO DE SAÍDA*\n> Estado: ${groupDb.goodbye ? '✅ ON' : '❌ OFF'}\n> *Uso:* .saida on / off`)

    if (['on', '1', 'true', 'ativar', 'activar'].includes(option)) {
      groupDb.goodbye = true
      await groupDb.save()
      return m.reply(`*⌬┤ ✅ ├⌬ MENSAGEM DE SAÍDA ATIVADA*`)
    }

    if (['off', '0', 'false', 'desativar', 'desactivar'].includes(option)) {
      groupDb.goodbye = false
      await groupDb.save()
      return m.reply(`*⌬┤ ❌ ├⌬ MENSAGEM DE SAÍDA DESATIVADA*`)
    }

    return m.reply(`*⌬┤ ❕ ├⌬ OPÇÃO INVÁLIDA*\n> Use: .saida on / off`)
  }

  if (['setwelcome', 'definirboasvindas'].includes(command)) {
    if (!text) return m.reply('*⌬┤ ✙ ├⌬ Escreva a mensagem de boas-vindas.*\n\n> *Variáveis disponíveis:*\n- `%user` = menciona o usuário\n- `%group` = nome do grupo\n- `%count` = número de membros')
    groupDb.welcomeMsg = text
    await groupDb.save()
    return m.reply('*⌬┤ ✅ · MENSAGEM DE BOAS-VINDAS SALVA*')
  }

  if (['setbye', 'definirsaida'].includes(command)) {
    if (!text) return m.reply('*⌬┤ ✙ ├⌬ Escreva a mensagem de saída.*\n\n> *Variáveis disponíveis:*\n- `%user` = menciona o usuário\n- `%group` = nome do grupo\n- `%count` = membros restantes')
    groupDb.goodbyeMsg = text
    await groupDb.save()
    return m.reply('*⌬┤ ✅ · MENSAGEM DE SAÍDA SALVA*')
  }
}

export async function manejarParticipantes(conn, update) {
  const { id, participants, action } = update
  if (!id) return
  const chatJid = jidNormalizedUser(id)

  try {
    let group = groupDbCache.get(chatJid)
    if (!group) {
      group = await Group.findOne({ id: chatJid }).lean()
      if (group) groupDbCache.set(chatJid, group)
    }

    if (!group || (!group.welcome && !group.goodbye)) return

    const myNumber = conn.user.id.split(':')[0]
    const isMainBot = !conn.isSubBot
    if (group.primaryBot && group.primaryBot !== myNumber) return
    if (isMainBot && group.mainBotSleeping) return
    if (!isMainBot && group.disabledBots?.includes(myNumber)) return

    const meta = groupCache.get(chatJid) || await conn.groupMetadata(chatJid).catch(() => ({}))
    const groupName = meta?.subject || 'grupo'
    const count = meta?.participants?.length || '?'

    for (const item of participants) {
      const jid = jidNormalizedUser(typeof item === 'string' ? item : (item?.id || item?.jid))
      if (!jid || jid === jidNormalizedUser(conn.user.id)) continue

      const isAdd = action === 'add' && group.welcome
      const isRem = (action === 'remove' || action === 'leave') && group.goodbye

      if (isAdd || isRem) {
        let pfpUrl = await conn.profilePictureUrl(jid, 'image').catch(() => null)
        if (!pfpUrl) pfpUrl = DEFAULT_IMG
        const pfpBuffer = await getBuffer(pfpUrl)
        const texto = parsear(isAdd ? (group.welcomeMsg || DEFAULT_BV) : (group.goodbyeMsg || DEFAULT_DP), jid, groupName, count)

        await conn.sendMessage(chatJid, {
          image: pfpBuffer || { url: pfpUrl },
          caption: texto,
          mentions: [jid]
        })
      }
    }
  } catch (e) {
    console.error('[ERRO WELCOME]', e.message)
  }
}

handler.help = ['boasvindas <on/off>', 'saida <on/off>', 'definirboasvindas <texto>', 'definirsaida <texto>']
handler.tags = ['group']
handler.command = ['welcome', 'bienvenida', 'boasvindas', 'bye', 'despedida', 'saida', 'setwelcome', 'definirboasvindas', 'setbye', 'definirsaida']
handler.groupOnly = true
handler.adminOnly = true
handler.manejarParticipantes = manejarParticipantes

export default handler
