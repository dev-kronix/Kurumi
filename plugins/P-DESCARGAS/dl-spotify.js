import fetch from 'node-fetch'
import config from '../../config.js'

const handler = async (m, { conn, text, usedPrefix, command, userDb }) => {
  let url = text ? text.trim() : ''
  if (!url && m.quoted) {
    const quotedText = m.quoted.body || m.quoted.text || ''
    const match = quotedText.match(/https?:\/\/[^\s]+/i)
    if (match) url = match[0]
  }

  if (!url) return m.reply(`*⌬┤ ❗ ├⌬ LINK INVÁLIDO.*\n> Exemplo: *${usedPrefix}${command} https://open.spotify.com/track/ID*`)
  if (!url.includes('spotify.com/track')) return m.reply(`*⌬┤ ❗ ├⌬ LINK INVÁLIDO.*\n> Verifique se é um link de música do Spotify.`)
  if (userDb.kogen < 1) return m.reply(`*⌬┤ 💎 ├⌬ SEM ${config.PREMIUM_NAME.toUpperCase()}.*\n> Você não possui ${config.PREMIUM_NAME} suficiente para usar este comando.`)

  const chatId = m.chat
  await m.reply(`*⌬┤ ⏳ ├⌬ Baixando música...*`)
  
  try {
    const response = await fetch(`https://luxinfinity.vercel.app/api/spotify?url=${encodeURIComponent(url)}`)
    const json = await response.json()

    if (!json.status || !json.data) return m.reply(`*⌬┤ ⚠️ ├⌬ Não foi possível obter a música pela API.*`)
    
    const data = json.data
    
    await conn.sendMessage(chatId, {
      image: { url: data.cover },
      caption: `*⌬┤ 🎵 ├⌬ ${data.name}*\n> 👤 *${data.artist}*\n> 💿 *${data.album}* (${data.year})\n> ⏱️ ${data.duration}`,
    }, { quoted: m })
    
    const buffer = Buffer.from(await (await fetch(data.mp3)).arrayBuffer())
    
    await conn.sendMessage(chatId, {
      document: buffer, 
      mimetype: 'audio/mpeg', 
      fileName: `${data.name} - ${data.artist}.mp3`, 
      caption: `🎶 ${data.name} — ${data.artist}`,
    }, { quoted: m })
    
    userDb.kogen -= 1
    await conn.sendMessage(chatId, { text: `${config.PREMIUM_SYMBOL} Você usou *1 ${config.PREMIUM_NAME}*` }, { quoted: m })

  } catch (e) { 
    m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível concluir o download. Tente novamente.`) 
  }
}

handler.help = [`spotify <link> ${config.PREMIUM_SYMBOL}`]
handler.command = ['spotify', 'sp', 'spotifymusic']
handler.tags = ['descargas']

export default handler