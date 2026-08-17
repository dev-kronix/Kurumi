import User from '../../lib/database/models/zen-users.js'

const handler = async (m, { text, usedPrefix }) => {
  const userDb = await User.findOne({ jid: m.sender })
  if (!userDb) return m.reply('*⌬┤ ❌ ├⌬ CADASTRO NÃO ENCONTRADO.*')

  if (userDb.serial) {
    if (!text) {
      return m.reply(`*⌬┤ ⚠️ ├⌬ SERIAL OBRIGATÓRIO.*\n> Informe seu serial para confirmar.\n> Exemplo: *${usedPrefix}unreg A1B2C3D4E5*\n> Se não lembrar, use *${usedPrefix}serial*.`)
    }

    if (userDb.serial !== text.trim().toUpperCase()) {
      return m.reply('*⌬┤ ❌ ├⌬ SERIAL INCORRETO.*\n> Confira o código informado ou use o comando *serial* para consultá-lo.')
    }
  }

  userDb.registered = false
  userDb.name = ''
  userDb.age = 0
  userDb.serial = ''
  await userDb.save()

  m.reply('*⌬┤ ✅ ├⌬ CADASTRO REMOVIDO.*\n> Seus dados de cadastro foram removidos.\n> Você não terá acesso à economia nem aos comandos exclusivos até se cadastrar novamente.')
}

handler.help = ['unreg <serial>']
handler.tags = ['registro']
handler.command = ['unreg', 'borrarregistro', 'removercadastro']
handler.register = true
export default handler
