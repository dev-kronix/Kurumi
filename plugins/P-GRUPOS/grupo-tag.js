import { getFileBuffer } from '../../lib/myfunc.js'

const handler = async (m, { conn, text, participants }) => {
  const mentions = participants.map(p => p.id)

  const q = m.quoted ? m.quoted : m
  const type = q.mtype || ''
  const isMedia = /image|video|audio|sticker|document/.test(type)
  const mime = q.msg?.mimetype || q.mimetype || ''
  const ptt = q.msg?.ptt || q.ptt || false
  const fileName = q.msg?.fileName || q.fileName || 'arquivo'

  const finalMsg = text || (m.quoted ? q.body : '') || '📢'

  if (isMedia) {
    let buffer
    try {
      let rawMsg = m.quoted ? m.message[m.mtype]?.contextInfo?.quotedMessage : m.message
      if (rawMsg?.viewOnceMessageV2?.message)           rawMsg = rawMsg.viewOnceMessageV2.message
      if (rawMsg?.viewOnceMessage?.message)             rawMsg = rawMsg.viewOnceMessage.message
      if (rawMsg?.documentWithCaptionMessage?.message)  rawMsg = rawMsg.documentWithCaptionMessage.message
      const fileData = await getFileBuffer(rawMsg, null, false)
      buffer = fileData.buffer
    } catch (e) {
      return m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível processar o arquivo: ${e.message}`)
    }

    if      (/image/.test(type))    await conn.sendMessage(m.chat, { image: buffer, caption: finalMsg, mentions }, { quoted: m })
    else if (/video/.test(type))    await conn.sendMessage(m.chat, { video: buffer, caption: finalMsg, mentions }, { quoted: m })
    else if (/audio/.test(type))    await conn.sendMessage(m.chat, { audio: buffer, ptt, mimetype: mime || 'audio/mpeg', mentions }, { quoted: m })
    else if (/sticker/.test(type))  await conn.sendMessage(m.chat, { sticker: buffer, mentions }, { quoted: m })
    else if (/document/.test(type)) await conn.sendMessage(m.chat, { document: buffer, caption: finalMsg, mimetype: mime || 'application/octet-stream', fileName, mentions }, { quoted: m })
  } else {
    await conn.sendMessage(m.chat, { text: finalMsg, mentions }, { quoted: m })
  }
}

handler.help = ['marcar <mensagem>']
handler.tags = ['group']
handler.command = ['tag', 'n', 'mensaje', 'notify', 'notificar', 'mencionar', 'marcar']
handler.groupOnly = true
handler.adminOnly = true
handler.noRegister = true

export default handler
