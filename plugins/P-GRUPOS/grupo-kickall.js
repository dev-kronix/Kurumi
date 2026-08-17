import * as baileysMod from '@whiskeysockets/baileys'

const pkg = baileysMod.default && Object.keys(baileysMod).length === 1 ? baileysMod.default : baileysMod
const { jidNormalizedUser } = pkg

const handler = async (m, { conn, participants, config, isOwner }) => {
  const isGroupCreator = participants.some(p => 
    p.admin === 'superadmin' && 
    (jidNormalizedUser(p.id) === jidNormalizedUser(m.sender) || (p.lid && jidNormalizedUser(p.lid) === jidNormalizedUser(m.sender)))
  )

  const puedeUsar = isOwner || isGroupCreator

  if (!puedeUsar) {
    return m.reply(`*⌬┤ ❌ ├⌬ ACESSO NEGADO.*\n\n> Este comando de limpeza em massa é exclusivo do *Criador do Grupo* ou do *Dono da Bot*.`)
  }

  const botJid = jidNormalizedUser(conn.user.id)
  const botLid = conn.user.lid ? jidNormalizedUser(conn.user.lid) : null
  const senderJid = jidNormalizedUser(m.sender)

  const targets = participants
    .map(p => jidNormalizedUser(p.id))
    .filter(id => {
      if (id === botJid || id === botLid || id === senderJid) return false
      
      const num = id.split('@')[0].replace(/\D/g, '')
      const owners = Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber]
      
      const esOwnerTarget = owners.some(o => {
        let a = o.replace(/\D/g, '')
        if (a.startsWith('549')) a = '54' + a.slice(3)
        if (a.startsWith('521')) a = '52' + a.slice(3)
        let b = num
        if (b.startsWith('549')) b = '54' + b.slice(3)
        if (b.startsWith('521')) b = '52' + b.slice(3)
        return a === b
      })
      
      return !esOwnerTarget
    })

  if (targets.length === 0) {
    return m.reply(`*⌬┤ ℹ️ ├⌬ GRUPO VAZIO.*\n\n> Não há membros elegíveis para expulsar neste grupo.`)
  }

  await m.reply(`*⌬┤ 🥾 ├⌬ INICIANDO LIMPEZA EM MASSA.*\n\n> Expulsando *${targets.length}* membros do grupo...`)

  try {
    const batchSize = 10
    for (let i = 0; i < targets.length; i += batchSize) {
      const batch = targets.slice(i, i + batchSize)
      await conn.groupParticipantsUpdate(m.chat, batch, 'remove')
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    m.reply(`*⌬┤ 🗑️ ├⌬ LIMPEZA CONCLUÍDA.*\n\n> Todos os membros elegíveis foram expulsos com sucesso.`)
  } catch (e) {
    console.error('[KICKALL ERROR]', e)
    m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n\n> Ocorreu um erro inesperado ao tentar expulsar os membros.`)
  }
}

handler.help = ['expulsartodos']
handler.tags = ['group']
handler.command = ['kickall', 'banall', 'expulsartodos', 'echaratodos', 'removerTodos']
handler.groupOnly = true
handler.adminOnly = true
handler.botAdminOnly = true
handler.noRegister = true

export default handler