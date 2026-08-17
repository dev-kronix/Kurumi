const handler = async (m, { conn, command }) => {
  const target = m.mentionedJid?.[0] || m.quoted?.sender
  if (!target) return m.reply(`*⌬┤ ✙ ├⌬ USUÁRIO OBRIGATÓRIO.*\n> Mencione ou responda à mensagem do usuário.`)

  const isBlock = ['block', 'bloquear'].includes(command)
  try {
    await conn.updateBlockStatus(target, isBlock ? 'block' : 'unblock')
    m.reply(`*⌬┤ ✅ ├⌬ ${isBlock ? 'USUÁRIO BLOQUEADO' : 'USUÁRIO DESBLOQUEADO'}.*\n> @${target.split('@')[0]}`, { mentions: [target] })
  } catch (e) {
    m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível ${isBlock ? 'bloquear' : 'desbloquear'} o usuário.`)
  }
}

handler.help = ['bloquear @usuario', 'desbloquear @usuario']
handler.command = ['block', 'bloquear', 'unblock', 'desbloquear']
handler.tags = ['owner']
handler.ownerOnly = true
handler.noRegister = true

export default handler