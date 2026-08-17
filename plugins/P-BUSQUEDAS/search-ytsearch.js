import axios from 'axios'
import config from '../../config.js'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*⌬┤ ⚠️ ├⌬ PARÂMETRO OBRIGATÓRIO.*\n\n> Digite o nome da música ou vídeo que deseja buscar.\n> Exemplo: *${usedPrefix + command} Sia Chandelier*`)
  }

  try {
    const apiRes = await axios.get(`https://luxinfinity.vercel.app/api/search/youtube?query=${encodeURIComponent(text)}&limit=10`, {
      timeout: 15000
    })

    if (!apiRes.data || apiRes.data.status !== true || !Array.isArray(apiRes.data.data) || apiRes.data.data.length === 0) {
      return m.reply(`*⌬┤ 🔍 ├⌬ SEM RESULTADOS.*\n\n> Não encontrei vídeos correspondentes à pesquisa: *"${text}"*.`)
    }

    const videos = apiRes.data.data
    const primerVideo = videos[0]

    let txt = `*╔═══⌦ ✦ 🔍 PESQUISA NO YOUTUBE ✦ ⌫═══╗*\n\n`
    txt += `> 🔎 *Pesquisa:* ${text}\n`
    txt += `> 📊 *Resultados:* ${videos.length}\n\n`

    videos.forEach((v, i) => {
      txt += `*${i + 1}.* ${v.title}\n`
      txt += `   🔗 *Link:* ${v.url}\n`
      txt += `   ⏱️ *Duração:* ${v.duration?.text || '---'} │ 👁️ *Visualizações:* ${v.views || '---'}\n`
      txt += `   👤 *Canal:* ${v.author?.name || '---'} │ 📅 *Publicado:* ${v.publishDate || '---'}\n\n`
    })

    txt += `*╚══⌦ ${config.footer} ⌫══╝*`

    if (primerVideo.thumb) {
      await conn.sendMessage(
        m.chat,
        { image: { url: primerVideo.thumb }, caption: txt },
        { quoted: m }
      )
    } else {
      await conn.sendMessage(
        m.chat,
        { text: txt },
        { quoted: m }
      )
    }

  } catch (e) {
    console.error('[YTSEARCH ERROR]', e.message)
    m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n\n> Ocorreu um erro ao pesquisar no YouTube. Tente novamente em instantes.`)
  }
}

handler.help = ['ytsearch <pesquisa>']
handler.tags = ['busquedas']
handler.command = ['yts', 'ytsearch', 'youtube', 'buscarvideo']
handler.register = true

export default handler