import fs from 'fs'
import path from 'path'
import * as baileysMod from '@whiskeysockets/baileys'
import config from '../../config.js'

const pkg = baileysMod.default && Object.keys(baileysMod).length === 1 ? baileysMod.default : baileysMod
const { jidNormalizedUser } = pkg

const ACTIVITY_DIR = path.resolve('./lib/database/data/activity')

function readActivity(groupId) {
  const fp = path.join(ACTIVITY_DIR, `${groupId.replace('@g.us', '')}.json`)
  try {
    if (fs.existsSync(fp)) return JSON.parse(fs.readFileSync(fp, 'utf-8'))
  } catch {}
  return {}
}

const on  = '✅'
const off = '❌'

const handler = async (m, { conn, participants, groupMetadata, groupDb, isBotAdmin }) => {
  if (!m.isGroup) return m.reply(`*⌬┤ 👥 ├⌬ SOMENTE GRUPOS.*\n> Este comando funciona apenas em grupos.`)

  const meta = groupMetadata || await conn.groupMetadata(m.chat).catch(() => ({}))

  const botJid    = jidNormalizedUser(conn.user.id)
  const admins    = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin' || p.isCommunityAdmin)
  const bots      = participants.filter(p => jidNormalizedUser(p.id) === botJid)
  const totalReal = participants.length

  const createdAt = meta.creation
    ? new Date(meta.creation * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '---'

  const inviteCode = isBotAdmin
    ? await conn.groupInviteCode(m.chat).catch(() => null)
    : null

  const activity   = readActivity(m.chat)
  const totalMsgs  = Object.values(activity).reduce((a, b) => a + b, 0)
  const conActividad = Object.keys(activity).length
  const sinMensajes  = participants.filter(p => {
    const jid = jidNormalizedUser(p.id)
    return jid !== botJid && !(activity[jid] > 0)
  }).length

  const restrict  = meta.restrict   ? '🔒 Somente admins' : '🌐 Todos'
  const announce  = meta.announce   ? '🔒 Somente admins' : '🌐 Todos'
  const ephemeral = meta.ephemeralDuration
    ? `⏳ ${meta.ephemeralDuration / 86400}d`
    : `${off} Desativado`

  const joinApproval = meta.joinApprovalMode  ? on  : off
  const memberAdd    = meta.memberAddMode      ? on  : off
  const isCommunity  = meta.isCommunity        ? on  : off
  const isLinked     = meta.linkedParent       ? on  : off

  const desc = meta.desc
    ? (meta.desc.length > 120 ? meta.desc.slice(0, 117) + '...' : meta.desc)
    : '---'

  const db = groupDb || {}
  const disabledCmds = db.disabledCmds?.length ? db.disabledCmds.join(', ') : 'nenhum'
  const disabledCats = db.disabledCategories?.length ? db.disabledCategories.join(', ') : 'nenhuma'

  let txt = `*╔═══⌦ ✦ 📋 INFO DO GRUPO ✦ ⌫═══╗*\n\n`

  txt += `*⌬┤ 📌 GERAL ├⌬*\n`
  txt += `> 📛 *Nome:* ${meta.subject || '---'}\n`
  txt += `> 🆔 *ID:* ${m.chat}\n`
  txt += `> 📅 *Criado em:* ${createdAt}\n`
  txt += `> 📝 *Descrição:* ${desc}\n`
  if (inviteCode) txt += `> 🔗 *Link:* https://chat.whatsapp.com/${inviteCode}\n`
  txt += '\n'

  txt += `*⌬┤ 👥 MEMBROS ├⌬*\n`
  txt += `> 👤 *Total:* ${totalReal}\n`
  txt += `> 👑 *Admins:* ${admins.length}\n`
  txt += `> 🤖 *Bots:* ${bots.length}\n`
  txt += '\n'

  txt += `*⌬┤ ⚙️ CONFIGURAÇÃO ├⌬*\n`
  txt += `> ✏️ *Editar informações:* ${restrict}\n`
  txt += `> 💬 *Enviar mensagens:* ${announce}\n`
  txt += `> ⏳ *Mensagens temporárias:* ${ephemeral}\n`
  txt += `> 🚪 *Aprovação de entrada:* ${joinApproval}\n`
  txt += `> ➕ *Membros podem adicionar:* ${memberAdd}\n`
  txt += `> 🏘️ *É comunidade:* ${isCommunity}\n`
  txt += `> 🔗 *Vinculado a comunidade:* ${isLinked}\n`
  txt += '\n'

  txt += `*⌬┤ 🤖 CONFIGURAÇÃO DA BOT ├⌬*\n`
  txt += `> 👋 *Boas-vindas:* ${db.welcome ? on : off}\n`
  txt += `> 👋 *Despedida:* ${db.goodbye ? on : off}\n`
  txt += '\n'

  txt += `*⌬┤ 🛡️ PROTEÇÕES ├⌬*\n`
  txt += `> 🔗 *Antilink:* ${db.antilink ? on : off}\n`
  txt += `> 🎙️ *Anti áudio:* ${db.antinotadevoz ? on : off}\n`
  txt += `> 📢 *Anti menção de status:* ${db.antimenciongp ? on : off}\n`
  txt += `> 🎭 *Anti sticker:* ${db.antisticker ? on : off}\n`
  txt += `> 🎬 *Anti vídeo:* ${db.antivideo ? on : off}\n`
  txt += `> 🖼️ *Anti imagem:* ${db.antiimagen ? on : off}\n`
  txt += `> 🗑️ *Anti-exclusão:* ${db.antidelete ? on : off}\n`
  txt += `> 🚫 *Anti tóxico:* ${db.antitoxic ? on : off}\n`
  txt += '\n'

  txt += `*⌬┤ ⚙️ OUTRAS CONFIGURAÇÕES ├⌬*\n`
  txt += `> 🚫 *Comandos bloqueados:* ${disabledCmds}\n`
  txt += `> 🚫 *Categorias bloqueadas:* ${disabledCats}\n`
  txt += '\n'

  txt += `*⌬┤ 📊 ATIVIDADE ├⌬*\n`
  txt += `> 📨 *Mensagens registradas:* ${totalMsgs}\n`
  txt += `> 🔥 *Com atividade:* ${conActividad} usuários\n`
  txt += `> 😴 *Sem mensagens:* ${sinMensajes} usuários\n`

  txt += `\n*╚══⌦ ${config.footer} ⌫══╝*`

  const pfp = await conn.profilePictureUrl(m.chat, 'image').catch(() => null)

  if (pfp) {
    await conn.sendMessage(m.chat, { image: { url: pfp }, caption: txt }, { quoted: m })
  } else {
    await m.reply(txt)
  }
}

handler.help      = ['infogrupo']
handler.tags      = ['group']
handler.command   = ['infogrupo', 'groupinfo', 'ginfo', 'grupoinfo']
handler.groupOnly = true
handler.noRegister = true

export default handler
