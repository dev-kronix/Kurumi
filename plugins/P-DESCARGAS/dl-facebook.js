import fetch from 'node-fetch'
import config from '../../config.js'

const handler = async (m, { conn, text, usedPrefix, command, userDb }) => {
  let url = text ? text.trim() : ''
  if (!url && m.quoted) {
    const quotedText = m.quoted.body || m.quoted.text || ''
    const match = quotedText.match(/https?:\/\/[^\s]+/i)
    if (match) url = match[0]
  }

  if (!url) return m.reply(`*⌬┤ ✙ ├⌬ LINK OBRIGATÓRIO.*\n> Envie ou responda a uma mensagem com um link válido do Facebook.`)
  if (!/facebook\.com|fb\.watch/i.test(url)) return m.reply(`*⌬┤ ✙ ├⌬ LINK INVÁLIDO.*\n> Verifique se o link é do Facebook.`)
  if (userDb.kogen < 1) return m.reply(`*⌬┤ 💎 ├⌬ SEM ${config.PREMIUM_NAME.toUpperCase()}.*\n> Você não possui ${config.PREMIUM_NAME} suficiente para usar este comando.`)

  const chatId = m.chat
  await m.reply(`*⌬┤ 📥 ├⌬ Baixando vídeo do Facebook...*`)
  
  try {
    let videoUrl = null
    let caption = `*⌬┤ 📘 ├⌬ FACEBOOK*`

    try {
      const response = await fetch(`https://luxinfinity.vercel.app/api/facebook?url=${encodeURIComponent(url)}`)
      const json = await response.json()
      if (json.status && json.data) {
        const data = json.data
        videoUrl = data.hd || data.sd || null
        if (videoUrl) caption = `*⌬┤ 📘 ├⌬ FACEBOOK*\n> 📝 ${data.description || 'Sem descrição'}\n> ⏱️ *Duração:* ${data.duration || '—'}\n> 🎬 *Qualidade:* ${data.hd ? 'HD' : 'SD'}`
      }
    } catch {}

    if (!videoUrl) {
      try {
        const response = await fetch(`https://api.delirius.store/download/facebook?url=${encodeURIComponent(url)}`)
        const json = await response.json()
        if (json.status && Array.isArray(json.list) && json.list.length) {
          videoUrl = json.list[0].url
          if (videoUrl) caption = `*⌬┤ 📘 ├⌬ FACEBOOK*\n> 🎬 *Qualidade:* ${json.list[0].quality || 'SD'}`
        }
      } catch {}
    }

    if (!videoUrl) return m.reply(`*⌬┤ ✙ ├⌬ VÍDEO NÃO ENCONTRADO.*\n> Não encontrei um vídeo nesse link.`)
    
    const buf = Buffer.from(await (await fetch(videoUrl, { timeout: 60000 })).arrayBuffer())
    
    await conn.sendMessage(chatId, { video: buf, mimetype: 'video/mp4', caption }, { quoted: m })
    
    userDb.kogen -= 1
    await conn.sendMessage(chatId, { text: `${config.PREMIUM_SYMBOL} Você usou *1 ${config.PREMIUM_NAME}*` }, { quoted: m })
  } catch (e) { 
    m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível concluir o download. Tente novamente.`) 
  }
}

handler.help = [`fb <link> ${config.PREMIUM_SYMBOL}`]
handler.command = ['fbdl', 'fb', 'facebook', 'facebookdl']
handler.tags = ['descargas']

export default handler