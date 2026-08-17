import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

const execAsync = promisify(exec)

const handler = async (m, { conn }) => {
  if (!m.quoted) return m.reply('*⌬┤ 🖼️ ├⌬ Responda a um sticker animado, imagem ou vídeo.*')

  const mime = m.quoted.mimetype || m.quoted.msg?.mimetype || ''
  const mtype = m.quoted.mtype || ''

  if (!/webp|image|video/i.test(mime) && !/stickerMessage|imageMessage|videoMessage/i.test(mtype)) {
    return m.reply('*⌬┤ 🖼️ ├⌬ Responda a um sticker, imagem ou vídeo válido.*')
  }

  await m.reply('*⌬┤ ⏳ ├⌬ Convertendo para imagem...*')

  const tmpDir = os.tmpdir()
  const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`
  const input = path.join(tmpDir, `toimg_${id}.bin`)
  const output = path.join(tmpDir, `toimg_${id}.png`)

  try {
    const buffer = await m.quoted.download()
    if (!buffer) throw new Error('Não foi possível baixar a mídia')
    await fs.writeFile(input, buffer)

    await execAsync(`ffmpeg -y -i "${input}" -frames:v 1 "${output}"`)
    const result = await fs.readFile(output)

    await conn.sendMessage(m.chat, {
      image: result,
      caption: '*⌬┤ ✅ ├⌬ IMAGEM CONVERTIDA*'
    }, { quoted: m })
  } catch (e) {
    console.error('[TOIMG]', e.message)
    m.reply('*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível converter a mídia para imagem.')
  } finally {
    await fs.rm(input, { force: true }).catch(() => {})
    await fs.rm(output, { force: true }).catch(() => {})
  }
}

handler.help = ['toimg']
handler.command = ['toimg', 'toimage', 'imagem', 'converterimagem']
handler.tags = ['convertidores']

export default handler