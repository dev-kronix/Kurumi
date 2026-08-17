import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const getMedal = (i) => {
  if (i === 0) return '🥇'
  if (i === 1) return '🥈'
  if (i === 2) return '🥉'
  return `*${i + 1}.*`
}

const handler = async (m, { conn, userDb }) => {
  if (!userDb) return

  const [topCoins, topKogen, posCoins, posKogen, allReg] = await Promise.all([
    User.find({ registered: true, zenCoins: { $gt: 0 } }, { jid: 1, zenCoins: 1, name: 1 }).sort({ zenCoins: -1 }).limit(10).lean(),
    User.find({ registered: true, kogen:    { $gt: 0 } }, { jid: 1, kogen: 1, name: 1    }).sort({ kogen:    -1 }).limit(10).lean(),
    User.countDocuments({ registered: true, zenCoins: { $gt: userDb.zenCoins } }),
    User.countDocuments({ registered: true, kogen:    { $gt: userDb.kogen    } }),
    User.find({ registered: true }, { zenCoins: 1, kogen: 1 }).lean()
  ])

  const totalCoins = allReg.reduce((sum, u) => sum + (u.zenCoins || 0), 0)
  const totalKogen = allReg.reduce((sum, u) => sum + (u.kogen || 0), 0)

  let txt = `*╔═══⌦ ✦ 🏆 RANKING GLOBAL ✦ ⌫═══╗*\n\n`

  if (topCoins.length > 0) {
    txt += `*⌬┤ ${config.CURRENCY_SYMBOL} MAIS RICOS EM ${config.CURRENCY_NAME.toUpperCase()} ├⌬*\n`
    topCoins.forEach((u, i) => {
      const medal = getMedal(i)
      const name = u.name || 'Visitante'
      txt += `> ${medal} ${name} (@${u.jid.split('@')[0]}) — ${u.zenCoins.toLocaleString('pt-BR')} ${config.CURRENCY_SYMBOL}\n`
    })
    txt += '\n'
  }

  if (topKogen.length > 0) {
    txt += `*⌬┤ ${config.PREMIUM_SYMBOL} MESTRES EM ${config.PREMIUM_NAME.toUpperCase()} ├⌬*\n`
    topKogen.forEach((u, i) => {
      const medal = getMedal(i)
      const name = u.name || 'Visitante'
      txt += `> ${medal} ${name} (@${u.jid.split('@')[0]}) — ${u.kogen.toLocaleString('pt-BR')} ${config.PREMIUM_SYMBOL}\n`
    })
    txt += '\n'
  }

  if (topCoins.length === 0 && topKogen.length === 0) {
    txt += `> _Ainda não há usuários registrados no ranking._\n\n`
  }

  txt += `*⌬┤ 📉 ESTATÍSTICAS DE CIRCULAÇÃO ├⌬*\n`
  txt += `> 🪙 ${config.CURRENCY_NAME} em circulação: ${totalCoins.toLocaleString('pt-BR')} ${config.CURRENCY_SYMBOL}\n`
  txt += `> ${config.PREMIUM_SYMBOL} ${config.PREMIUM_NAME} em circulação: ${totalKogen.toLocaleString('pt-BR')} ${config.PREMIUM_SYMBOL}\n\n`

  txt += `*━━━━━━━━━━━━━━━━━━━━*\n*📊 SUA POSIÇÃO ATUAL:*\n`
  txt += `> ${config.CURRENCY_SYMBOL} *${config.CURRENCY_NAME}:* Posição #${posCoins + 1}\n`
  txt += `> ${config.PREMIUM_SYMBOL} *${config.PREMIUM_NAME}:* Posição #${posKogen + 1}\n`
  txt += `*╚══⌦ ${config.footer} ⌫══╝*`

  const allMentions = [...new Set([...topCoins.map(u => u.jid), ...topKogen.map(u => u.jid)])]
  conn.sendMessage(m.chat, { text: txt, mentions: allMentions }, { quoted: m })
}

handler.help    = ['ranking']
handler.tags    = ['eco']
handler.command = ['lb', 'topcoins', 'topkogens', 'leaderboard', 'ranking', 'ricos']
handler.register = true
export default handler