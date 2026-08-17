import axios from 'axios'
import { sendSmart } from '../../lib/serializer.js'
import fs from 'fs'
import path from 'path'
import { rm } from 'fs/promises'
import { pipeline } from 'stream/promises'
import config from '../../config.js'
import { playvid } from '../../lib/scrapers/playvideo.js'
import { playaudio } from '../../lib/scrapers/playaudio.js'

const DELIRIUS = 'https://api.delirius.store'

async function ytSearch(query) {
  const { data } = await axios.get(`${DELIRIUS}/search/ytsearch?q=${encodeURIComponent(query)}`, { timeout: 15000 })
  if (!data?.status || !data?.data?.length) throw new Error('Sem resultados')
  const v = data.data[0]
  return {
    id:        v.videoId,
    url:       v.url || `https://www.youtube.com/watch?v=${v.videoId}`,
    title:     v.title       || 'Sem título',
    channel:   v.author?.name || 'Desconhecido',
    views:     Number(v.views || 0).toLocaleString('pt-BR'),
    duration:  v.duration    || '',
    thumbnail: v.image       || `https://i.ytimg.com/vi/${v.videoId}/maxresdefault.jpg`,
  }
}

async function fetchAudio(url) {
  for (const ep of [`${DELIRIUS}/download/ytmp3?url=${encodeURIComponent(url)}`, `${DELIRIUS}/download/ytmp3v2?url=${encodeURIComponent(url)}`]) {
    try {
      const { data } = await axios.get(ep, { timeout: 30000 })
      if ((data?.status === true || data?.success === true) && data?.data?.download) return data.data
    } catch {}
  }
  try {
    const fallbackRes = await playaudio.convert(url, '128k')
    if (fallbackRes?.url) {
      return { download: fallbackRes.url, title: fallbackRes.filename || 'Áudio do YouTube' }
    }
  } catch {}
  throw new Error('Não foi possível obter o áudio')
}

async function fetchVideo(url) {
  for (const fmt of ['360p', '480p', '720p']) {
    try {
      const { data } = await axios.get(`${DELIRIUS}/download/ytmp4?url=${encodeURIComponent(url)}&format=${fmt}`, { timeout: 35000 })
      if (data?.status === true && data?.data?.download) return data.data
    } catch {}
  }
  try {
    const fallbackRes = await playvid.convert(url, '360p')
    if (fallbackRes?.url) {
      return { download: fallbackRes.url, title: fallbackRes.filename || 'Vídeo do YouTube' }
    }
  } catch {}
  throw new Error('Não foi possível obter o vídeo')
}

const handler = async (m, { conn, text, usedPrefix, command, userDb }) => {
  if (!text) return m.reply(`*⌬┤ ✙ ├⌬ USO.*\n> Digite o nome de uma música ou vídeo.\n\n> *Exemplo:* ${usedPrefix}${command} linkin park numb`)

  if (command === 'playdl') {
    if (userDb.kogen < 1) return m.reply(`*⌬┤ 💎 ├⌬ SEM ${config.PREMIUM_NAME.toUpperCase()}.*\n> Você não possui ${config.PREMIUM_NAME} suficiente para usar este comando.`)

    const [type, ...idParts] = text.split(' ')
    const videoId = idParts.join(' ')
    if (!type || !videoId) return

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    const isAudio = type.includes('mp3')
    const isDoc   = type.includes('doc')
    const ext     = isAudio ? 'mp3' : 'mp4'
    const ytUrl   = `https://www.youtube.com/watch?v=${videoId}`

    await m.reply(`*⌬┤ ⏳ ├⌬ BAIXANDO...*\n\n> _Isso pode levar alguns instantes..._`)

    const tmpDir = path.resolve('./tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
    const localPath = path.join(tmpDir, `playdl_${Date.now()}.${ext}`)

    let dlTitle    = 'Mídia do YouTube'
    let downloaded = false

    try {
      const media = isAudio ? await fetchAudio(ytUrl) : await fetchVideo(ytUrl)
      dlTitle     = media.title || dlTitle

      const mediaRes = await axios.get(media.download, { responseType: 'stream', timeout: 120000 })
      await pipeline(mediaRes.data, fs.createWriteStream(localPath))

      if (fs.existsSync(localPath) && fs.statSync(localPath).size > 1000) downloaded = true
    } catch {}

    if (!downloaded) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      await rm(localPath, { force: true }).catch(() => {})
      return m.reply(`*⌬┤ ✙ ├⌬ ERRO.*\n> Não foi possível baixar. O conteúdo pode possuir alguma restrição ou direitos autorais.`)
    }

    try {
      if (isAudio) {
        if (isDoc) {
          await conn.sendMessage(m.chat, { document: { url: localPath }, mimetype: 'audio/mpeg', fileName: `${dlTitle}.mp3`, caption: `*⌬┤ 🎧 ├⌬ ÁUDIO · DOCUMENTO*` }, { quoted: m })
        } else {
          await conn.sendMessage(m.chat, { audio: { url: localPath }, mimetype: 'audio/mpeg', fileName: `${dlTitle}.mp3` }, { quoted: m })
        }
      } else {
        if (isDoc) {
          await conn.sendMessage(m.chat, { document: { url: localPath }, mimetype: 'video/mp4', fileName: `${dlTitle}.mp4`, caption: `*⌬┤ 🎬 ├⌬ VÍDEO · DOCUMENTO*` }, { quoted: m })
        } else {
          await conn.sendMessage(m.chat, { video: { url: localPath }, mimetype: 'video/mp4', caption: `*⌬┤ 🎬 ├⌬ ${dlTitle}*`, fileName: `${dlTitle}.mp4` }, { quoted: m })
        }
      }
      userDb.kogen -= 1
      await conn.sendMessage(m.chat, { text: `${config.PREMIUM_SYMBOL} Você usou *1 ${config.PREMIUM_NAME}*` }, { quoted: m })
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      m.reply(`*⌬┤ ✙ ├⌬ ERRO.*\n> Ocorreu um erro ao enviar o arquivo.`)
    } finally {
      await rm(localPath, { force: true }).catch(() => {})
    }
    return
  }

  const sender = m.sender
  await m.reply(`🔍 *Buscando...*`)

  let videoInfo = {}
  try {
    videoInfo = await ytSearch(text)
  } catch {
    return m.reply(`*⌬┤ ✙ ├⌬ ERRO.*\n> Nenhum resultado encontrado. Tente outro título.`)
  }

  const infoText = `*⌬┤ 🎵 ├⌬ YOUTUBE PLAY*\n\n> *Título:* ${videoInfo.title}\n> *Autor:* ${videoInfo.channel}\n> *Duração:* ${videoInfo.duration}\n> *Visualizações:* ${videoInfo.views}\n> *Link:* ${videoInfo.url}\n\n> *Escolha uma opção para download:*`
  const isLid = sender.includes('@lid')

  const nativeFlowButtons = [{
    text: `Escolher formato ⚙️`,
    sections: [{
      title: `✧ Opções disponíveis ✧`,
      rows: [
        { header: '', title: `🎧 | Áudio (MP3)`,       description: `» Reprodutor de áudio padrão`, id: `${usedPrefix}playdl ytmp3_norm ${videoInfo.id}` },
        { header: '', title: `📁 | Áudio (Documento)`, description: `» Arquivo original para download`, id: `${usedPrefix}playdl ytmp3_doc ${videoInfo.id}` },
        { header: '', title: `📽️ | Vídeo (MP4)`,       description: `» Reprodutor de vídeo padrão`, id: `${usedPrefix}playdl ytmp4_norm ${videoInfo.id}` },
        { header: '', title: `📄 | Vídeo (Documento)`, description: `» Arquivo original para download`, id: `${usedPrefix}playdl ytmp4_doc ${videoInfo.id}` },
      ]
    }]
  }]

  await sendSmart(conn, m, {
    image:      { url: videoInfo.thumbnail },
    caption:    infoText,
    footer:     global.botname || config.botName,
    buttons:    nativeFlowButtons,
    headerType: 4,
    mentions:   isLid ? [] : [sender],
  }, {}, userDb)
}

handler.help    = [`play <texto> ${config.PREMIUM_SYMBOL}`]
handler.command = ['play', 'playvid', 'play2', 'playdl']
handler.tags    = ['descargas']

export default handler