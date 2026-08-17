const handler = async (m, { conn, usedPrefix, command }) => {
  const code = await conn.groupInviteCode(m.chat)
  m.reply(`*⌬┤ 🔗 ├⌬ LINK DO GRUPO.*\n▢ https://chat.whatsapp.com/${code}`)
}

handler.help = ['link']
handler.tags = ['group']
handler.command = ['link', 'invitar', 'invite', 'convite']
handler.groupOnly = true
handler.adminOnly = true
handler.noRegister = true

export default handler
