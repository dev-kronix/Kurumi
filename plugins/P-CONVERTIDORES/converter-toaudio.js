import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'
import { execSync } from 'child_process'
import { rm } from 'fs/promises'

const tmpFile = ext => path.join(tmpdir(), `audio_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`)

const handler = async (m, { conn, command }) => {
  const q = m.quoted || m
  const mime = q.mimetype || q.msg?.mimetype || ''
  if (!/video|audio|document/.test(mime)) return m.reply(`*⌬┤ ✙ ├⌬ SEM MÍDIA.*\n> Envie ou responda a um vídeo ou áudio.`)

  await m.reply(`*⌬┤ ⏳ ├⌬ Convertendo...*`)

  const isPtt = ['tovn', 'toptt', 'voz', 'audioptt'].includes(command)
  const inputPath = tmpFile('bin')
  const outputPath = tmpFile(isPtt ? 'ogg' : 'mp3')

  try {
    const buffer = await q.download()
    fs.writeFileSync(inputPath, buffer)

    if (isPtt) {
      execSync(`ffmpeg -y -i "${inputPath}" -vn -c:a libopus -b:a 64k -vbr on -compression_level 10 "${outputPath}"`, { stdio: 'pipe', timeout: 120000 })
      await conn.sendMessage(m.chat, { audio: fs.readFileSync(outputPath), mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: m })
    } else {
      execSync(`ffmpeg -y -i "${inputPath}" -vn -c:a libmp3lame -b:a 192k "${outputPath}"`, { stdio: 'pipe', timeout: 120000 })
      await conn.sendMessage(m.chat, { audio: fs.readFileSync(outputPath), mimetype: 'audio/mpeg', ptt: false, fileName: 'audio.mp3' }, { quoted: m })
    }
  } catch (e) {
    console.error('[TOAUDIO]', e.message)
    m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível converter a mídia para áudio.`)
  } finally {
    await rm(inputPath, { force: true }).catch(() => {})
    await rm(outputPath, { force: true }).catch(() => {})
  }
}

handler.help = ['toaudio', 'tovn']
handler.command = ['toaudio', 'mp3', 'audio', 'tomp3', 'tovn', 'toptt', 'voz', 'audioptt']
handler.tags = ['convertidores']

export default handler