import axios from 'axios'
import { createWriteStream, statSync, mkdirSync, readFileSync } from 'fs'
import { rm } from 'fs/promises'
import { pipeline } from 'stream/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { selectionSessions } from '../../lib/serializer.js'
import config from '../../config.js'

const TMP_DIR = join(process.cwd(), 'tmp', 'apks')
const UA      = 'Mozilla/5.0 (Linux; Android 11; Redmi Note 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
const AN1_RE  = /an1\.com\/.+\.html/i

async function downloadApk(url, destPath) {
  mkdirSync(join(destPath, '..'), { recursive: true })
  const res = await axios.get(url, {
    responseType: 'stream',
    headers: { 'User-Agent': UA, 'Referer': 'https://an1.com' },
    timeout: 300_000,
    maxRedirects: 10,
  })
  await pipeline(res.data, createWriteStream(destPath))
  const { size } = statSync(destPath)
  if (size < 1000) throw new Error(`Arquivo inválido (${size} bytes)`)
  return size
}

async function fetchSearch(query) {
  const res = await axios.get(`https://luxinfinity.vercel.app/api/an1/search?query=${encodeURIComponent(query)}&limit=10`)
  return res.data?.status ? (res.data.data || []) : []
}

async function fetchDownload(url) {
  const res = await axios.get(`https://luxinfinity.vercel.app/api/an1/download?query=${encodeURIComponent(url)}`)
  return res.data?.status ? (res.data.data || null) : null
}

const handler = async (m, { conn, text, usedPrefix, command, userDb }) => {
  if (!text) return m.reply(`*⌬┤ ✙ ├⌬ USO.*\n> *${usedPrefix}${command} <nome>*`)
  if (userDb.kogen < 1) return m.reply(`*⌬┤ 💎 ├⌬ SEM ${config.PREMIUM_NAME.toUpperCase()}.*\n> Você não possui ${config.PREMIUM_NAME} suficiente para usar este comando.`)

  const chatId = m.chat
  const input  = text.trim()

  if (AN1_RE.test(input)) {
    const tmpPath = join(TMP_DIR, `${randomUUID()}.apk`)
    await m.reply(`*⌬┤ ⏳ ├⌬ Obtendo informações do aplicativo...*`)
    try {
      const info = await fetchDownload(input)
      if (!info?.download) return m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível obter o link de download.`)

      await conn.sendMessage(chatId, {
        image:   { url: info.thumb },
        caption: `*⌬┤ 📱 ├⌬ ${info.title}*\n\n> 🔖 *Versão:* ${info.version}\n> ⚖️ *Tamanho:* ${info.size}\n> 🌐 *Fonte:* AN1.com`,
      }, { quoted: m })

      await m.reply(`*⌬┤ ⬇️ ├⌬ Baixando APK...*`)
      await downloadApk(info.download, tmpPath)

      const fileName = `${info.title.replace(/[^\w\s.-]/g, '').trim()} v${info.version}.apk`
      await conn.sendMessage(chatId, {
        document: readFileSync(tmpPath),
        mimetype: 'application/vnd.android.package-archive',
        fileName,
        caption:  `*⌬┤ ✅ ├⌬ ${info.title} v${info.version}*`,
      }, { quoted: m })

      userDb.kogen -= 1
      await conn.sendMessage(chatId, { text: `${config.PREMIUM_SYMBOL} Você usou *1 ${config.PREMIUM_NAME}*` }, { quoted: m })

    } catch (e) {
      console.error('[AN1]', e.message)
      m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível concluir o download.`)
    } finally {
      await rm(tmpPath, { force: true }).catch(() => {})
    }

  } else {
    await m.reply(`*⌬┤ 🔎 ├⌬ Buscando no AN1: ${input}...*`)
    try {
      const results = await fetchSearch(input)
      if (!results.length) return m.reply(`*⌬┤ ❌ ├⌬ NÃO ENCONTRADO.*\n> Não encontrei resultados para: *${input}*`)

      let txt = `*╔═══⌦ ✦ 📱 AN1.COM ✦ ⌫═══╗*\n\n`
      txt += `> 🔍 *Resultados para:* ${input}\n\n`

      results.forEach((app, i) => {
        txt += `*${i + 1}.* ${app.title}\n`
        txt += `> 🧑‍💻 ${app.developer || 'Desconhecido'}\n\n`
      })

      txt += `*Responda citando esta mensagem com o número do aplicativo.*\n`
      txt += `*╚══⌦ ${config.footer} ⌫══╝*`

      const sent = await conn.sendMessage(chatId, { text: txt }, { quoted: m })

      const sessionKey = `${chatId}|${m.sender}|${sent.key.id}`
      selectionSessions.set(sessionKey, {
        options: results.map(app => ({ cmd: `${command} ${app.url}` }))
      })

      setTimeout(() => selectionSessions.delete(sessionKey), 5 * 60 * 1000)

    } catch (e) {
      console.error('[AN1:SEARCH]', e.message)
      m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível pesquisar. Tente novamente.`)
    }
  }
}

handler.help = [`an1 <nome> ${config.PREMIUM_SYMBOL}`]
handler.command = ['an1']
handler.tags    = ['descargas']

export default handler
