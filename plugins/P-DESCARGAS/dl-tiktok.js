import fetch from 'node-fetch'
import * as baileysMod from '@whiskeysockets/baileys'
import { snaptikDownload } from '../../lib/scrapers/_ox.js'
import config from '../../config.js'

const pkg = baileysMod.default && Object.keys(baileysMod).length === 1 ? baileysMod.default : baileysMod
const { generateWAMessageFromContent, generateWAMessage } = pkg

const handler = async (m, { conn, text, usedPrefix, command, userDb }) => {
  let url = text ? text.trim() : ''
  if (!url && m.quoted) {
    const quotedText = m.quoted.body || m.quoted.text || ''
    const match = quotedText.match(/https?:\/\/[^\s]+/i)
    if (match) url = match[0]
  }

  if (!url) return m.reply(`*⌬┤ ✙ ├⌬ LINK OBRIGATÓRIO.*\n> Envie ou responda a uma mensagem com um link válido do TikTok.`)
  if (!/tiktok\.com|vt\.tiktok\.com/i.test(url)) return m.reply(`*⌬┤ ✙ ├⌬ LINK INVÁLIDO.*\n> Verifique se o link é do TikTok.`)
  if (userDb.kogen < 1) return m.reply(`*⌬┤ 💎 ├⌬ SEM ${config.PREMIUM_NAME.toUpperCase()}.*\n> Você não possui ${config.PREMIUM_NAME} suficiente para usar este comando.`)

  const chatId = m.chat
  await m.reply(`*⌬┤ 📥 ├⌬ Baixando conteúdo do TikTok...*`)

  try {
    const data = await snaptikDownload(url)

    if (data.type === 'images' && data.images?.length) {
      const caption = `*⌬┤ 🖼️ ├⌬ TIKTOK · ${data.images.length} IMAGENS*\n> 📝 ${data.title || 'Sem título'}`

      const album = generateWAMessageFromContent(chatId, {
        albumMessage: {
          expectedImageCount: data.images.length,
          contextInfo: { stanzaId: m.key.id, participant: m.key.participant || m.key.remoteJid, quotedMessage: m.message }
        }
      }, {})
      await conn.relayMessage(chatId, album.message, { messageId: album.key.id })

      await Promise.all(data.images.map(async (imgUrl, i) => {
        try {
          const imgBuf = Buffer.from(await (await fetch(imgUrl, { timeout: 60000 })).arrayBuffer())
          const msg = await generateWAMessage(chatId, {
            image: imgBuf,
            caption: i === 0 ? caption : ''
          }, { upload: conn.waUploadToServer })
          msg.message.messageContextInfo = { messageAssociation: { associationType: 1, parentMessageKey: album.key } }
          await conn.relayMessage(chatId, msg.message, { messageId: msg.key.id })
        } catch {}
      }))

    } else if (data.type === 'video') {
      const videoUrl = data.download?.hd || data.download?.sd
      if (!videoUrl) return m.reply(`*⌬┤ ✙ ├⌬ VÍDEO NÃO ENCONTRADO.*\n> Não encontrei um vídeo nesse link.`)

      const captionVid = `*⌬┤ 🎵 ├⌬ TIKTOK*\n> 📝 ${data.title || 'Sem título'}`
      const buf = Buffer.from(await (await fetch(videoUrl, { timeout: 60000 })).arrayBuffer())
      await conn.sendMessage(chatId, { video: buf, mimetype: 'video/mp4', caption: captionVid }, { quoted: m })

    } else {
      return m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível obter conteúdo desse link.`)
    }

    userDb.kogen -= 1
    await conn.sendMessage(chatId, { text: `${config.PREMIUM_SYMBOL} Você usou *1 ${config.PREMIUM_NAME}*` }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> ${e.message || 'Ocorreu um erro inesperado. Tente novamente.'}`)
  }
}

handler.help    = [`tiktok <link> ${config.PREMIUM_SYMBOL}`]
handler.command = ['ttkdl', 'tiktok', 'tt', 'tiktokdl', 'ttk']
handler.tags    = ['descargas']

export default handler