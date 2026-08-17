import * as baileysMod from '@whiskeysockets/baileys'
import config from '../../config.js'
import { plugins } from '../../handler.js'

const pkg = baileysMod.default && Object.keys(baileysMod).length === 1 ? baileysMod.default : baileysMod
const { prepareWAMessageMedia, generateWAMessageFromContent } = pkg

const START_TIME = Date.now()

const ETIQUETAS = {
  info:          'ℹ️ Informações',
  owner:         '👑 Dono / Administração',
  rpg:           '⚔️ RPG e Aventura',
  eco:           '💰 Economia',
  registro:      '👤 Cadastro',
  juegos:        '🎮 Minijogos',
  fun:           '🎉 Diversão',
  group:         '👥 Gerenciamento de Grupos',
  tools:         '🔧 Ferramentas',
  descargas:     '📥 Downloads',
  busquedas:     '🔍 Pesquisas',
  convertidores: '🔄 Conversores',
  anime:         '🎌 Anime / Otaku',
  nsfw:          '🔞 Conteúdo +18',
  jadibot:       '🤖 Sub-bots',
  outros:        '📦 Outros Comandos'
}

const getTime = () => {
  const t = Math.floor((Date.now() - START_TIME) / 1000)
  const d = Math.floor(t / 86400)
  const h = Math.floor((t / 3600) % 24)
  const min = Math.floor((t / 60) % 60)
  const s = t % 60
  return `${d > 0 ? d + 'd ' : ''}${h > 0 ? h + 'h ' : ''}${min > 0 ? min + 'm ' : ''}${s}s`
}

function getCategorias(isOwner, groupDb) {
  const categorias = {}
  let total = 0

  for (const p of Object.values(plugins)) {
    if (!p || !p.help) continue
    if ((p.owner || p.ownerOnly) && !isOwner) continue

    const tagRaw = Array.isArray(p.tags) ? p.tags[0] : (p.tags || 'outros')
    const tag = tagRaw.toLowerCase()

    if (groupDb && groupDb.disabledCategories?.includes(tag)) continue

    const cmdsReais = Array.isArray(p.command) ? p.command : [p.command]
    if (groupDb && cmdsReais.every(c => groupDb.disabledCmds?.includes(c))) continue

    if (!categorias[tag]) categorias[tag] = []
    const cmds = Array.isArray(p.help) ? p.help : [p.help]
    for (const cmd of cmds) {
      categorias[tag].push(cmd)
      total++
    }
  }

  return { categorias, total }
}

function getOrdenAtivo(isOwner, groupDb) {
  const { categorias, total } = getCategorias(isOwner, groupDb)
  return { categorias, total, ordemFinal: Object.keys(categorias) }
}

const getContextInfo = (conn, m) => ({
  mentionedJid: [m.sender],
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: global.newsletterJid || config.newsletterJid || '120363403631501323@newsletter',
    newsletterName: `${conn.botname || config.botName} - ${config.ownerName}`,
    serverMessageId: Math.floor(Math.random() * 999) + 1,
  }
})

async function criarHeader(conn, imageUrl, title) {
  if (!imageUrl) return { title, hasMediaAttachment: false }
  const media = await prepareWAMessageMedia({ image: { url: imageUrl } }, { upload: conn.waUploadToServer })
  return { hasMediaAttachment: true, imageMessage: media.imageMessage }
}

async function enviarSubmenu(conn, m, tag, isOwner, usedPrefix, groupDb, userDb) {
  const { categorias } = getOrdenAtivo(isOwner, groupDb)
  const comandos = categorias[tag]
  if (!comandos?.length) return m.reply(`*⌬┤ ❌ ├⌬ Não há comandos ativos nesta categoria.*`)

  const nomeCategoria = ETIQUETAS[tag] || ETIQUETAS.outros
  const prefix = usedPrefix || config.prefix.source.replace(/[\^\[\]\\]/g, '')[0] || '.'
  const linkCanal = config.groupLink || 'https://whatsapp.com'
  const linha = '─────────────────'
  const currentBotName = conn.botname || config.botName

  let caption = ''
  caption += `┌${linha}\n`
  caption += `└┐  *${nomeCategoria.toUpperCase()}*\n`
  caption += `┌┤\n`
  for (const cmd of comandos) caption += `││  ${prefix}${cmd}\n`
  caption += `│└──⊷\n`
  caption += `└${linha}`

  const imageUrl = conn.menuImage || null

  if (conn.noButtons || userDb?.noButtons) {
    if (imageUrl) return conn.sendMessage(m.chat, { image: { url: imageUrl }, caption }, { quoted: m })
    return conn.sendMessage(m.chat, { text: caption }, { quoted: m })
  }

  const header = await criarHeader(conn, imageUrl, `⌬ ${currentBotName}`)
  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
        interactiveMessage: {
          body: { text: caption },
          footer: { text: `© ${new Date().getFullYear()} ${currentBotName}` },
          header,
          nativeFlowMessage: {
            buttons: [
              {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({ display_text: '🔙 Voltar ao menu', id: `${prefix}menu` })
              },
              {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({ display_text: '📢 Canal oficial', url: linkCanal, merchant_url: linkCanal })
              }
            ]
          },
          contextInfo: getContextInfo(conn, m)
        }
      }
    }
  }, { quoted: m })

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

const handler = async (m, { conn, usedPrefix, isOwner, command, groupDb, userDb }) => {
  const { categorias, total, ordemFinal } = getOrdenAtivo(isOwner, groupDb)

  const numMatch = command.match(/^menu(\d+)$/)
  if (numMatch) {
    const idx = parseInt(numMatch[1]) - 1
    const tag = ordemFinal[idx]
    if (tag) return enviarSubmenu(conn, m, tag, isOwner, usedPrefix, groupDb, userDb)
    return m.reply(`*⌬┤ ❌ ├⌬ Categoria não encontrada ou desativada.*`)
  }

  const nomeUsuario = m.pushName || 'Usuário'
  const prefix = usedPrefix || config.prefix.source.replace(/[\^\[\]\\]/g, '')[0] || '.'
  const currentBotName = conn.botname || config.botName

  const rows = ordemFinal.map((tag, i) => {
    const nomeCategoria = ETIQUETAS[tag] || ETIQUETAS.outros
    const n = categorias[tag]?.length || 0
    return {
      header: nomeCategoria.toUpperCase(),
      title: 'Ver comandos',
      description: `${n} comandos · Digite ${prefix}menu${i + 1}`,
      id: `menu_cat_${tag}`
    }
  })

  const imageUrl = conn.menuImage || null
  const categoriasTexto = ordemFinal
    .map((tag, i) => `> *${i + 1}.* ${ETIQUETAS[tag] || tag} — ${categorias[tag]?.length || 0} cmds · \`${prefix}menu${i + 1}\``)
    .join('\n')

  const textoMenu = `*╔═══⌦ ✦ 🕰️ ${currentBotName} ✦ ⌫═══╗*\n\n> 👋 *Olá, ${nomeUsuario}*\n\n*⌬┤ 📊 INFORMAÇÕES ├⌬*\n▢ 👑 *Responsável:* ${config.ownerName}\n▢ ⚙️ *Prefixo:* [ *${prefix}* ]\n▢ ⏱️ *Online há:* ${getTime()}\n▢ 📦 *Comandos:* ${total}\n\n> Escolha uma categoria para ver os comandos disponíveis.\n*╚══⌦ ${config.footer} ⌫══╝*`

  if (conn.noButtons || userDb?.noButtons) {
    const textoNoBtn = `${textoMenu}\n\n${categoriasTexto}`
    if (imageUrl) return conn.sendMessage(m.chat, { image: { url: imageUrl }, caption: textoNoBtn }, { quoted: m })
    return conn.sendMessage(m.chat, { text: textoNoBtn }, { quoted: m })
  }

  const header = await criarHeader(conn, imageUrl, `⌬ ${currentBotName}`)
  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
        interactiveMessage: {
          body: { text: textoMenu },
          footer: { text: `© ${new Date().getFullYear()} ${currentBotName}` },
          header,
          nativeFlowMessage: {
            buttons: [
              {
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                  title: '📁 SELECIONAR MENU',
                  sections: [{ title: '🌟 CATEGORIAS DISPONÍVEIS', rows }]
                })
              },
              {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                  display_text: '📢 Canal oficial',
                  url: config.groupLink || 'https://whatsapp.com',
                  merchant_url: config.groupLink || 'https://whatsapp.com'
                })
              }
            ]
          },
          contextInfo: getContextInfo(conn, m)
        }
      }
    }
  }, { quoted: m })

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

handler.all = async (m, { conn, isOwner, usedPrefix, groupDb, userDb }) => {
  if (m.responseId && m.responseId.startsWith('menu_cat_')) {
    const tag = m.responseId.replace('menu_cat_', '')
    await enviarSubmenu(conn, m, tag, isOwner, usedPrefix, groupDb, userDb)
  }
}

handler.help = ['menu']
handler.tags = ['info']
handler.command = [
  'menu', 'help', 'ajuda', 'ayuda', 'menú',
  ...Array.from({ length: 20 }, (_, i) => `menu${i + 1}`)
]

export default handler
