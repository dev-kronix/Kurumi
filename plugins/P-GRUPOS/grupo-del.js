const handler = async (m, { conn }) => {
  if (!m.quoted) return m.reply(`*⌬┤ ⚠️ ├⌬ MENSAGEM OBRIGATÓRIA.*\n> Responda à mensagem que deseja apagar.`)

  try {
    await conn.sendMessage(m.chat, { 
      delete: { 
        remoteJid: m.chat, 
        fromMe: false, 
        id: m.quoted.id, 
        participant: m.quoted.author
      } 
    })
  } catch (e) {
    m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível apagar a mensagem.`)
  }
}

handler.help = ['apagar']
handler.tags = ['group']
handler.command = ['del', 'delete', 'borrar', 'apagar']
handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler
