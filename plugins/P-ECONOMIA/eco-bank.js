import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const handler = async (m, { text, usedPrefix, command, userDb }) => {
  if (!userDb) return
  const args = text.trim().split(/\s+/)
  const now = Date.now()

  if (userDb.bankBalance > 0 && userDb.bankExpiry > 0 && now > userDb.bankExpiry) {
    const amount = userDb.bankBalance
    userDb.zenCoins += amount
    userDb.bankBalance = 0
    userDb.bankExpiry = 0
    await User.updateOne({ jid: m.sender }, { $inc: { zenCoins: amount }, $set: { bankBalance: 0, bankExpiry: 0 } })
  }

  if (['d', 'dep', 'depositar'].includes(command)) {
    let inputMonto = args[0]
    let horas = parseInt(args[1])

    if (!inputMonto || isNaN(horas) || horas <= 0) {
      return m.reply(`*⌬┤ 🏦 ├⌬ MODO DEPÓSITO*\n\n> *Uso:* ${usedPrefix + command} <valor|all> <horas>\n> 🧾 *Custo:* 1 ${config.PREMIUM_SYMBOL} por hora.\n\n> *Exemplo:* ${usedPrefix + command} all 24`)
    }

    let monto = ['all', 'todo', 'tudo'].includes(inputMonto.toLowerCase()) ? userDb.zenCoins : parseInt(inputMonto)

    if (isNaN(monto) || monto <= 0) return m.reply('*⌬┤ ⚠️ · VALOR INVÁLIDO.*')
    if (userDb.zenCoins < monto) return m.reply('*⌬┤ ❌ · SALDO INSUFICIENTE NA CARTEIRA.*')
    if (userDb.kogen < horas) return m.reply(`*⌬┤ ❌ ├⌬ ${config.PREMIUM_NAME.toUpperCase()} INSUFICIENTE.* Você precisa de ${horas} ${config.PREMIUM_SYMBOL}.`)

    const baseProteccion = userDb.bankExpiry > now ? userDb.bankExpiry : now
    const nuevaExpiracion = baseProteccion + (horas * 3600000)

    userDb.zenCoins -= monto
    userDb.kogen -= horas
    userDb.bankBalance += monto
    userDb.bankExpiry = nuevaExpiracion

    await User.updateOne({ jid: m.sender }, {
      $inc: { zenCoins: -monto, kogen: -horas, bankBalance: monto },
      $set: { bankExpiry: nuevaExpiracion }
    })

    const fecha = new Date(nuevaExpiracion).toLocaleString('pt-BR')
    return m.reply(`*╔═══⌦ ✦ 🏦 DEPÓSITO ✦ ⌫═══╗*\n\n> 💰 *Valor:* ${monto} ${config.CURRENCY_SYMBOL}\n> ⏳ *Horas:* ${horas}\n> ${config.PREMIUM_SYMBOL} *Custo:* ${horas} ${config.PREMIUM_SYMBOL}\n\n> 🛡️ *Protegido até:* ${fecha}\n*╚══⌦ ${config.footer} ⌫══╝*`)
  }

  if (['r', 'retirar', 'with', 'sacar'].includes(command)) {
    let inputMonto = args[0]
    if (!inputMonto) return m.reply(`*⌬┤ 🏦 ├⌬ USO:* ${usedPrefix + command} <valor|all>`)

    let monto = ['all', 'todo', 'tudo'].includes(inputMonto.toLowerCase()) ? userDb.bankBalance : parseInt(inputMonto)

    if (isNaN(monto) || monto <= 0) return m.reply('*⌬┤ ⚠️ · VALOR INVÁLIDO.*')
    if (userDb.bankBalance < monto) return m.reply('*⌬┤ ❌ · SALDO BANCÁRIO INSUFICIENTE.*')

    userDb.bankBalance -= monto
    userDb.zenCoins += monto

    await User.updateOne({ jid: m.sender }, { $inc: { bankBalance: -monto, zenCoins: monto } })
    return m.reply(`*⌬┤ ✅ ├⌬ SAQUE CONCLUÍDO*\n> Você sacou *${monto}* ${config.CURRENCY_SYMBOL} da conta bancária para sua carteira.`)
  }
}

handler.help = ['depositar <valor> <horas>', 'retirar <valor>']
handler.tags = ['eco']
handler.command = ['d', 'dep', 'depositar', 'r', 'retirar', 'with', 'sacar']
handler.register = true
export default handler