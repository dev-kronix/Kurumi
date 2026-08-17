import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const handler = async (m, { text, usedPrefix, command }) => {
  const target = m.mentionedJid?.[0] || m.quoted?.sender || null
  if (!target) return m.reply(`*⌬┤ ✙ ├⌬ USUÁRIO OBRIGATÓRIO.*\n> Mencione ou responda ao usuário que terá a economia redefinida.`)

  const confirm = (text || '').toLowerCase().includes('confirmar') || (text || '').toLowerCase().includes('confirm')
  if (!confirm) {
    return m.reply(`*⌬┤ ⚠️ ├⌬ CONFIRMAÇÃO NECESSÁRIA.*\n> Esta ação redefine moedas, banco, Kōgen, inventário e estatísticas econômicas.\n> Use: *${usedPrefix}${command} @usuario confirmar*`)
  }

  const num = target.split('@')[0].split(':')[0].replace(/\D/g, '')
  const user = await User.findOne({ jid: { $regex: `^${num}@` } })
  if (!user) return m.reply(`*⌬┤ ❌ ├⌬ USUÁRIO NÃO CADASTRADO.*`)

  await User.updateOne({ _id: user._id }, {
    $set: {
      zenCoins: 100,
      bankBalance: 0,
      bankExpiry: 0,
      kogen: 15,
      bestiary: {},
      aquarium: {},
      shopStock: {},
      inventory: {
        pickaxe: 'none', pickaxeDurability: 0,
        bow: 'none', bowDurability: 0,
        bait: 'none', baitDurability: 0,
        sword: 0, swordTier: 'none', swordUses: 0,
        potion: 0, potionTier: 'none', potionStock: {},
        shield: 0, shieldStock: {}, amulet: 'none',
        suit: false, mask: false, title: '', titles: [], badges: []
      },
      dailyStats: {
        lastReset: Date.now(), workCount: 0, mineCount: 0, crimeCount: 0, rouletteCount: 0,
        suitUsed: false, maskUsed: false, buy_mythic: 0, buy_rare: 0, buy_normal: 0,
        buy_legendary: 0, buy_sword: 0, buy_potion: 0, buy_shield: 0, buy_suit: 0,
        buy_mask: 0, buy_amulet: 0, buy_cosmetic: 0, transferToday: 0
      }
    }
  })

  m.reply(`*⌬┤ ✅ ├⌬ ECONOMIA REDEFINIDA.*\n> 👤 @${num}\n> 🪙 ${config.CURRENCY_NAME}: 100\n> ${config.PREMIUM_SYMBOL} ${config.PREMIUM_NAME}: 15\n> Inventário e coleções foram limpos.`, { mentions: [target] })
}

handler.help = ['reseteco @usuario confirmar']
handler.command = ['reseteco', 'resetarconomia', 'resetareconomia']
handler.tags = ['owner']
handler.ownerOnly = true
handler.noRegister = true

export default handler