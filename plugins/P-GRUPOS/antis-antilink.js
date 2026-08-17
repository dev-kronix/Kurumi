const GROUP_LINK_REGEX = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i
const CHANNEL_LINK_REGEX = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,24})/i

const channelWarns = new Map()

const handler = async (m, { args, groupDb }) => {
  const option = args[0]?.toLowerCase()

  if (!option) {
    return m.reply(`*⌬┤ 🔗 ├⌬ ANTILINK*\n\n> Estado: ${groupDb.antilink ? '✅ ON' : '❌ OFF'}\n> *Uso:* .antilink on / off`)
  }

  if (['on', '1', 'true', 'activar', 'ativar', 'enable'].includes(option)) {
    if (groupDb.antilink) return m.reply(`*⌬┤ ⚠️ ├⌬ JÁ ATIVADO*\n> O antilink já estava ativado.`)

    groupDb.antilink = true
    await groupDb.save()
    return m.reply(`*⌬┤ ✅ ├⌬ ANTILINK ATIVADO*\n> Links de outros grupos serão removidos e o infrator será expulso. Links de canais gerarão advertência.`)

  } else if (['off', '0', 'false', 'desactivar', 'desativar', 'disable'].includes(option)) {
    if (!groupDb.antilink) return m.reply(`*⌬┤ ⚠️ ├⌬ JÁ DESATIVADO*\n> O antilink já estava desativado.`)

    groupDb.antilink = false
    await groupDb.save()
    return m.reply(`*⌬┤ ❌ ├⌬ ANTILINK DESATIVADO*`)

  } else {
    return m.reply(`*⌬┤ ❕ ├⌬ OPÇÃO INVÁLIDA*\n> Use: .antilink on / off`)
  }
}

handler.before = async (m, { conn, isAdmin, isOwner, isBotAdmin, groupDb }) => {
  if (!m.isGroup || m.fromMe) return false
  if (!groupDb?.antilink) return false
  if (isAdmin || isOwner || !isBotAdmin) return false

  const text = m.body || m.text || ''
  if (!text) return false

  const isGroupLink = GROUP_LINK_REGEX.test(text)
  const isChannelLink = CHANNEL_LINK_REGEX.test(text)

  if (!isGroupLink && !isChannelLink) return false

  if (isGroupLink) {
    const groupMatch = text.match(GROUP_LINK_REGEX)
    if (groupMatch) {
      const linkCode = groupMatch[1]
      const currentCode = await conn.groupInviteCode(m.chat).catch(() => null)
      if (currentCode && linkCode === currentCode) return false
    }

    try {
      await conn.sendMessage(m.chat, { delete: m.key })
      await m.reply(`*⌬┤ 🔗 LINK DE GRUPO DETECTADO ├⌬*\n\n> @${m.sender.split('@')[0]}, links externos não são permitidos. Você será expulso imediatamente.`, { mentions: [m.sender] })
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    } catch (e) {
      console.error('[ANTILINK GROUP ERROR]', e.message)
    }
    return true
  }

  if (isChannelLink) {
    const key = `${m.chat}:${m.sender}`
    const hasWarning = channelWarns.has(key)

    try {
      await conn.sendMessage(m.chat, { delete: m.key })

      if (!hasWarning) {
        channelWarns.set(key, true)
        await m.reply(`*⌬┤ 📢 ADVERTÊNCIA DE CANAL ├⌬*\n\n> @${m.sender.split('@')[0]}, links de canais não são permitidos.\n> Esta é sua *primeira advertência*. Se enviar outro link de canal, você será expulso do grupo.`, { mentions: [m.sender] })
      } else {
        channelWarns.delete(key)
        await m.reply(`*⌬┤ 🥾 EXPULSÃO POR LINK DE CANAL ├⌬*\n\n> @${m.sender.split('@')[0]} foi expulso por reincidir no envio de links de canais do WhatsApp.`, { mentions: [m.sender] })
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      }
    } catch (e) {
      console.error('[ANTILINK CHANNEL ERROR]', e.message)
    }
    return true
  }

  return false
}

handler.help = ['antilink <on/off>']
handler.tags = ['group']
handler.command = ['antilink', 'antienlace', 'antilinkgrupo']
handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.alwaysBefore = true
handler.noRegister = true

export default handler