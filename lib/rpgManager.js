import User, { RANGOS } from './database/models/zen-users.js'
import config from '../config.js'

const xpBuffer = new Map()
let flushTimer = null

async function getBuffer(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch {
    return null
  }
}

function scheduleFlush() {
  if (flushTimer) return
  flushTimer = setTimeout(async () => {
    flushTimer = null
    const entries = [...xpBuffer.entries()]
    xpBuffer.clear()
    await Promise.allSettled(
      entries.map(([jid, xp]) => User.updateOne({ jid }, { $inc: { xp } }))
    )
  }, 10000)
}

export async function checkDailyReset(jid) {
  const agora = Date.now()

  const user = await User.findOne({ jid }, {
    registered: 1, dailyStats: 1, bankBalance: 1, bankExpiry: 1
  }).lean()

  if (!user?.registered) return null

  const needsDailyReset = agora - user.dailyStats.lastReset > 86400000
  const needsBankExpiry = user.bankBalance > 0 && user.bankExpiry > 0 && agora > user.bankExpiry

  if (!needsDailyReset && !needsBankExpiry) return null

  const updates = { $set: {} }

  if (needsDailyReset) {
    Object.assign(updates.$set, {
      'dailyStats.workCount': 0,
      'dailyStats.mineCount': 0,
      'dailyStats.crimeCount': 0,
      'dailyStats.rouletteCount': 0,
      'dailyStats.suitUsed': false,
      'dailyStats.maskUsed': false,
      'dailyStats.swordUsed': false,
      'dailyStats.buy_mythic': 0,
      'dailyStats.buy_rare': 0,
      'dailyStats.buy_normal': 0,
      'dailyStats.buy_sword': 0,
      'dailyStats.buy_potion': 0,
      'dailyStats.buy_shield': 0,
      'dailyStats.buy_suit': 0,
      'dailyStats.buy_mask': 0,
      'dailyStats.buy_amulet': 0,
      'dailyStats.buy_cosmetic': 0,
      'dailyStats.buy_legendary': 0,
      'dailyStats.transferToday': 0,
      'dailyStats.lastReset': agora,
    })
  }

  if (needsBankExpiry) {
    updates.$inc = { zenCoins: user.bankBalance }
    updates.$set.bankBalance = 0
    updates.$set.bankExpiry = 0
  }

  return User.findOneAndUpdate({ jid }, updates, { new: true })
}

export async function checkLevelUp(m, conn, userDb) {
  if (!userDb?.registered) return false

  const xpGanho = Math.floor(Math.random() * 16) + 15
  const xpNecessario = Math.floor(Math.pow(userDb.level, 1.5) * 100) + 200
  const subiuNivel = (userDb.xp + xpGanho) >= xpNecessario

  if (!subiuNivel) {
    xpBuffer.set(userDb.jid, (xpBuffer.get(userDb.jid) || 0) + xpGanho)
    scheduleFlush()
    return false
  }

  const recompensa = (userDb.level + 1) * 100
  const updatedUser = await User.findOneAndUpdate(
    { jid: userDb.jid },
    { $inc: { level: 1, zenCoins: recompensa }, $set: { xp: 0 } },
    { new: true }
  )

  const rankIndex = Math.min(updatedUser.level, RANGOS.length - 1)
  const rankAtual = RANGOS[rankIndex]

  let pfpUrl = await conn.profilePictureUrl(m.sender, 'image').catch(e => {
    console.error('[rpgManager] erro ao obter foto de perfil:', e.message)
    return null
  })
  if (!pfpUrl) pfpUrl = 'https://i.ibb.co/sphnd13T/images-4.jpg'
  const pfpBuffer = await getBuffer(pfpUrl)

  const upTxt = `*┏━━•❈ ✨ SUBIU DE NÍVEL ✨ ❈•━━┓*\n\n> 👤 *Usuário:* @${m.sender.split('@')[0]}\n> 🆙 *Novo nível:* ${updatedUser.level}\n> 🏆 *Patente:* ${rankAtual}\n> 🎁 *Prêmio:* ${recompensa} ${config.CURRENCY_NAME}\n\n*┗━━━━•❅•°•❈•°•❅•━━━━┛*`

  await conn.sendMessage(m.chat, { image: pfpBuffer || { url: pfpUrl }, caption: upTxt, mentions: [m.sender] }, { quoted: m })
    .catch(e => console.error('[rpgManager] erro ao enviar level up:', e.message))

  return updatedUser
}
