import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'
import { userCache } from '../../lib/caches.js'

const resolveTargetJid = (m, participants = []) => {
  const raw = m.mentionedJid?.[0] || m.quoted?.sender || null
  if (!raw) return null
  if (!raw.endsWith('@lid')) return raw
  const p = participants.find(p => p.id === raw || p.lid === raw)
  if (p?.phoneNumber) return `${String(p.phoneNumber).replace(/\D/g, '')}@s.whatsapp.net`
  if (p?.id?.includes('@s.whatsapp.net')) return p.id
  return raw
}

const handler = async (m, { text, participants }) => {
  const target = resolveTargetJid(m, participants)
  if (!target) {
    return m.reply(`*⌬┤ ⚠️ ├⌬ MARQUE OU RESPONDA A UM USUÁRIO.*\n\n> Exemplo: *!seteco @usuario 5000 10*\n> _Ordem: ${config.CURRENCY_NAME} | ${config.PREMIUM_NAME}_`)
  }

  const limpio = text.replace(/@\d+/g, '').trim().split(/\s+/)
  const coins = parseInt(limpio[0])
  const kogen = parseInt(limpio[1])

  if (isNaN(coins) || coins < 0) return m.reply(`*⌬┤ ❌ ├⌬ Informe uma quantidade válida de ${config.CURRENCY_NAME}.*`)
  if (isNaN(kogen) || kogen < 0) return m.reply(`*⌬┤ ❌ ├⌬ Informe uma quantidade válida de ${config.PREMIUM_NAME}.*`)

  let user = await User.findOne({ jid: target })
  if (!user) return m.reply('*⌬┤ ❌ ├⌬ USUÁRIO NÃO CADASTRADO.*')

  user.zenCoins = coins
  user.kogen = kogen
  await user.save()

  const targetNum = target.split('@')[0]
  const c1 = userCache.get(target)
  const c2 = userCache.get(targetNum)
  if (c1) { c1.zenCoins = coins; c1.kogen = kogen }
  if (c2 && c2 !== c1) { c2.zenCoins = coins; c2.kogen = kogen }

  m.reply(`*╔═══⌦ ✦ 🛠️ ECONOMIA MODIFICADA ✦ ⌫═══╗*\n\n> 👤 *Usuário:* @${targetNum}\n> ${config.CURRENCY_SYMBOL} *${config.CURRENCY_NAME}:* ${coins.toLocaleString('pt-BR')}\n> ${config.PREMIUM_SYMBOL} *${config.PREMIUM_NAME}:* ${kogen.toLocaleString('pt-BR')}\n\n*╚══⌦ ${config.footer} ⌫══╝*`, { mentions: [target] })
}

handler.help = ['seteco @usuario <coins> <kogen>']
handler.tags = ['owner']
handler.command = ['seteco', 'seteconomia']
handler.ownerOnly = true
handler.noRegister = true

export default handler