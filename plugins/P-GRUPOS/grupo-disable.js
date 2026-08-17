import GroupDb from '../../lib/database/models/zen-groups.js'
import { groupDbCache } from '../../lib/caches.js'

const ETIQUETAS = ['info', 'owner', 'rpg', 'eco', 'registro', 'juegos', 'fun', 'group', 'tools', 'descargas', 'busquedas', 'convertidores', 'anime', 'nsfw', 'jadibot', 'otros']

const handler = async (m, { args, usedPrefix, command, groupDb }) => {
  const isEnable = ['enable', 'activar', 'ativar', 'habilitar'].includes(command)
  const target = args[0]?.toLowerCase()
  
  if (!target) return m.reply(`*⌬┤ ℹ️ ├⌬ USO CORRETO:*\n> ${usedPrefix}${command} <comando | categoria>\n\n> _Exemplo: ${usedPrefix}${command} nsfw_`)

  if (!groupDb) {
    groupDb = await GroupDb.findOne({ id: m.chat }) || new GroupDb({ id: m.chat })
  }

  if (ETIQUETAS.includes(target)) {
     if (isEnable) {
        groupDb.disabledCategories = groupDb.disabledCategories.filter(c => c !== target)
     } else {
        if (!groupDb.disabledCategories.includes(target)) groupDb.disabledCategories.push(target)
     }
  } else {
     if (isEnable) {
        groupDb.disabledCmds = groupDb.disabledCmds.filter(c => c !== target)
     } else {
        if (!groupDb.disabledCmds.includes(target)) groupDb.disabledCmds.push(target)
     }
  }

  await GroupDb.updateOne({ id: m.chat }, { 
     $set: { 
        disabledCategories: groupDb.disabledCategories, 
        disabledCmds: groupDb.disabledCmds 
     } 
  }, { upsert: true })

  groupDbCache.set(m.chat, groupDb)

  m.reply(`*⌬┤ ✅ ├⌬ SUCESSO*\n> ${target.toUpperCase()} foi ${isEnable ? 'habilitado' : 'desabilitado'} neste grupo.`)
}

handler.help = ['desabilitar <cmd/categoria>', 'habilitar <cmd/categoria>']
handler.tags = ['group']
handler.command = ['disable', 'desactivar', 'desativar', 'desabilitar', 'enable', 'activar', 'ativar', 'habilitar']
handler.adminOnly = true
handler.groupOnly = true
handler.noRegister = true

export default handler