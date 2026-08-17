import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const items = [
  { id: 'p_normal',  n: '⚒️ Picareta Normal',     v: 4000,  cat: 'normal',    lim: 8, dur: 10, sec: 'tools', desc: 'Melhora suas chances ao minerar.' },
  { id: 'p_rare',    n: '✨ Picareta Rara',        v: 12000, cat: 'rare',      lim: 5, dur: 5,  sec: 'tools', desc: 'Aumenta a chance de encontrar minerais raros.' },
  { id: 'p_mythic',  n: '🌌 Picareta Mítica',      v: 35000, cat: 'mythic',    lim: 2, dur: 3,  sec: 'tools', desc: 'Desbloqueia minerais míticos.' },

  { id: 'h_normal',  n: '🏹 Arco de Madeira',      v: 3500,  cat: 'normal',    lim: 8, dur: 8,  sec: 'tools', desc: 'Melhora suas caçadas básicas.' },
  { id: 'h_rare',    n: '🏹 Arco Composto',        v: 11000, cat: 'rare',      lim: 5, dur: 5,  sec: 'tools', desc: 'Permite encontrar presas mais valiosas.' },
  { id: 'h_mythic',  n: '🏹 Arco de Ártemis',      v: 30000, cat: 'mythic',    lim: 2, dur: 2,  sec: 'tools', desc: 'A elite da caça.' },

  { id: 'f_normal',  n: '🪱 Isca de Minhoca',      v: 2500,  cat: 'normal',    lim: 8, dur: 15, sec: 'tools', desc: 'Melhora a pesca básica.' },
  { id: 'f_rare',    n: '✨ Isca Dourada',          v: 9000,  cat: 'rare',      lim: 5, dur: 8,  sec: 'tools', desc: 'Atrai peixes raros.' },
  { id: 'f_mythic',  n: '🌌 Essência de Kraken',    v: 22000, cat: 'mythic',    lim: 2, dur: 4,  sec: 'tools', desc: 'Atrai criaturas lendárias.' },

  { id: 'sword_normal',    n: '⚔️ Espada da Honra',       v: 3000,   cat: 'sword',     lim: 5, sec: 'swords', dur: 1, buff: 1.15, desc: '+15% de dano em duelos · 1 uso' },
  { id: 'sword_rare',      n: '🗡️ Espada Encantada',      v: 9500,   cat: 'sword',     lim: 4, sec: 'swords', dur: 2, buff: 1.30, desc: '+30% de dano em duelos · 2 usos' },
  { id: 'sword_mythic',    n: '🌌 Espada do Vazio',        v: 28000,  cat: 'sword',     lim: 2, sec: 'swords', dur: 3, buff: 1.50, desc: '+50% de dano em duelos · 3 usos' },
  { id: 'sword_legendary', n: '🔥 Excalibur Reforjada',   v: 120000, cat: 'legendary', lim: 1, sec: 'swords', dur: 5, buff: 1.80, desc: '+80% de dano em duelos · 5 usos' },

  { id: 'potion_normal', n: '🧪 Poção de Vida',       v: 2500,  cat: 'potion', lim: 5, sec: 'potions', buff: 200, desc: '+200 PV no próximo duelo' },
  { id: 'potion_rare',   n: '💉 Elixir Maior',        v: 7000,  cat: 'potion', lim: 4, sec: 'potions', buff: 350, desc: '+350 PV no próximo duelo' },
  { id: 'potion_mythic', n: '🌟 Néctar Divino',       v: 18000, cat: 'potion', lim: 2, sec: 'potions', buff: 600, desc: '+600 PV no próximo duelo' },

  { id: 'shield_normal', n: '🛡️ Escudo de Energia',   v: 1500,  cat: 'shield', lim: 6, sec: 'shields', desc: 'Bloqueia 1 tentativa de roubo' },
  { id: 'shield_rare',   n: '🔰 Escudo Reforçado',    v: 4500,  cat: 'shield', lim: 4, sec: 'shields', desc: 'Bloqueia 1 roubo e penaliza o ladrão em 5%' },
  { id: 'shield_mythic', n: '✨ Aegis Arcano',        v: 13000, cat: 'shield', lim: 2, sec: 'shields', desc: 'Bloqueia 1 roubo e penaliza o ladrão em 15%' },

  { id: 'amulet_fortune', n: '🍀 Amuleto da Fortuna',    v: 40000, cat: 'amulet', lim: 1, sec: 'amulets', desc: '+10% de ganhos em trabalho e crime' },
  { id: 'amulet_thief',   n: '🥷 Amuleto do Ladrão',     v: 45000, cat: 'amulet', lim: 1, sec: 'amulets', desc: '+10% de chance de sucesso ao roubar' },
  { id: 'amulet_miner',   n: '⛏️ Amuleto do Minerador',  v: 45000, cat: 'amulet', lim: 1, sec: 'amulets', desc: '+10% de chance de itens raros ao minerar' },
  { id: 'amulet_gambler', n: '🎲 Amuleto do Apostador',  v: 50000, cat: 'amulet', lim: 1, sec: 'amulets', desc: '+5% de chance de ganhar em roleta/slots' },

  { id: 'suit', n: '👔 Capa de Magnata',  v: 5000, cat: 'suit', lim: 5, sec: 'cosmetics', desc: 'Concede bônus no comando !trabalhar (1 vez por dia)' },
  { id: 'mask', n: '👺 Máscara Hacker',    v: 7500, cat: 'mask', lim: 5, sec: 'cosmetics', desc: 'Garante sucesso no próximo crime (1 vez por dia)' },

  { id: 'title_cazador',    n: '🏷️ Título: "O Caçador"',    v: 6000,  cat: 'cosmetic', lim: 3, sec: 'titles', desc: 'Exibe seu título em !mochila e !perfil' },
  { id: 'title_magnate',    n: '🏷️ Título: "Magnata"',      v: 15000, cat: 'cosmetic', lim: 3, sec: 'titles', desc: 'Para os mais ricos do servidor' },
  { id: 'title_legendario', n: '🏷️ Título: "Lenda Viva"',  v: 50000, cat: 'cosmetic', lim: 1, sec: 'titles', desc: 'Para os jogadores mais dedicados' },
  { id: 'title_sombra',     n: '🏷️ Título: "Sombra"',       v: 20000, cat: 'cosmetic', lim: 2, sec: 'titles', desc: 'Para os mestres da furtividade' },

  { id: 'relic_corona', n: '👑 Coroa do Vazio',       v: 150000, cat: 'legendary', lim: 1, sec: 'relics', desc: 'Relíquia colecionável · insígnia exclusiva' },
  { id: 'relic_orbe',   n: '🔮 Orbe dos Ancestrais',  v: 90000,  cat: 'legendary', lim: 1, sec: 'relics', desc: 'Relíquia colecionável · insígnia exclusiva' },
  { id: 'relic_fenix',  n: '🐦‍🔥 Pena de Fênix',      v: 120000, cat: 'legendary', lim: 1, sec: 'relics', desc: 'Relíquia colecionável · insígnia exclusiva' },
]

const SECCIONES = [
  { key: 'tools',     titulo: '⚒️ FERRAMENTAS' },
  { key: 'swords',    titulo: '⚔️ ARSENAL · ESPADAS' },
  { key: 'potions',   titulo: '🧪 ARSENAL · POÇÕES' },
  { key: 'shields',   titulo: '🛡️ ARSENAL · ESCUDOS' },
  { key: 'amulets',   titulo: '🔱 AMULETOS' },
  { key: 'cosmetics', titulo: '✨ BÔNUS ESPECIAIS' },
  { key: 'titles',    titulo: '🏷️ TÍTULOS' },
  { key: 'relics',    titulo: '💎 RELÍQUIAS MÍTICAS' },
]

const handler = async (m, { text, usedPrefix, command, userDb }) => {
  if (!userDb) return

  if (!text) {
    let txt = `*╔═══⌦ ✦ 🛒 KURUMI SHOP ✦ ⌫═══╗*\n`

    let n = 1
    for (const sec of SECCIONES) {
      const secItems = items.filter(it => it.sec === sec.key)
      if (!secItems.length) continue
      txt += `\n*┄┄┄┄ ${sec.titulo} ┄┄┄┄*\n`
      for (const item of secItems) {
        const currentPurchases = userDb.dailyStats[`buy_${item.cat}`] || 0
        txt += `*${n}.* ${item.n} [${currentPurchases}/${item.lim}]\n`
        txt += `   💰 ${item.v.toLocaleString('pt-BR')} ${config.CURRENCY_NAME}`
        if (item.desc) txt += ` — _${item.desc}_`
        txt += `\n`
        n++
      }
    }

    txt += `\n*Uso:* ${usedPrefix + command} <número>`
    return m.reply(txt + `\n*╚══⌦ ${config.footer} ⌫══╝*`)
  }

  const i = parseInt(text) - 1
  const item = items[i]
  if (!item) return m.reply('*⌬┤ ⚠️ · Item inválido.*')

  const currentCount = userDb.dailyStats[`buy_${item.cat}`] || 0
  if (currentCount >= item.lim) {
    return m.reply(`*⌬┤ 🚫 ├⌬ LIMITE ATINGIDO.*\n> Você já comprou o limite desta categoria hoje (${item.lim}/${item.lim}).`)
  }

  if (userDb.zenCoins < item.v) return m.reply('*⌬┤ ❌ · SALDO INSUFICIENTE.*')

  if (['suit', 'mask'].includes(item.id) && userDb.inventory[item.id]) {
    return m.reply('*⌬┤ ⚠️ · Você já possui este item equipado. Use-o primeiro.*')
  }
  if (item.sec === 'amulets' && userDb.inventory.amulet !== 'none') {
    return m.reply(`*⌬┤ ⚠️ · Você já possui um amuleto equipado (${userDb.inventory.amulet}). Compre outro tipo para substituí-lo ou consulte !inventario.*`)
  }
  if (item.sec === 'titles' && userDb.inventory.titles?.includes(item.id)) {
    return m.reply('*⌬┤ ⚠️ · Você já desbloqueou este título.*')
  }
  if (item.sec === 'relics' && userDb.inventory.badges?.includes(item.id)) {
    return m.reply('*⌬┤ ⚠️ · Você já possui esta relíquia.*')
  }

  const update = { $inc: { zenCoins: -item.v, [`dailyStats.buy_${item.cat}`]: 1 }, $set: {} }
  userDb.zenCoins -= item.v
  userDb.dailyStats[`buy_${item.cat}`] = (userDb.dailyStats[`buy_${item.cat}`] || 0) + 1

  if (item.id.startsWith('p_')) {
    const pType = item.id.split('_')[1]
    update.$set['inventory.pickaxe'] = pType
    update.$set['inventory.pickaxeDurability'] = item.dur
    userDb.inventory.pickaxe = pType; userDb.inventory.pickaxeDurability = item.dur

  } else if (item.id.startsWith('h_')) {
    const hType = item.id.split('_')[1]
    update.$set['inventory.bow'] = hType
    update.$set['inventory.bowDurability'] = item.dur
    userDb.inventory.bow = hType; userDb.inventory.bowDurability = item.dur

  } else if (item.id.startsWith('f_')) {
    const fType = item.id.split('_')[1]
    update.$set['inventory.bait'] = fType
    update.$set['inventory.baitDurability'] = item.dur
    userDb.inventory.bait = fType; userDb.inventory.baitDurability = item.dur

  } else if (item.id.startsWith('sword_')) {
    const tier = item.id.split('_')[1]
    update.$set['inventory.swordTier'] = tier
    update.$set['inventory.swordUses'] = item.dur
    userDb.inventory.swordTier = tier; userDb.inventory.swordUses = item.dur
    update.$set['inventory.sword'] = 1
    userDb.inventory.sword = 1

  } else if (item.id.startsWith('potion_')) {
    const tier = item.id.split('_')[1]
    update.$inc[`inventory.potionStock.${tier}`] = 1
    if (!userDb.inventory.potionStock) userDb.inventory.potionStock = {}
    userDb.inventory.potionStock[tier] = (userDb.inventory.potionStock[tier] || 0) + 1
    update.$inc['inventory.potion'] = 1
    userDb.inventory.potion = (userDb.inventory.potion || 0) + 1

  } else if (item.id.startsWith('shield_')) {
    const tier = item.id.split('_')[1]
    update.$inc[`inventory.shieldStock.${tier}`] = 1
    if (!userDb.inventory.shieldStock) userDb.inventory.shieldStock = {}
    userDb.inventory.shieldStock[tier] = (userDb.inventory.shieldStock[tier] || 0) + 1
    update.$inc['inventory.shield'] = 1
    userDb.inventory.shield = (userDb.inventory.shield || 0) + 1

  } else if (item.id.startsWith('amulet_')) {
    const tipo = item.id.split('_')[1]
    update.$set['inventory.amulet'] = tipo
    userDb.inventory.amulet = tipo

  } else if (['suit', 'mask'].includes(item.id)) {
    update.$set[`inventory.${item.id}`] = true
    userDb.inventory[item.id] = true

  } else if (item.id.startsWith('title_')) {
    update.$push = { 'inventory.titles': item.id }
    if (!userDb.inventory.titles) userDb.inventory.titles = []
    userDb.inventory.titles.push(item.id)
    if (!userDb.inventory.title) {
      update.$set['inventory.title'] = item.id
      userDb.inventory.title = item.id
    }

  } else if (item.id.startsWith('relic_')) {
    update.$push = { 'inventory.badges': item.id }
    if (!userDb.inventory.badges) userDb.inventory.badges = []
    userDb.inventory.badges.push(item.id)

  } else {
    update.$inc[`inventory.${item.id}`] = 1
    userDb.inventory[item.id] = (userDb.inventory[item.id] || 0) + 1
  }

  if (Object.keys(update.$set).length === 0) delete update.$set
  await User.updateOne({ jid: m.sender }, update)

  m.reply(`*⌬┤ ✅ ├⌬ COMPRA CONCLUÍDA*\n> Você adquiriu: *${item.n}*\n> _Limite diário: ${userDb.dailyStats[`buy_${item.cat}`]}/${item.lim}_`)
}

handler.help = ['loja', 'shop', 'buy']
handler.tags = ['eco']
handler.command = ['shop', 'tienda', 'loja', 'buy', 'comprar']
handler.register = true
export default handler