import crypto from 'crypto'
import User from '../../lib/database/models/zen-users.js'
import { userCache } from '../../lib/caches.js'
import config from '../../config.js'

const Reg = /\|?(.*)([.|] *?)([0-9]*)$/i

async function getBuffer(url) {
  try {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch {
    return null
  }
}

const handler = async (m, { conn, text, usedPrefix, command, userDb }) => {
  if (userDb?.registered) return m.reply('*⌬┤ ✙ · VOCÊ JÁ ESTÁ CADASTRADO(A).*')
  if (!Reg.test(text)) return m.reply(`*⌬┤ ✙ ├⌬ FORMATO:* ${usedPrefix + command} nome.idade`)

  let [, name, , age] = text.match(Reg)
  name = name.trim()
  age = parseInt(age)

  if (name.length >= 30 || age > 100 || age < 5) return m.reply('*⌬┤ ⚠️ · DADOS INVÁLIDOS.*')

  const sn = crypto.createHash('md5').update(m.sender + Date.now()).digest('hex').slice(0, 10).toUpperCase()
  const isFirstTime = !userDb || !userDb.everRegistered
  const num = m.sender.split('@')[0].split(':')[0].replace(/\D/g, '')
  const jidCanon = `${num}@s.whatsapp.net`

  const updateData = {
    name,
    age,
    registered: true,
    everRegistered: true,
    serial: sn
  }

  if (isFirstTime) {
    updateData.zenCoins = 1500
    updateData.kogen = 5
    updateData['dailyStats.lastReset'] = Date.now()
  }

  const updatedUser = await User.findOneAndUpdate(
    { jid: { $regex: `^${num}@` } },
    { $set: { ...updateData, jid: jidCanon } },
    { upsert: true, new: true }
  )

  if (updatedUser) {
    userCache.set(jidCanon, updatedUser)
    userCache.set(num, updatedUser)
  }

  const rewardText = isFirstTime
    ? `*🎁 RECOMPENSA INICIAL:*\n> 🪙 1500 ${config.CURRENCY_NAME}\n> ✨ 5 Kōgen`
    : '*🎁 RECOMPENSA:*\n> Bem-vindo(a) de volta!\n> _(A recompensa inicial é entregue apenas uma vez.)_'

  let pfpUrl = await conn.profilePictureUrl(m.sender, 'image').catch(() => null)
  if (!pfpUrl) pfpUrl = 'https://i.ibb.co/sphnd13T/images-4.jpg'
  const pfpBuffer = await getBuffer(pfpUrl)

  const caption = `*┏━•❈✅ CADASTRO CONCLUÍDO*\n\n> 👤 *Nome:* ${name}\n> 🎂 *Idade:* ${age} anos\n> 🔐 *Serial:* ${sn}\n\n${rewardText}\n\n*┗━━━━•❅•°•❈*`

  await conn.sendMessage(m.chat, { image: pfpBuffer || { url: pfpUrl }, caption, mentions: [m.sender] }, { quoted: m })
}

handler.help = ['reg <nome.idade>']
handler.tags = ['registro']
handler.command = ['reg', 'verificar', 'verify', 'registrar', 'cadastrar']
export default handler
