import GroupDb from '../../lib/database/models/zen-groups.js'
import { groupDbCache } from '../../lib/caches.js'

async function actualizarGroupDb(groupDb, updates) {
  Object.assign(groupDb, updates)
  await GroupDb.findOneAndUpdate(
    { id: groupDb.id },
    { $set: updates },
    { upsert: true }
  )
  groupDbCache.set(groupDb.id, groupDb)
}

const handler = async (m, { conn, args, command, usedPrefix, isAdmin, isOwner, groupDb }) => {
  const senderNum = m.sender.split('@')[0]
  const esSubBotDueno = conn.isSubBot && senderNum === conn.ownerNumber
  const puedeUsar = isAdmin || isOwner || esSubBotDueno

  if (!puedeUsar) {
    return m.reply(`*⌬┤ ❌ ├⌬ SEM PERMISSÃO*\n> Somente admins ou o dono da bot podem usar este comando.`)
  }

  const newState = !groupDb.onlyadmin
  await actualizarGroupDb(groupDb, { onlyadmin: newState })

  return m.reply(
    `*⌬┤ 👤 MODERAÇÃO DO GRUPO ├⌬*\n\n` +
    `> O modo *Somente Administradores* foi: *${newState ? 'ATIVADO ✅' : 'DESATIVADO ❌'}*.\n` +
    `> ${newState ? 'Agora somente admins e donos podem usar comandos neste grupo.' : 'Todos os integrantes podem usar comandos livremente.'}`
  )
}

handler.help = ['somenteadmin — ativa ou desativa comandos somente para admins']
handler.tags = ['jadibot']
handler.command = ['onlyadmin', 'soloadmin', 'adminonly', 'somenteadmin', 'soadmin']
handler.groupOnly = true
handler.noRegister = true

export default handler