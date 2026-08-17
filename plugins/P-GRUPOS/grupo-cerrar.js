const handler = async (m, { conn }) => {
  await conn.groupSettingUpdate(m.chat, 'announcement')
  m.reply(`*⌬┤ 🔒 ├⌬ GRUPO FECHADO.*\n▢ Somente os administradores podem enviar mensagens.`)
}

handler.help = ['fechar']
handler.tags = ['group']
handler.command = ['fechar', 'fechargrupo', 'cerrar', 'closegroup', 'close']
handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler
