import { PDFDocument, rgb } from 'pdf-lib'
import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.quoted && !text) return m.reply(`*⌬┤ ✙ ├⌬ USO:* ${usedPrefix}${command} <texto>\n> Ou responda a uma imagem.`)

  await m.reply(`*⌬┤ ⏳ ├⌬ Gerando PDF...*`)

  try {
    const pdfDoc = await PDFDocument.create()

    if (m.quoted) {
      const mime = m.quoted.mimetype || m.quoted.msg?.mimetype || ''
      if (/image\/(jpeg|jpg|png)/i.test(mime)) {
        const buffer = await m.quoted.download()
        const image = /png/i.test(mime) ? await pdfDoc.embedPng(buffer) : await pdfDoc.embedJpg(buffer)
        const { width, height } = image.scale(1)
        const maxW = 595
        const maxH = 842
        const scale = Math.min((maxW - 40) / width, (maxH - 40) / height, 1)
        const page = pdfDoc.addPage([maxW, maxH])
        page.drawImage(image, {
          x: (maxW - width * scale) / 2,
          y: (maxH - height * scale) / 2,
          width: width * scale,
          height: height * scale
        })
      } else {
        return m.reply(`*⌬┤ ✙ ├⌬ FORMATO NÃO SUPORTADO.*\n> Responda a uma imagem JPG/PNG ou use texto.`)
      }
    } else {
      const page = pdfDoc.addPage([595, 842])
      const fontSize = 12
      const maxChars = 85
      const lines = []
      for (const paragraph of text.split('\n')) {
        if (!paragraph) { lines.push(''); continue }
        const words = paragraph.split(' ')
        let line = ''
        for (const word of words) {
          if ((line + ' ' + word).trim().length > maxChars) {
            lines.push(line.trim())
            line = word
          } else {
            line += (line ? ' ' : '') + word
          }
        }
        if (line) lines.push(line.trim())
      }
      let y = 810
      for (const line of lines) {
        if (y < 40) break
        page.drawText(line, { x: 40, y, size: fontSize, color: rgb(0, 0, 0) })
        y -= 18
      }
    }

    const pdfBytes = await pdfDoc.save()
    await conn.sendMessage(m.chat, {
      document: Buffer.from(pdfBytes),
      mimetype: 'application/pdf',
      fileName: 'documento.pdf',
      caption: `*⌬┤ ✅ ├⌬ PDF GERADO*`
    }, { quoted: m })
  } catch (e) {
    console.error('[TOPDF]', e.message)
    m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível gerar o PDF.`)
  }
}

handler.help = ['topdf <texto/imagem>']
handler.command = ['topdf', 'pdf', 'converterpdf']
handler.tags = ['convertidores']

export default handler