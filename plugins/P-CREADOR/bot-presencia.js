const handler = async (m, { conn, text, command }) => {
  const tipo = (text || '').trim().toLowerCase()
  const map = {
    online: 'available', disponivel: 'available', disponible: 'available',
    digitando: 'composing', escribiendo: 'composing', typing: 'composing',
    gravando: 'recording', grabando: 'recording', recording: 'recording',
    offline: 'unavailable', indisponivel: 'unavailable'
  }

  const presence = map[tipo]
  if (!presence) {
    return m.reply(`*⌬┤ ℹ️ ├⌬ PRESENÇA.*\n> Use: *${command} online | digitando | gravando | offline*`)
  }

  await conn.sendPresenceUpdate(presence, m.chat)
  m.reply(`*⌬┤ ✅ ├⌬ PRESENÇA ATUALIZADA.*\n> Estado: *${tipo}*`)
}

handler.help = ['presenca <estado>']
handler.command = ['presence', 'presencia', 'presenca']
handler.tags = ['owner']
handler.ownerOnly = true
handler.noRegister = true

export default handler