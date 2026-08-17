const handler = async (m, { args, groupDb, usedPrefix, command }) => {
  const modo = args[0]?.toLowerCase()
  if (!['on', '1', 'true', 'activar', 'ativar', 'off', '0', 'false', 'desactivar', 'desativar'].includes(modo)) {
    return m.reply(`*⌬┤ ✙ ├⌬ MODO INVÁLIDO.*\n> Use: *${usedPrefix}${command} on | off*`)
  }

  const activar = ['on', '1', 'true', 'activar', 'ativar'].includes(modo)
  groupDb.antimenciongp = activar
  await groupDb.save()
  
  return m.reply(`*⌬┤ 📢 ├⌬ ANTI MENÇÃO DE STATUS ${activar ? 'ATIVADO' : 'DESATIVADO'}.*`)
}

handler.before = async (m, { conn }) => {
  if (m.chat !== 'status@broadcast') return false

  const groupMentions = m.msg?.contextInfo?.groupMentions
  if (!groupMentions?.length) return false

  const sender = m.sender
  const nombre = sender.split('@')[0]

  for (const grupo of groupMentions) {
    const groupJid = typeof grupo === 'string' ? grupo : (grupo?.groupJid || grupo?.jid || '')
    if (!groupJid || !groupJid.endsWith('@g.us')) continue
    
    const targetGroupDb = await import('../../lib/database/models/zen-groups.js').then(M => M.default.findOne({ id: groupJid }).lean())
    if (!targetGroupDb?.antimenciongp) continue
    
    let meta
    try { meta = await conn.groupMetadata(groupJid) } catch {}
    const participantes = meta?.participants || []
    const senderEnGrupo = participantes.find(p => p.id?.split(':')[0] + '@s.whatsapp.net' === sender || p.id === sender)
    
    if (senderEnGrupo?.admin) continue
    
    try { await conn.groupParticipantsUpdate(groupJid, [sender], 'remove') } catch {}
    await conn.sendMessage(groupJid, { text: `*⌬┤ 📢 ├⌬ EXPULSO.*\n> @${nombre} foi expulso por marcar este grupo no status do WhatsApp.`, mentions: [sender] })
  }
  return false
}

handler.help = ['antimencaogrupo <on/off>']
handler.tags = ['group']
handler.command = ['antimenciongp', 'antimencaogrupo', 'antimencao']
handler.adminOnly = true
handler.alwaysBefore = true
handler.noRegister = true

export default handler