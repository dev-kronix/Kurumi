const handler = async (m, { args, usedPrefix, command, userDb }) => {
  if (!args[0]) return m.reply(`*⌬┤ ✙ ├⌬ USO.*\n> *${usedPrefix}${command} <nova_idade>*\n> 💰 Custo: *10 Kōgen*`)

  const novaIdade = parseInt(args[0])
  if (isNaN(novaIdade) || novaIdade < 5 || novaIdade > 100) {
    return m.reply('*⌬┤ ⚠️ ├⌬ IDADE INVÁLIDA.*\n> Informe uma idade válida entre 5 e 100 anos.')
  }

  if (userDb.age === novaIdade) {
    return m.reply('*⌬┤ ⚠️ ├⌬ MESMA IDADE.*\n> Essa idade já está registrada no seu perfil.')
  }

  if (userDb.kogen < 10) {
    return m.reply(`*⌬┤ 💎 ├⌬ SEM KŌGEN.*\n> Você precisa de *10 Kōgen* para alterar sua idade.\n> Saldo atual: *${userDb.kogen} ✦*`)
  }

  userDb.age = novaIdade
  userDb.kogen -= 10
  await userDb.save()

  m.reply(`*⌬┤ ✅ ├⌬ IDADE ATUALIZADA.*\n> Sua idade foi alterada para *${novaIdade} anos*.\n> ✦ Foram descontados *10 Kōgen*.`)
}

handler.help = ['alteraridade <idade>']
handler.tags = ['registro']
handler.command = ['alteraridade', 'cambiaredad', 'setage']

export default handler
