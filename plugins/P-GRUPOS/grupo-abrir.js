const handler = async (m, { conn }) => {
  await conn.groupSettingUpdate(m.chat, 'not_announcement')
  m.reply(`*⌬┤ 🔓 ├⌬ GRUPO ABERTO.*\n▢ Todos os membros podem enviar mensagens.`)
}

handler.help = ['abrir']
handler.tags = ['group']
handler.command = ['abrir', 'abrirgrupo', 'open', 'opengroup']
handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler
