import config from '../../config.js'

const normalizeToTag = (name) => {
  return name
    .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

const handler = async (m, { conn, command, userDb }) => {
  if (!userDb) return

  const isBestiary = ['bestiario', 'bestiary', 'cazas', 'cacas'].includes(command)
  const collection = isBestiary ? userDb.bestiary : userDb.aquarium
  const title = isBestiary ? 'BESTIÁRIO' : 'AQUÁRIO'
  const emoji = isBestiary ? '🐾' : '🐟'
  const action = isBestiary ? 'caçar' : 'pescar'

  let items = []

  if (collection) {
    if (collection instanceof Map) {
      items = Array.from(collection.entries())
    } else if (typeof collection.toJSON === 'function') {
      items = Object.entries(collection.toJSON())
    } else {
      items = Object.entries(collection)
    }
  }

  items = items.filter(([key]) => !key.startsWith('$') && !key.startsWith('_') && key !== 'init')

  if (items.length === 0) return m.reply(`*⌬┤ ${emoji} ├⌬ SEU ${title} ESTÁ VAZIO.*\n> Vá ${action} alguma coisa para começar sua coleção!`)

  items.sort((a, b) => b[1] - a[1])

  let txt = `*╔═══⌦ ✦ ${emoji} ${title} ✦ ⌫═══╗*\n\n`
  txt += `> 👤 *Dono:* @${m.sender.split('@')[0]}\n`
  txt += `> 📊 *Descobertas:* ${items.length}\n\n`
  txt += `*📜 LISTA DE CAPTURAS:*\n`

  items.forEach(([name, count]) => {
    const tag = normalizeToTag(name)
    txt += `> *${name}* \`[${tag}]\` — x${count}\n`
  })
  txt += `\n> 💡 _Venda suas capturas usando o comando *!contratos* para receber boas quantias de ${config.CURRENCY_NAME} e ${config.PREMIUM_NAME}!_\n`
  txt += `*╚══⌦ ${config.footer} ⌫══╝*`
  
  await conn.sendMessage(m.chat, { text: txt, mentions: [m.sender] }, { quoted: m })
}

handler.help = ['bestiario', 'aquario']
handler.tags = ['eco']
handler.command = ['bestiario', 'bestiary', 'cazas', 'cacas', 'pecera', 'peces', 'aquarium', 'aquario', 'peixes']
handler.register = true

export default handler