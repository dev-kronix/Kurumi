import * as baileysMod from '@whiskeysockets/baileys'

const pkg = baileysMod.default && Object.keys(baileysMod).length === 1 ? baileysMod.default : baileysMod
const { jidNormalizedUser } = pkg

const handler = async (m, { conn, text, usedPrefix, participants }) => {
  let num = text ? text.replace(/[^0-9]/g, '') : ''
  
  if (!num) {
    return m.reply(`*⌬┤ ⚠️ ├⌬ NÚMERO OBRIGATÓRIO.*\n\n> Uso: ${usedPrefix}adicionar <número sem +>`)
  }

  const targetJid = jidNormalizedUser(`${num}@s.whatsapp.net`)
  const isAlreadyInGroup = participants.some(p => p.id === targetJid)

  if (isAlreadyInGroup) {
    return m.reply('*⌬┤ ⚠️ · O usuário já está no grupo.*')
  }

  try {
    const res = await conn.groupParticipantsUpdate(m.chat, [targetJid], 'add')
    const status = res?.[targetJid] || res?.[0]?.[targetJid] || (res?.[0] ? res[0] : null)

    if (status === '403' || status === '401' || status?.status === '403' || status?.status === '401') {
      const code = await conn.groupInviteCode(m.chat)
      return m.reply(`*⌬┤ 🔒 PRIVACIDADE ATIVADA ├⌬*\n\n> @${num} configurou a privacidade para não ser adicionado diretamente.\n> Link de convite:\n> https://chat.whatsapp.com/${code}`, { mentions: [targetJid] })
    }

    m.reply(`*⌬┤ ✅ ├⌬ USUÁRIO ADICIONADO*\n\n> @${num} foi adicionado ao grupo com sucesso.`, { mentions: [targetJid] })

  } catch (e) {
    const errorStr = String(e?.stack || e?.message || e)
    const isRestricted = errorStr.includes('reachout') || errorStr.includes('restricted') || e?.data === 463 || e?.statusCode === 463

    if (isRestricted) {
      try {
        const code = await conn.groupInviteCode(m.chat)
        return m.reply(`*⌬┤ 🔒 RESTRIÇÃO DE CONTATO ├⌬*\n\n> O WhatsApp restringiu temporariamente a capacidade da bot de adicionar contatos diretamente.\n> Compartilhe este link para que a pessoa entre voluntariamente:\n> https://chat.whatsapp.com/${code}`)
      } catch {
        return m.reply(`*⌬┤ 🔒 RESTRIÇÃO DE CONTATO ├⌬*\n\n> O WhatsApp restringiu temporariamente a capacidade da bot de adicionar contatos diretamente. Compartilhe um link de convite manualmente.`)
      }
    }

    console.error(e)
    m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n\n> Não foi possível adicionar o usuário. Verifique se o número é válido e possui uma conta ativa no WhatsApp.`)
  }
}

handler.help = ['adicionar <número>']
handler.tags = ['group']
handler.command = ['add', 'agregar', 'añadir', 'invitar', 'adicionar', 'addmembro']
handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler