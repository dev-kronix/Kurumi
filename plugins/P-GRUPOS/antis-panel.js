const CONFIGS = [
  { key: 'antilink', emoji: '🔗', name: 'ANTI LINK', command: 'antilink' },
  { key: 'antinotadevoz', emoji: '🎙️', name: 'ANTI ÁUDIO', command: 'antiaudio' },
  { key: 'antimenciongp', emoji: '📢', name: 'ANTI MENÇÃO DE STATUS', command: 'antimencaogrupo' },
  { key: 'antisticker', emoji: '🎭', name: 'ANTI STICKER', command: 'antisticker' },
  { key: 'antivideo', emoji: '🎬', name: 'ANTI VÍDEO', command: 'antivideo' },
  { key: 'antiimagen', emoji: '🖼️', name: 'ANTI IMAGEM', command: 'antiimagem' },
  { key: 'antidelete', emoji: '🗑️', name: 'ANTI-EXCLUSÃO', command: 'antiexclusao' },
  { key: 'antitoxic', emoji: '🚫', name: 'ANTI TÓXICO', command: 'antitoxico' }
]

const handler = async (m, { groupDb, groupMetadata, usedPrefix }) => {
  const grupoName = groupMetadata?.subject || 'este grupo'
  let texto = `*⌬┤ 🛡️ ├⌬ PAINEL DE PROTEÇÃO*\n> Grupo: *${grupoName}*\n\n`
  
  for (const conf of CONFIGS) {
    const estado = groupDb[conf.key] ? '🟢 ON' : '🔴 OFF'
    texto += `*${conf.emoji} ${conf.name}* [${estado}]\n> _${usedPrefix}${conf.command} on/off_\n\n`
  }
  
  return m.reply(texto.trim())
}

handler.help = ['protecao']
handler.tags = ['group']
handler.command = ['antis', 'protecao', 'painelprotecao']
handler.groupOnly = true
handler.adminOnly = true
handler.noRegister = true

export default handler