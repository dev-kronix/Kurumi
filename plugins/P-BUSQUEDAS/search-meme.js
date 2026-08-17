import axios from 'axios'
import { sendSmart } from '../../lib/serializer.js'
import fetch from 'node-fetch'
import config from '../../config.js'

const handler = async (m, { conn, command, usedPrefix, userDb }) => {
  await m.reply(`*⌬┤ ⏳ ├⌬ Buscando...*`)

  try {
    const res = await axios.get(`https://meme-api.com/gimme/memesenespanol`)
    const { title, url, postLink } = res.data
    const buf = Buffer.from(await fetch(url).then(r => r.arrayBuffer()))

    await sendSmart(conn, m, {
      image: buf,
      caption: `🎭 *Meme*\n[ 📛 ] *Título:* ${title}\n🔗 ${postLink}`,
      footer: global.botname || config.botName || 'Kurumi',
      buttons: [{ buttonId: `${usedPrefix}${command}`, buttonText: { displayText: '😂 Outro meme' } }],
      viewOnce: true,
      headerType: 4
    }, {}, userDb)

  } catch (e) {
    await m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível concluir a busca.`)
  }
}

handler.help = ['meme']
handler.command = ['meme', 'memardo', 'chiste', 'piada']
handler.tags = ['busquedas']

export default handler
