const handler = async (m, { conn, command, text, usedPrefix }) => {
  const priv = command.replace(/^privacy/, '')
  const accion = text?.toLowerCase()
  if (!['all', 'contacts', 'contactos', 'contatos', 'none', 'nobody', 'ninguno', 'ninguem', 'known'].includes(accion)) {
    return m.reply(`*⌬┤ ✙ ├⌬ USO:* ${usedPrefix + command} <all | contacts | none>`)
  }

  const value = ['all'].includes(accion) ? 'all'
    : ['contacts', 'contactos', 'contatos', 'known'].includes(accion) ? 'contacts'
    : 'none'

  const map = {
    lastseen:   () => conn.updateLastSeenPrivacy(value),
    online:     () => conn.updateOnlinePrivacy(value),
    profile:    () => conn.updateProfilePicturePrivacy(value),
    foto:       () => conn.updateProfilePicturePrivacy(value),
    status:     () => conn.updateStatusPrivacy(value),
    estado:     () => conn.updateStatusPrivacy(value),
    read:       () => conn.updateReadReceiptsPrivacy(value),
    lectura:    () => conn.updateReadReceiptsPrivacy(value),
    leitura:    () => conn.updateReadReceiptsPrivacy(value),
    groupsadd:  () => conn.updateGroupsAddPrivacy(value),
    groups:     () => conn.updateGroupsAddPrivacy(value),
    grupos:     () => conn.updateGroupsAddPrivacy(value),
    calls:      () => conn.updateCallPrivacy(value),
    chamadas:   () => conn.updateCallPrivacy(value),
  }

  if (!map[priv]) return m.reply(`*⌬┤ ✙ ├⌬ TIPO INVÁLIDO.*`)

  try {
    await map[priv]()
    m.reply(`*⌬┤ ✅ ├⌬ PRIVACIDADE ATUALIZADA.*\n> *${priv}* → *${value}*`)
  } catch (e) {
    m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> ${e.message}`)
  }
}

handler.help = ['privacylastseen <all/contacts/none>']
handler.command = ['privacylastseen','privacyonline','privacyprofile','privacyfoto','privacystatus','privacyestado','privacyread','privacyleitura','privacygroupsadd','privacygroups','privacygrupos','privacycalls','privacychamadas']
handler.tags = ['owner']
handler.ownerOnly = true
handler.noRegister = true

export default handler