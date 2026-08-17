import fetch from 'node-fetch'
import config from '../../config.js'

const handler = async (m, { conn, text, usedPrefix, command, userDb }) => {
  let url = text ? text.trim() : ''
  if (!url && m.quoted) {
    const quotedText = m.quoted.body || m.quoted.text || ''
    const match = quotedText.match(/https?:\/\/[^\s]+/i)
    if (match) url = match[0]
  }

  if (!url) return m.reply(`*⌬┤ ❗ ├⌬ LINK OBRIGATÓRIO.*\n> Envie ou responda a uma mensagem com um link válido do Pinterest.`)
  if (!url.includes('pinterest.com') && !url.includes('pin.it')) {
    return m.reply(`*⌬┤ ❗ ├⌬ LINK INVÁLIDO.*\n> Verifique se o link é do Pinterest.`)
  }
  if (userDb.kogen < 1) return m.reply(`*⌬┤ 💎 ├⌬ SEM ${config.PREMIUM_NAME.toUpperCase()}.*\n> Você não possui ${config.PREMIUM_NAME} suficiente para usar este comando.`)

  const chatId = m.chat
  await m.reply(`*⌬┤ ⏳ ├⌬ Buscando e baixando conteúdo do Pinterest...*`)

  try {
    let videoUrl = null
    let imageUrl = null

    try {
      const res = await fetch(`https://luxinfinity.vercel.app/api/pinterest?url=${encodeURIComponent(url)}`)
      const result = await res.json()
      if (result.status && result.data) {
        videoUrl = result.data.video || null
        imageUrl = result.data.images?.orig || result.data.image || null
      }
    } catch {}

    if (!videoUrl) {
      try {
        const res = await fetch(`https://api.delirius.store/download/pinterestdl?url=${encodeURIComponent(url)}`)
        const result = await res.json()
        if (result.status && result.data?.download?.url) {
          const dl = result.data.download
          if (dl.type === 'video') videoUrl = dl.url
          else imageUrl = imageUrl || dl.url
        }
      } catch {}
    }

    if (!videoUrl && !imageUrl) {
      return m.reply(`*⌬┤ ❌ ├⌬ Não encontrei conteúdo disponível para download nesse link.*`)
    }

    if (videoUrl) {
      const buf = Buffer.from(await (await fetch(videoUrl, { timeout: 60_000 })).arrayBuffer())
      await conn.sendMessage(chatId, { video: buf, mimetype: 'video/mp4', fileName: 'pinterest.mp4', caption: `*⌬┤ 📌 ├⌬ PINTEREST*\n> 🎬 Vídeo` }, { quoted: m })
    } else {
      const buf = Buffer.from(await (await fetch(imageUrl, { timeout: 60_000 })).arrayBuffer())
      await conn.sendMessage(chatId, { image: buf, caption: `*⌬┤ 📌 ├⌬ PINTEREST*\n> 🖼️ Imagem` }, { quoted: m })
    }

    userDb.kogen -= 1
    await conn.sendMessage(chatId, { text: `${config.PREMIUM_SYMBOL} Você usou *1 ${config.PREMIUM_NAME}*` }, { quoted: m })

  } catch (e) {
    console.error('[PIN]', e.message)
    m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível concluir o download. Tente novamente.`)
  }
}

handler.help = [`pinvid <link> ${config.PREMIUM_SYMBOL}`]
handler.command = ['pinvid', 'pin2']
handler.tags = ['descargas']

export default handler