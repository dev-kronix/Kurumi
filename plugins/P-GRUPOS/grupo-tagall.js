const handler = async (m, { conn, text, participants }) => {
  const mentions = participants.map(p => p.id)
  const texto = text || '📢 Atenção a todos.'
  const lista = participants.map(p => `▢ @${p.id.split('@')[0]}`).join('\n')

  const txt = `*⌬┤ 📢 ├⌬ MARCAR TODOS.*\n▢ *Mensagem:* ${texto}\n\n${lista}`

  await conn.sendMessage(m.chat, { text: txt, mentions }, { quoted: m })
}

handler.help = ['marcartodos']
handler.tags = ['group']
handler.command = ['tagall', 'mencionartodos', 'invocar', 'todos', 'marcartodos']
handler.groupOnly = true
handler.adminOnly = true
handler.noRegister = true

export default handler
