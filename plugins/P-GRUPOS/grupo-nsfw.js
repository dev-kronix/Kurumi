const handler = async (m, { args, usedPrefix, command, groupDb }) => {
  const type = args[0]?.toLowerCase()
  if (!['on', 'off'].includes(type)) return m.reply(`*⌬┤ ✙ ├⌬ USO.*\n> *${usedPrefix}${command} on/off*`)

  const isEnable = type === 'on'
  if (groupDb.nsfw === isEnable) return m.reply(`*⌬┤ ⚠️ ├⌬ ESTADO ATUAL.*\n> O conteúdo NSFW já está *${isEnable ? 'ATIVADO' : 'DESATIVADO'}* neste grupo.`)

  groupDb.nsfw = isEnable
  await groupDb.save()

  m.reply(`*⌬┤ 🔞 ├⌬ NSFW ${isEnable ? 'ATIVADO' : 'DESATIVADO'}.*\n> O conteúdo +18 ${isEnable ? 'agora está permitido' : 'foi bloqueado'} neste grupo.`)
}

handler.help = ['nsfw <on/off>']
handler.tags = ['group']
handler.command = ['nsfw']
handler.groupOnly = true
handler.adminOnly = true
handler.noRegister = true

export default handler