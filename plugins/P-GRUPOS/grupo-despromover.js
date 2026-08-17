import * as baileysMod from '@whiskeysockets/baileys'

const pkg = baileysMod.default && Object.keys(baileysMod).length === 1 ? baileysMod.default : baileysMod
const { jidNormalizedUser } = pkg

const handler = async (m, { conn }) => {
  const user = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
  if (!user) return m.reply(`*⌬┤ ⚠️ ├⌬ USUÁRIO OBRIGATÓRIO.*\n> Mencione ou responda à mensagem do usuário que deseja remover da administração.`)

  const targetJid = jidNormalizedUser(user)
  const targetNum = targetJid.split('@')[0]

  const { participants } = await conn.groupMetadata(m.chat)
  const target = participants.find(p =>
    jidNormalizedUser(p.id) === targetJid || (p.lid && jidNormalizedUser(p.lid) === targetJid)
  )

  if (target?.admin === 'superadmin' || target?.isCommunityAdmin) {
    return m.reply(`*⌬┤ 👑 ├⌬ AÇÃO BLOQUEADA.*\n▢ Não posso remover o administrador principal do grupo.`)
  }

  await conn.groupParticipantsUpdate(m.chat, [targetJid], 'demote')
  m.reply(`*⌬┤ ⬇️ ├⌬ ADMIN REMOVIDO.*\n▢ *Removido da administração:* @${targetNum}`, { mentions: [targetJid] })
}

handler.help = ['rebaixar @usuario']
handler.tags = ['group']
handler.command = ['despromover', 'demote', 'deadmin', 'rebaixar', 'removeradmin']
handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler
