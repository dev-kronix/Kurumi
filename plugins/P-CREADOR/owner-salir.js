const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply(`*⌬┤ ❌ ├⌬ SOMENTE GRUPOS.*`)

  try {
    await m.reply(`*⌬┤ 👋 ├⌬ Saindo do grupo...*`)
    await conn.groupLeave(m.chat)
  } catch (e) {
    m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível sair do grupo.`)
  }
}

handler.help = ['sairgrupo']
handler.command = ['salir', 'leave', 'sairgrupo', 'sair']
handler.tags = ['owner']
handler.ownerOnly = true
handler.noRegister = true

export default handler