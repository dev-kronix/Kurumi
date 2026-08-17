import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'
import { execSync } from 'child_process'
import { rm } from 'fs/promises'

const tmpFile = ext => path.join(tmpdir(), `tovideo_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`)

const handler = async (m, { conn }) => {
  const q = m.quoted || m
  const mime = q.mimetype || q.msg?.mimetype || ''
  const mtype = q.mtype || ''

  if (!/webp|image|video/i.test(mime) && !/stickerMessage|imageMessage|videoMessage/i.test(mtype)) {
    return m.reply(`*⌬┤ ✙ ├⌬ SEM MÍDIA.*\n> Responda a um sticker animado, GIF, imagem ou vídeo.`)
  }

  await m.reply(`*⌬┤ ⏳ ├⌬ Convertendo para vídeo...*`)

  const inputPath = tmpFile('bin')
  const outputPath = tmpFile('mp4')

  try {
    const buffer = await q.download()
    if (!buffer) throw new Error('Não foi possível baixar a mídia')
    fs.writeFileSync(inputPath, buffer)

    execSync(`ffmpeg -y -i "${inputPath}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -an "${outputPath}"`, { stdio: 'pipe', timeout: 120000 })

    await conn.sendMessage(m.chat, {
      video: fs.readFileSync(outputPath),
      mimetype: 'video/mp4',
      caption: `*⌬┤ ✅ ├⌬ VÍDEO CONVERTIDO*`
    }, { quoted: m })
  } catch (e) {
    console.error('[TOVIDEO]', e.message)
    m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível converter a mídia para vídeo.`)
  } finally {
    await rm(inputPath, { force: true }).catch(() => {})
    await rm(outputPath, { force: true }).catch(() => {})
  }
}

handler.help = ['tovideo']
handler.command = ['tovideo', 'tomp4', 'video', 'convertervideo']
handler.tags = ['convertidores']

export default handler