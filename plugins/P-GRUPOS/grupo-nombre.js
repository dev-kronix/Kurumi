const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`*⌬┤ ⚠️ ├⌬ NOME OBRIGATÓRIO.*\n> Exemplo: *${usedPrefix}${command} Novo Nome*`)

  await conn.groupUpdateSubject(m.chat, text)
  m.reply(`*⌬┤ ✅ ├⌬ NOME ATUALIZADO.*\n▢ *Novo nome:* ${text}`)
}

handler.help = ['nome <texto>']
handler.tags = ['group']
handler.command = ['nombre', 'nome', 'groupname', 'setnombre', 'setnome']
handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler
