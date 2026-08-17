import config from '../../config.js'

const TIER_LABEL = {
  none: '❌ Nenhum',
  normal: '⚪ Normal',
  rare: '🟣 Raro',
  mythic: '🟠 Mítico',
  legendary: '🌟 Lendário'
}

const AMULET_LABEL = {
  none: '❌ Nenhum',
  fortune: '🍀 Amuleto da Fortuna (+10% trabalho/crime)',
  thief: '🥷 Amuleto do Ladrão (+10% roubo)',
  miner: '⛏️ Amuleto do Minerador (+10% itens raros)',
  gambler: '🎲 Amuleto do Apostador (+5% apostas)'
}

const TITLE_LABEL = {
  title_cazador: '🏷️ O Caçador',
  title_magnate: '🏷️ Magnata',
  title_legendario: '🏷️ Lenda Viva',
  title_sombra: '🏷️ Sombra'
}

const BADGE_LABEL = {
  relic_corona: '👑 Coroa do Vazio',
  relic_orbe: '🔮 Orbe dos Ancestrais',
  relic_fenix: '🐦‍🔥 Pena de Fênix'
}

const getTier = (tier) => TIER_LABEL[tier] || '❌ Nenhum'

const handler = async (m, { conn, userDb }) => {
  if (!userDb) return
  const inv = userDb.inventory

  const pfp = await conn.profilePictureUrl(m.sender, 'image').catch(() => 'https://i.ibb.co/nNkgRQjK/images-4.jpg')

  const potionStock = inv.potionStock instanceof Map ? Object.fromEntries(inv.potionStock) : (inv.potionStock || {})
  const shieldStock = inv.shieldStock instanceof Map ? Object.fromEntries(inv.shieldStock) : (inv.shieldStock || {})

  const potionLine = ['normal', 'rare', 'mythic']
    .map(t => potionStock[t] > 0 ? `${TIER_LABEL[t].split(' ')[0]}${potionStock[t]}` : null)
    .filter(Boolean)
    .join(' │ ') || '—'

  const shieldLine = ['normal', 'rare', 'mythic']
    .map(t => shieldStock[t] > 0 ? `${TIER_LABEL[t].split(' ')[0]}${shieldStock[t]}` : null)
    .filter(Boolean)
    .join(' │ ') || '—'

  const tituloEquipado = inv.title ? (TITLE_LABEL[inv.title] || inv.title) : '❌ Nenhum'
  const titulosDesbloqueados = (inv.titles || []).length
  const badges = (inv.badges || []).map(b => BADGE_LABEL[b] || b)

  let txt = `*╔═══⌦ ✦ 🎒 MINHA MOCHILA ✦ ⌫═══╗*\n\n`
          + `> 👤 *Usuário:* @${m.sender.split('@')[0]}\n`
          + `> ${config.PREMIUM_SYMBOL} *${config.PREMIUM_NAME}:* ${userDb.kogen} ${config.PREMIUM_SYMBOL}\n`
          + `> 🏷️ *Título:* ${tituloEquipado}${titulosDesbloqueados > 1 ? ` _(+${titulosDesbloqueados - 1} desbloqueados)_` : ''}\n\n`

          + `*⌬┤ ⚒️ FERRAMENTAS ├⌬*\n`
          + `> ⛏️ *Picareta:* ${getTier(inv.pickaxe)} (${inv.pickaxeDurability} usos)\n`
          + `> 🏹 *Arco:* ${getTier(inv.bow)} (${inv.bowDurability} usos)\n`
          + `> 🎣 *Vara:* ${getTier(inv.bait)} (${inv.baitDurability} usos)\n\n`

          + `*⌬┤ ⚔️ ARSENAL ├⌬*\n`
          + `> 🗡️ *Espada equipada:* ${getTier(inv.swordTier)}${inv.swordUses > 0 ? ` (${inv.swordUses} usos)` : ''}\n`
          + `> 🧪 *Poções:* ${potionLine}\n`
          + `> 🛡️ *Escudos:* ${shieldLine}\n\n`

          + `*⌬┤ 🔱 AMULETO ├⌬*\n`
          + `> ${AMULET_LABEL[inv.amulet] || AMULET_LABEL.none}\n\n`

          + `*⌬┤ ✨ BÔNUS PERMANENTES ├⌬*\n`
          + `> 👔 *Capa Magnata:* ${inv.suit ? '✅ Ativa' : '❌ Não possui'}\n`
          + `> 👺 *Máscara Hacker:* ${inv.mask ? '✅ Ativa' : '❌ Não possui'}\n\n`

  if (badges.length) {
    txt += `*⌬┤ 💎 RELÍQUIAS ├⌬*\n`
         + badges.map(b => `> ${b}`).join('\n') + `\n\n`
  }

  txt += `*⌬┤ 🏦 STATUS BANCÁRIO ├⌬*\n`
       + `> 🛡️ *Proteção:* ${userDb.bankExpiry > Date.now() ? 'Protegido ✅' : 'Exposto ⚠️'}\n`
       + `> 💳 *Saldo:* ${userDb.bankBalance} ${config.CURRENCY_SYMBOL}\n\n`
       + `*╚══⌦ ${config.footer} ⌫══╝*`

  await conn.sendMessage(m.chat, { image: { url: pfp }, caption: txt, mentions: [m.sender] }, { quoted: m })
}

handler.help = ['mochila']
handler.tags = ['eco']
handler.command = ['inv', 'mochila', 'inventario']
handler.register = true
export default handler
