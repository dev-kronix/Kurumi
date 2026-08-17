import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const handler = async (m, { text, usedPrefix, command, userDb }) => {
  if (!userDb) return

  userDb.dailyStats.rouletteCount = userDb.dailyStats.rouletteCount || 0
  if (userDb.dailyStats.rouletteCount >= 15) {
    return m.reply(`*⌬┤ 🚫 ├⌬ LIMITE DIÁRIO.*\n> Você já atingiu suas 15 jogadas de hoje. Volte amanhã.`)
  }

  const cooldown = 300000 
  const agora = Date.now()
  const r = agora - (userDb.lastRoulette || 0)

  if (r < cooldown) {
    const f = cooldown - r
    return m.reply(`*⌬┤ ⏳ ├⌬ MESA OCUPADA.*\n> Aguarde: *${Math.floor(f / 60000)}m ${Math.floor((f % 60000) / 1000)}s*.`)
  }

  const args = text.trim().split(/\s+/)
  const escolhaRaw = args[0]?.toLowerCase()
  const colorMap = { vermelho: 'rojo', red: 'rojo', preto: 'negro', black: 'negro', verde: 'verde', green: 'verde', rojo: 'rojo', negro: 'negro' }
  const eleccion = colorMap[escolhaRaw]
  const monto = parseInt(args[1])

  const helpTxt = `*╔═══⌦ ✦ 🎡 KURUMI CASINO ✦ ⌫═══╗*\n\n`
                + `> 🎰 *Uso:* ${usedPrefix + command} <opção> <valor>\n\n`
                + `*📊 OPÇÕES DISPONÍVEIS:*\n`
                + `> 🔴 *vermelho* (Multiplica x2)\n`
                + `> ⚫ *preto* (Multiplica x2)\n`
                + `> 🟢 *verde* (Multiplica x15)\n\n`
                + `*💰 LIMITES:* 100 - 10.000 ${config.CURRENCY_SYMBOL}\n`
                + `*📊 JOGADAS:* ${userDb.dailyStats.rouletteCount}/15\n`
                + `*╚══⌦ ${config.footer} ⌫══╝*`

  if (!escolhaRaw || isNaN(monto)) return m.reply(helpTxt)
  if (!eleccion) return m.reply('*⌬┤ ⚠️ ├⌬ OPÇÃO INVÁLIDA.* Use: vermelho, preto ou verde.')
  if (monto < 100 || monto > 10000) return m.reply(`*⌬┤ ⚠️ ├⌬ VALOR INVÁLIDO.* Entre 100 e 10.000 ${config.CURRENCY_NAME}.`)
  if (userDb.zenCoins < monto) return m.reply(`*⌬┤ ❌ ├⌬ SALDO INSUFICIENTE.*`)

  const rojo = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
  const num = Math.floor(Math.random() * 37)
  const colorGanador = num === 0 ? 'verde' : (rojo.includes(num) ? 'rojo' : 'negro')

  let gano = eleccion === colorGanador

  let sorteAmuleto = false
  if (!gano && userDb.inventory?.amulet === 'gambler' && Math.random() < 0.05) {
    gano = true
    sorteAmuleto = true
  }

  let mult = eleccion === 'verde' ? 15 : 2
  let ganancia = gano ? monto * (mult - 1) : -monto

  userDb.lastRoulette = agora
  userDb.dailyStats.rouletteCount += 1
  userDb.zenCoins += ganancia

  await User.updateOne({ jid: m.sender }, {
    $inc: { zenCoins: ganancia, "dailyStats.rouletteCount": 1 },
    $set: { lastRoulette: agora }
  })

  const ptColor = { rojo: 'VERMELHO', negro: 'PRETO', verde: 'VERDE' }
  
  let res = `*╔═══⌦ ✦ 🎰 RESULTADO ✦ ⌫═══╗*\n\n`
          + `> 🎢 *A bola girou e caiu em:* ${num} (${ptColor[colorGanador]})\n`
          + `> 👤 *Sua aposta:* ${monto} ${config.CURRENCY_SYMBOL} no **${ptColor[eleccion]}**\n\n`

  if (gano) {
    res += `*🎁 VOCÊ GANHOU!* Recebeu **${monto * mult}** ${config.CURRENCY_SYMBOL}\n`
    if (sorteAmuleto) res += `> 🎲 _Seu Amuleto do Apostador mudou sua sorte no último segundo!_\n`
    res += `> _Multiplicador aplicado: x${mult}_`
  } else {
    res += `*💀 VOCÊ PERDEU.* A casa ficou com seus **${monto}** ${config.CURRENCY_SYMBOL}\n`
  }

  res += `\n\n*📊 STATUS:* ${userDb.dailyStats.rouletteCount}/15 jogadas\n`
  res += `*╚══⌦ ${config.footer} ⌫══╝*`

  m.reply(res)
}

handler.help = ['roleta <opção> <valor>']
handler.tags = ['eco']
handler.command = ['ruleta', 'roleta', 'roulette', 'rt']
handler.register = true
export default handler