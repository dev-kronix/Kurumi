import axios from 'axios'
import { createWriteStream, statSync, mkdirSync, readFileSync } from 'fs'
import { rm } from 'fs/promises'
import { pipeline } from 'stream/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { selectionSessions } from '../../lib/serializer.js'
import config from '../../config.js'

const TMP_DIR  = join(process.cwd(), 'tmp', 'apks')
const PKG_RE   = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/i
const APT_RE   = /aptoide\.com\/app\/([^/?#]+)/i

async function downloadApk(url, destPath) {
  mkdirSync(join(destPath, '..'), { recursive: true })
  const res = await axios.get(url, {
    responseType: 'stream',
    headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Redmi Note 8) AppleWebKit/537.36' },
    timeout: 300_000,
    maxRedirects: 10,
  })
  await pipeline(res.data, createWriteStream(destPath))
  const { size } = statSync(destPath)
  if (size < 1000) throw new Error('Arquivo muito pequeno')
  return size
}

async function fetchSearch(query) {
  const res = await axios.get(`https://luxinfinity.vercel.app/api/aptoide/search?query=${encodeURIComponent(query)}&limit=10`)
  return res.data?.status ? (res.data.data || []) : []
}

async function fetchInfo(packageId) {
  const res = await axios.get(`https://luxinfinity.vercel.app/api/aptoide/info?query=${encodeURIComponent(packageId)}`)
  if (!res.data?.status || !res.data?.data) return null
  return res.data.data
}

const handler = async (m, { conn, text, usedPrefix, command, userDb }) => {
  if (!text) return m.reply(`*⌬┤ ✙ ├⌬ USO.*\n> *${usedPrefix}${command} <nome ou package ID>*`)
  if (userDb.kogen < 1) return m.reply(`*⌬┤ 💎 ├⌬ SEM ${config.PREMIUM_NAME.toUpperCase()}.*\n> Você não possui ${config.PREMIUM_NAME} suficiente para usar este comando.`)

  const chatId = m.chat
  const input  = text.trim()

  let packageId = null

  if (APT_RE.test(input)) {
    packageId = input.match(APT_RE)[1].split('/')[0].split('?')[0]
  } else if (PKG_RE.test(input)) {
    packageId = input
  }

  if (packageId) {
    const tmpPath = join(TMP_DIR, `${randomUUID()}.apk`)
    await m.reply(`*⌬┤ ⏳ ├⌬ Obtendo informações do aplicativo...*`)
    try {
      const info = await fetchInfo(packageId)
      if (!info?.download) return m.reply(`*⌬┤ ❌ ├⌬ O aplicativo não foi encontrado ou não possui download disponível.*`)

      await conn.sendMessage(chatId, {
        image:   { url: info.thumb },
        caption: `*⌬┤ 📱 ├⌬ ${info.title}*\n\n> 🔖 *Versão:* ${info.version}\n> ⚖️ *Tamanho:* ${info.size}\n> ⭐ *Avaliação:* ${info.rating}\n> 📥 *Downloads:* ${info.downloads}\n> 📱 *Android:* ${info.min_android}\n> 🏗️ *Arquitetura:* ${info.arch}\n> 🛡️ *Estado:* ${info.is_safe ? '✅ Confiável' : '⚠️ Não verificado'}`,
      }, { quoted: m })

      await m.reply(`*⌬┤ ⬇️ ├⌬ Baixando APK...*`)
      await downloadApk(info.download, tmpPath)

      await conn.sendMessage(chatId, {
        document: readFileSync(tmpPath),
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${info.title} v${info.version}.apk`,
        caption:  `*⌬┤ ✅ ├⌬ ${info.title} v${info.version}*`,
      }, { quoted: m })

      userDb.kogen -= 1
      await conn.sendMessage(chatId, { text: `${config.PREMIUM_SYMBOL} Você usou *1 ${config.PREMIUM_NAME}*` }, { quoted: m })

    } catch (e) {
      console.error('[APT]', e.message)
      m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível concluir o download.`)
    } finally {
      await rm(tmpPath, { force: true }).catch(() => {})
    }

  } else {
    await m.reply(`*⌬┤ 🔎 ├⌬ Buscando: ${input}...*`)
    try {
      const results = await fetchSearch(input)
      if (!results.length) return m.reply(`*⌬┤ ❌ ├⌬ NÃO ENCONTRADO.*\n> Não encontrei resultados para: *${input}*`)

      const STARS = ['⭐', '🌟', '💫']
      let txt = `*╔═══⌦ ✦ 📱 APTOIDE ✦ ⌫═══╗*\n\n`
      txt += `> 🔍 *Resultados para:* ${input}\n\n`

      results.forEach((app, i) => {
        const stars = parseFloat(app.rating) >= 4.5 ? STARS[1] : parseFloat(app.rating) >= 4.0 ? STARS[0] : '·'
        txt += `*${i + 1}.* ${app.title}\n`
        txt += `> ${stars} ${app.rating} · 📦 ${app.size} · v${app.version}\n\n`
      })

      txt += `*Responda citando esta mensagem com o número do aplicativo.*\n`
      txt += `*╚══⌦ ${config.footer} ⌫══╝*`

      const sent = await conn.sendMessage(chatId, { text: txt }, { quoted: m })

      const sessionKey = `${chatId}|${m.sender}|${sent.key.id}`
      selectionSessions.set(sessionKey, {
        options: results.map(app => ({ cmd: `${command} ${app.id}` }))
      })

      setTimeout(() => selectionSessions.delete(sessionKey), 5 * 60 * 1000)

    } catch (e) {
      console.error('[APT:SEARCH]', e.message)
      m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível pesquisar o aplicativo. Tente novamente.`)
    }
  }
}

handler.help = [`aptoide <nome> ${config.PREMIUM_SYMBOL}`]
handler.command = ['aptoide', 'apk']
handler.tags    = ['descargas']

export default handler
