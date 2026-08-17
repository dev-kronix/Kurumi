const MEDIA_CONFIG = {
  antinotadevoz: { emoji: '🎙️', name: 'ANTI ÁUDIO', dbKey: 'antinotadevoz', msg: 'as mensagens de voz' },
  antiaudio:     { emoji: '🎙️', name: 'ANTI ÁUDIO', dbKey: 'antinotadevoz', msg: 'as mensagens de voz' },
  antivoz:       { emoji: '🎙️', name: 'ANTI ÁUDIO', dbKey: 'antinotadevoz', msg: 'as mensagens de voz' },
  antisticker:   { emoji: '🎭', name: 'ANTI STICKER', dbKey: 'antisticker', msg: 'os stickers' },
  antivideo:     { emoji: '🎬', name: 'ANTI VÍDEO', dbKey: 'antivideo', msg: 'os vídeos' },
  antiimagen:    { emoji: '🖼️', name: 'ANTI IMAGEM', dbKey: 'antiimagen', msg: 'as imagens' },
  antiimagem:    { emoji: '🖼️', name: 'ANTI IMAGEM', dbKey: 'antiimagen', msg: 'as imagens' },
}

const handler = async (m, { args, groupDb, usedPrefix, command }) => {
  const conf = MEDIA_CONFIG[command]
  if (!conf) return

  const modo = args[0]?.toLowerCase()
  if (!['on', '1', 'true', 'activar', 'ativar', 'off', '0', 'false', 'desactivar', 'desativar'].includes(modo)) {
    return m.reply(`*⌬┤ ✙ ├⌬ MODO INVÁLIDO.*\n> Use: *${usedPrefix}${command} on | off*`)
  }

  const activar = ['on', '1', 'true', 'activar', 'ativar'].includes(modo)
  groupDb[conf.dbKey] = activar
  await groupDb.save()
  
  return m.reply(`*⌬┤ ${conf.emoji} ├⌬ ${conf.name} ${activar ? 'ATIVADO' : 'DESATIVADO'}.*`)
}

handler.before = async (m, { conn, isAdmin, isOwner, groupDb }) => {
  if (!m.isGroup || m.fromMe || isAdmin || isOwner || !groupDb || !m.mtype) return false

  const sender = m.sender
  const nombre = sender.split('@')[0]

  const checks = [
    { flag: 'antinotadevoz', match: m.mtype === 'audioMessage' && m.msg?.ptt === true },
    { flag: 'antisticker', match: m.mtype === 'stickerMessage' },
    { flag: 'antivideo', match: m.mtype === 'videoMessage' && !m.msg?.gifPlayback },
    { flag: 'antiimagen', match: m.mtype === 'imageMessage' },
  ]
  
  for (const { flag, match } of checks) {
    if (!match || !groupDb[flag]) continue
    const conf = MEDIA_CONFIG[flag]
    
    try { await conn.sendMessage(m.chat, { delete: m.key }) } catch {}
    await conn.sendMessage(m.chat, { text: `*⌬┤ ${conf.emoji} ├⌬ REMOVIDO.*\n> @${nombre}, ${conf.msg} não são permitidos neste grupo.`, mentions: [sender] })
    return true
  }

  return false
}

handler.help = ['antiaudio', 'antisticker', 'antivideo', 'antiimagem']
handler.tags = ['group']
handler.command = ['antinotadevoz', 'antiaudio', 'antivoz', 'antisticker', 'antivideo', 'antiimagen', 'antiimagem']
handler.groupOnly = true
handler.adminOnly = true
handler.alwaysBefore = true
handler.noRegister = true

export default handler