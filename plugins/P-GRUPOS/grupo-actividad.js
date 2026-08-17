import fs from 'fs'
import path from 'path'
import * as baileysMod from '@whiskeysockets/baileys'
import config from '../../config.js'

const pkg = baileysMod.default && Object.keys(baileysMod).length === 1 ? baileysMod.default : baileysMod
const { jidNormalizedUser } = pkg

const DATA_DIR = path.resolve('./lib/database/data/activity')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const writeQueue = new Map()

function getFilePath(groupId) {
  return path.join(DATA_DIR, `${groupId.replace('@g.us', '')}.json`)
}

function readActivity(groupId) {
  const fp = getFilePath(groupId)
  try {
    if (fs.existsSync(fp)) return JSON.parse(fs.readFileSync(fp, 'utf-8'))
  } catch {}
  return {}
}

function scheduleWrite(groupId, data) {
  if (writeQueue.has(groupId)) return
  writeQueue.set(groupId, setTimeout(() => {
    writeQueue.delete(groupId)
    try {
      fs.writeFileSync(getFilePath(groupId), JSON.stringify(data, null, 2))
    } catch (e) {
      console.error(`[ATIVIDADE] Erro ao salvar ${groupId}:`, e.message)
    }
  }, 3000))
}

const memCache = new Map()

function getCache(groupId) {
  if (!memCache.has(groupId)) memCache.set(groupId, readActivity(groupId))
  return memCache.get(groupId)
}

function resolveJid(p) {
  if (p.phoneNumber) {
    const num = p.phoneNumber
    return jidNormalizedUser(num.includes('@') ? num : `${num}@s.whatsapp.net`)
  }
  if (!p.id.endsWith('@lid')) return jidNormalizedUser(p.id)
  return null
}

const handler = async (m, { conn, participants, isAdmin, isOwner, args, command }) => {
  if (!m.isGroup) return m.reply(`*⌬┤ 👥 ├⌬ SOMENTE GRUPOS.*\n> Este comando funciona apenas em grupos.`)

  const sub = (args[0] || '').toLowerCase()

  if (sub === 'reset') {
    if (!isAdmin && !isOwner) {
      return m.reply(`*⌬┤ 👤 ├⌬ SOMENTE ADMINS.*\n> Você precisa ser admin para resetar a atividade.`)
    }
    memCache.set(m.chat, {})
    try { fs.writeFileSync(getFilePath(m.chat), '{}') } catch {}
    return m.reply(`*⌬┤ ✅ ├⌬ RESET CONCLUÍDO.*\n> O contador de atividade do grupo foi reiniciado.`)
  }

  const data     = getCache(m.chat)
  const mentions = []
  let txt        = ''

  const esInactivos = ['inactivos', 'inactive', 'nulos', 'inativos'].includes(command)

  if (esInactivos) {
    const botJid = jidNormalizedUser(conn.user.id)
    const umbral = Number.isInteger(parseInt(args[0])) && parseInt(args[0]) >= 0
      ? parseInt(args[0])
      : 0

    const inactivos = participants
      .filter(p => {
        const jid = resolveJid(p)
        if (!jid) return false
        if (jid === botJid) return false
        return (data[jid] || 0) <= umbral
      })
      .sort((a, b) => (data[resolveJid(a)] || 0) - (data[resolveJid(b)] || 0))
      .slice(0, 20)

    if (inactivos.length === 0) {
      return m.reply(`*⌬┤ ✅ ├⌬ SEM RESULTADOS.*\n> Nenhum membro tem ${umbral} mensagem${umbral === 1 ? '' : 's'} ou menos.`)
    }

    const tituloFiltro = umbral === 0 ? 'SEM MENSAGENS' : `${umbral} MSGS OU MENOS`

    txt = `*╔═══⌦ ✦ 😴 INATIVOS ✦ ⌫═══╗*\n\n`
    txt += `*⌬┤ 💤 ${tituloFiltro} ├⌬*\n`
    inactivos.forEach((p, i) => {
      const jid  = resolveJid(p)
      const msgs = data[jid] || 0
      mentions.push(jid)
      txt += `> *${i + 1}.* @${jid.split('@')[0]} — ${msgs} msgs\n`
    })
    txt += `\n*━━━━━━━━━━━━━━━━━━━━*\n`
    txt += `> 😴 *Encontrados:* ${inactivos.length} usuários\n`
    txt += `> 👥 *Total no grupo:* ${participants.length}\n`
    txt += `*╚══⌦ ${config.footer} ⌫══╝*`

  } else {
    const sorted = Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, 20)

    if (sorted.length === 0) {
      return m.reply(`*⌬┤ 📊 ├⌬ SEM DADOS.*\n> Ainda não há atividade registrada neste grupo.`)
    }

    const totalMsgs = Object.values(data).reduce((a, b) => a + b, 0)
    const medals    = ['🥇', '🥈', '🥉']

    txt = `*╔═══⌦ ✦ 📊 ATIVIDADE ✦ ⌫═══╗*\n\n`
    txt += `*⌬┤ 🔥 MAIS ATIVOS ├⌬*\n`
    sorted.forEach(([jid, count], i) => {
      mentions.push(jid)
      txt += `> ${medals[i] || `*${i + 1}.*`} @${jid.split('@')[0]} — ${count} msgs\n`
    })
    txt += `\n*━━━━━━━━━━━━━━━━━━━━*\n`
    txt += `> 📨 *Total de mensagens:* ${totalMsgs}\n`
    txt += `> 👥 *Usuários com atividade:* ${Object.keys(data).length}\n`
    txt += `*╚══⌦ ${config.footer} ⌫══╝*`
  }

  await conn.sendMessage(m.chat, { text: txt, mentions }, { quoted: m })
}

handler.all = async function (m) {
  if (!m.isGroup || !m.sender || m.isBaileys) return
  if (!m.message) return

  const data = getCache(m.chat)
  data[m.sender] = (data[m.sender] || 0) + 1
  scheduleWrite(m.chat, data)
}

handler.help      = ['atividade', 'inativos']
handler.tags      = ['group']
handler.command   = ['actividad', 'atividade', 'activos', 'ativos', 'activity', 'rank', 'ranking', 'inactivos', 'inativos', 'inactive', 'nulos']
handler.groupOnly = true
handler.noRegister = true

export default handler
