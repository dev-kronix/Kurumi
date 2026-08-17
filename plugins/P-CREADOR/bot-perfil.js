const handler = async (m, { conn, text, command, usedPrefix }) => {
  if (command === 'setbio') {
    if (!text) return m.reply(`*⌬┤ ✙ ├⌬ USO:* ${usedPrefix + command} <nova bio>`)
    await conn.updateProfileStatus(text)
    return m.reply(`*⌬┤ ✅ ├⌬ BIO ATUALIZADA.*`)
  }

  if (command === 'setnamebot') {
    if (!text) return m.reply(`*⌬┤ ✙ ├⌬ USO:* ${usedPrefix + command} <novo nome>`)
    await conn.updateProfileName(text)
    conn.botname = text
    return m.reply(`*⌬┤ ✅ ├⌬ NOME ATUALIZADO.*\n> Novo nome: *${text}*`)
  }
}

handler.help = ['setbio <texto>', 'setnamebot <nome>']
handler.command = ['setbio', 'setnamebot', 'mudarnomebot']
handler.tags = ['owner']
handler.ownerOnly = true
handler.noRegister = true

export default handler