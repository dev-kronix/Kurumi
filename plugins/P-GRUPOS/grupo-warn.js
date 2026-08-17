import User from '../../lib/database/models/zen-users.js'
import GroupDb from '../../lib/database/models/zen-groups.js'
import config from '../../config.js'

const extraerNum = (jid) => (jid || '').split('@')[0].split(':')[0].replace(/\D/g, '')
const chatKey = (jid) => (jid || '').replace(/\./g, '_').replace(/@/g, '_at_')

const esOwner = (jid) => {
  let n = extraerNum(jid)
  if (n.startsWith('549')) n = '54' + n.slice(3)
  if (n.startsWith('521')) n = '52' + n.slice(3)
  return config.ownerNumber.some(o => {
    let a = extraerNum(o)
    if (a.startsWith('549')) a = '54' + a.slice(3)
    if (a.startsWith('521')) a = '52' + a.slice(3)
    return a === n
  })
}

const handler = async (m, { conn, args, command, groupDb, participants, usedPrefix, isAdmin, isOwner, isBotAdmin }) => {

  if (!['warns', 'avisos'].includes(command) && !isAdmin && !isOwner) {
    return m.reply(`*⌬┤ 👤 ├⌬ SOMENTE ADMINS.*\n> @${m.sender.split('@')[0]}, você precisa ser admin para usar este comando.`, { mentions: [m.sender] })
  }

  if (['setwarnlimit', 'limiteavisos'].includes(command)) {
    const num = parseInt(args[0])
    if (isNaN(num) || num < 1 || num > 10) {
      return m.reply(`*⌬┤ ✙ ├⌬ LIMITE INVÁLIDO.*\n> Digite um número entre 1 e 10.\n> *Ex:* ${usedPrefix}${command} 5`)
    }
    await GroupDb.updateOne({ id: m.chat }, { warnLimit: num }, { upsert: true })
    groupDb.warnLimit = num
    return m.reply(`*⌬┤ ⚙️ ├⌬ LIMITE ATUALIZADO.*\n> O novo limite de advertências é *${num}*.`)
  }

  const target = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null)

  if (['warns', 'avisos'].includes(command)) {
    const who = target || m.sender
    const targetDb = await User.findOne({ jid: { $regex: `^${extraerNum(who)}@` } })
    const key = chatKey(m.chat)
    const currentWarns = targetDb?.warns?.get(key) || 0
    const limit = groupDb?.warnLimit || 3
    return m.reply(`*⌬┤ ⚠️ ├⌬ ADVERTÊNCIAS*\n> @${who.split('@')[0]} possui *${currentWarns}/${limit}* advertências neste grupo.`, { mentions: [who] })
  }

  if (!target) return m.reply(`*⌬┤ ✙ ├⌬ USUÁRIO OBRIGATÓRIO.*\n> Mencione ou responda à mensagem do usuário.`)
  if (target === conn.user.id) return m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não posso advertir a mim mesma.`)
  if (esOwner(target)) return m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Você não pode advertir o dono da bot.`)

  const pTarget = participants.find(p => p.id === target)
  if (pTarget?.admin) return m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Você não pode advertir um administrador.`)

  const numTarget = extraerNum(target)
  let targetDb = await User.findOne({ jid: { $regex: `^${numTarget}@` } })
  if (!targetDb) {
    targetDb = new User({ jid: target })
    await targetDb.save()
  }

  const key = chatKey(m.chat)
  const limit = groupDb?.warnLimit || 3
  let currentWarns = targetDb.warns?.get(key) || 0

  if (['unwarn', 'delwarn', 'removeraviso'].includes(command)) {
    if (currentWarns <= 0) return m.reply(`*⌬┤ ❕ ├⌬ SEM ADVERTÊNCIAS.*\n> O usuário não possui advertências neste grupo.`)
    targetDb.warns.set(key, currentWarns - 1)
    targetDb.markModified('warns')
    await targetDb.save()
    return m.reply(`*⌬┤ ♻️ ├⌬ ADVERTÊNCIA REMOVIDA.*\n> Uma advertência foi removida de @${target.split('@')[0]}.\n> *Total:* ${currentWarns - 1}/${limit}`, { mentions: [target] })
  }

  if (['warn', 'avisar'].includes(command)) {
    if (!isBotAdmin) return m.reply(`*⌬┤ 🤖 ├⌬ BOT SEM PERMISSÃO.*\n> Preciso ser administradora para expulsar usuários quando atingirem o limite.`)

    currentWarns += 1

    if (currentWarns >= limit) {
      targetDb.warns.delete(key)
      targetDb.markModified('warns')
      await targetDb.save()

      try { await conn.groupParticipantsUpdate(m.chat, [target], 'remove') } catch {}
      return m.reply(`*⌬┤ 🚫 ├⌬ EXPULSO.*\n> @${target.split('@')[0]} atingiu o limite de *${limit} advertências* e foi removido do grupo.`, { mentions: [target] })
    } else {
      targetDb.warns.set(key, currentWarns)
      targetDb.markModified('warns')
      await targetDb.save()

      const reason = args.join(' ').replace(/@\d+/g, '').trim() || 'Sem motivo'
      return m.reply(`*⌬┤ ⚠️ ├⌬ ADVERTÊNCIA.*\n> @${target.split('@')[0]}, você recebeu uma advertência.\n> *Motivo:* ${reason}\n> *Estado:* ${currentWarns}/${limit}`, { mentions: [target] })
    }
  }
}

handler.help = ['avisar @usuario', 'removeraviso @usuario', 'avisos', 'limiteavisos <1-10>']
handler.tags = ['group']
handler.command = ['warn', 'avisar', 'unwarn', 'delwarn', 'removeraviso', 'setwarnlimit', 'limiteavisos', 'warns', 'avisos']
handler.groupOnly = true
handler.noRegister = true

export default handler
