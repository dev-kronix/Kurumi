import { jidNormalizedUser } from '@whiskeysockets/baileys'

const handler = async (m, { conn, text, command, isOwner, participants }) => {
  const chatId = m.chat

  if (['vaciargp', 'vaciargrupo', 'limpargrupo'].includes(command)) {
    if (!m.isGroup) return m.reply('*⌬┤ ❌ ├⌬ SOMENTE GRUPOS.*')
    if (!m.isAdmin && !isOwner) return m.reply('*⌬┤ ❌ ├⌬ SOMENTE ADMINS.*')

    try {
      const keys = []
      for (const p of participants || []) {
        if (p?.id) keys.push(jidNormalizedUser(p.id))
        if (p?.lid) keys.push(jidNormalizedUser(p.lid))
      }
      await m.reply(`*⌬┤ 🧹 ├⌬ LIMPEZA SOLICITADA.*\n> O WhatsApp não permite apagar o histórico de todos os membros remotamente. Vou limpar o chat local da sessão da bot quando suportado.`)
      await conn.chatModify({ delete: true, lastMessages: [{ key: m.key, messageTimestamp: m.messageTimestamp }] }, chatId).catch(() => {})
      return
    } catch (e) {
      return m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível limpar o chat local.`)
    }
  }

  if (['vaciar', 'limparchat'].includes(command)) {
    try {
      await conn.chatModify({ delete: true, lastMessages: [{ key: m.key, messageTimestamp: m.messageTimestamp }] }, chatId)
      return m.reply(`*⌬┤ ✅ ├⌬ CHAT LOCAL LIMPO.*`)
    } catch (e) {
      return m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível limpar este chat.`)
    }
  }
}

handler.help = ['limparchat', 'limpargrupo']
handler.command = ['vaciar', 'limparchat', 'vaciargp', 'vaciargrupo', 'limpargrupo']
handler.tags = ['owner']
handler.ownerOnly = true
handler.noRegister = true

export default handler