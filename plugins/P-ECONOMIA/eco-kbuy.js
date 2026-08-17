import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const handler = async (m, { args, usedPrefix, command, userDb }) => {
  if (!userDb) return
  const price = config.kogenPrice || 1000

  if (!args[0]) {
    return m.reply(`*╔═══⌦ ✦ 🛒 LOJA DE ${config.PREMIUM_NAME.toUpperCase()} ✦ ⌫═══╗*\n\n`
      + `> 💵 *Preço:* ${price} ${config.CURRENCY_SYMBOL} = 1 ${config.PREMIUM_SYMBOL}\n`
      + `> ✍️ *Uso:* ${usedPrefix + command} <quantidade>\n`
      + `> 💡 *Dica:* Você pode usar *${usedPrefix + command} all*\n\n`
      + `*╚══⌦ ${config.footer} ⌫══╝*`)
  }

  let amount = ['all', 'tudo'].includes(args[0].toLowerCase())
    ? Math.floor(userDb.zenCoins / price) 
    : parseInt(args[0])

  if (isNaN(amount) || amount <= 0) return m.reply('*⌬┤ ⚠️ · QUANTIDADE INVÁLIDA.*')

  const totalCost = amount * price
  if (userDb.zenCoins < totalCost) return m.reply(`*⌬┤ ❌ ├⌬ SALDO INSUFICIENTE.*\n> Você precisa de ${totalCost} ${config.CURRENCY_SYMBOL} para comprar ${amount} ${config.PREMIUM_SYMBOL}.`)

  userDb.zenCoins -= totalCost
  userDb.kogen += amount
  
  await User.updateOne({ jid: m.sender }, { $inc: { zenCoins: -totalCost, kogen: amount } })

  m.reply(`*⌬┤ ✅ ├⌬ COMPRA CONCLUÍDA*\n\n> 📥 *Recebido:* ${amount} ${config.PREMIUM_SYMBOL}\n> 📤 *Custo:* ${totalCost} ${config.CURRENCY_SYMBOL}`)
}

handler.help = ['comprarkogen <quantidade/all>']
handler.tags = ['eco']
handler.command = ['kbuy', 'buykogen', 'comprarkogen']
handler.register = true
export default handler