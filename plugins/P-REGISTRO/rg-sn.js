import User from '../../lib/database/models/zen-users.js'

const handler = async (m) => {
  const userDb = await User.findOne({ jid: m.sender })
  if (!userDb?.serial) return m.reply('*⌬┤ ❌ ├⌬ SERIAL NÃO ENCONTRADO.*')

  m.reply(`*⌬┤ 🔐 ├⌬ SEU CÓDIGO SERIAL:*\n\n> \`${userDb.serial}\`\n\n_Não compartilhe esse código._`)
}

handler.help = ['serial']
handler.tags = ['registro']
handler.command = ['miserial', 'meuserial', 'sn', 'serial']
handler.register = true
export default handler
