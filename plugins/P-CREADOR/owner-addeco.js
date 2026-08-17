import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const handler = async (m, { text, command, participants }) => {
  const target = m.mentionedJid?.[0] || m.quoted?.sender || null
  if (!target) return m.reply(`*⌬┤ ✙ ├⌬ USUÁRIO OBRIGATÓRIO.*\n> Mencione ou responda à mensagem do usuário.`)

  const amountMatch = text?.match(/-?\d+/)
  const amount = amountMatch ? parseInt(amountMatch[0]) : NaN
  if (isNaN(amount) || amount === 0) return m.reply(`*⌬┤ ✙ ├⌬ VALOR INVÁLIDO.*\n> Informe uma quantidade diferente de zero.`)

  const num = target.split('@')[0].split(':')[0].replace(/\D/g, '')
  const user = await User.findOne({ jid: { $regex: `^${num}@` } })
  if (!user) return m.reply(`*⌬┤ ❌ ├⌬ USUÁRIO NÃO CADASTRADO.*`)

  const isKogen = ['addkogen', 'delkogen', 'removekogen'].includes(command)
  const isRemove = ['deleco', 'delcoins', 'removercoins', 'delkogen', 'removekogen'].includes(command)
  const field = isKogen ? 'kogen' : 'zenCoins'
  const delta = isRemove ? -Math.abs(amount) : Math.abs(amount)

  if (delta < 0 && user[field] + delta < 0) {
    return m.reply(`*⌬┤ ❌ ├⌬ SALDO INSUFICIENTE.*\n> O usuário possui apenas *${user[field]}* ${isKogen ? config.PREMIUM_NAME : config.CURRENCY_NAME}.`)
  }

  await User.updateOne({ _id: user._id }, { $inc: { [field]: delta } })
  const simbolo = isKogen ? config.PREMIUM_SYMBOL : config.CURRENCY_SYMBOL
  const nome = isKogen ? config.PREMIUM_NAME : config.CURRENCY_NAME

  m.reply(`*⌬┤ ✅ ├⌬ ECONOMIA ATUALIZADA.*\n> 👤 @${num}\n> ${delta > 0 ? '➕ Adicionado' : '➖ Removido'}: *${Math.abs(delta)} ${simbolo} ${nome}*`, { mentions: [target] })
}

handler.help = ['addcoins @usuario <valor>', 'removercoins @usuario <valor>', 'addkogen @usuario <valor>']
handler.command = ['addeco', 'addcoins', 'darcoins', 'deleco', 'delcoins', 'removercoins', 'addkogen', 'delkogen', 'removekogen']
handler.tags = ['owner']
handler.ownerOnly = true
handler.noRegister = true

export default handler