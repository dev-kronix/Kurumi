const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`*⌬┤ ⚠️ ├⌬ DESCRIÇÃO OBRIGATÓRIA.*\n> Exemplo: *${usedPrefix}${command} Nova descrição*`)

  await conn.groupUpdateDescription(m.chat, text)
  m.reply(`*⌬┤ ✅ ├⌬ DESCRIÇÃO ATUALIZADA.*\n▢ *Nova descrição:* ${text}`)
}

handler.help = ['descricao <texto>']
handler.tags = ['group']
handler.command = ['desc', 'descripcion', 'descricao', 'setdesc']
handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler
