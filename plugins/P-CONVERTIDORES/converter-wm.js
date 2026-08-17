import { addExif } from '../../lib/sticker.js'
import config from '../../config.js'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.quoted || m.quoted.mtype !== 'stickerMessage') {
    return m.reply(`*⌬┤ ✙ ├⌬ STICKER OBRIGATÓRIO.*\n> Responda a um sticker com *${usedPrefix}${command} pacote|autor*`)
  }

  const [packnameRaw, authorRaw] = (text || '').split('|').map(v => v?.trim())
  const packname = packnameRaw || config.packname || 'Kurumi'
  const author = authorRaw || config.author || 'DevKronix'

  await m.reply(`*⌬┤ ⏳ ├⌬ Atualizando informações do sticker...*`)

  try {
    const buffer = await m.quoted.download()
    const sticker = await addExif(buffer, packname, author)
    await conn.sendMessage(m.chat, { sticker }, { quoted: m })
  } catch (e) {
    console.error('[WM]', e.message)
    m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível atualizar o sticker.`)
  }
}

handler.help = ['wm <pacote|autor>']
handler.command = ['wm', 'take', 'roubarsticker', 'renomearsticker']
handler.tags = ['convertidores']

export default handler