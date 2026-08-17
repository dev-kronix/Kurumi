import PhoneNumber from 'awesome-phonenumber'
import config from '../../config.js'

function formatarNumero(numero) {
  const limpo = String(numero || '').replace(/\D/g, '')
  if (!limpo) return ''
  try {
    return PhoneNumber('+' + limpo).getNumber('international') || `+${limpo}`
  } catch {
    return `+${limpo}`
  }
}

const handler = async (m, { conn }) => {
  await m.react('📇')

  const ownerNum = String(config.ownerNumber?.[0] || '').replace(/\D/g, '')
  const botNum = (conn.user?.id || '').split('@')[0].split(':')[0].replace(/\D/g, '')
  const botName = config.botName || 'Kurumi'
  const ownerName = config.ownerName || 'DevKronix'
  const region = config.ownerRegion || 'Brasil 🇧🇷'
  const email = config.ownerEmail || ''

  const ownerEmailLine = email ? `\nEMAIL;type=INTERNET:${email}` : ''
  const contacts = []

  if (ownerNum) {
    contacts.push({
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${ownerName};;;\nFN:${ownerName}\nORG:Responsável pela ${botName}\nTEL;type=CELL;type=VOICE;waid=${ownerNum}:${formatarNumero(ownerNum)}${ownerEmailLine}\nADR:;;${region};;;;\nEND:VCARD`,
      displayName: ownerName
    })
  }

  if (botNum) {
    contacts.push({
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${botName};;;\nFN:${botName}\nORG:Bot oficial\nTEL;type=CELL;type=VOICE;waid=${botNum}:${formatarNumero(botNum)}\nEND:VCARD`,
      displayName: botName
    })
  }

  if (!contacts.length) return m.reply(`*⌬┤ 📇 ├⌬ CONTATO*\n> Responsável: *${ownerName}*`)

  await conn.sendMessage(m.chat, {
    contacts: {
      displayName: `Contatos da ${botName}`,
      contacts
    }
  }, { quoted: m })
}

handler.help = ['dono']
handler.command = ['owner', 'creador', 'dueño', 'propietario', 'dono', 'responsavel', 'responsável']
handler.tags = ['info']

export default handler
