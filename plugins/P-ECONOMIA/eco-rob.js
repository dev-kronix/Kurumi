import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const extraerNum = (jid = '') => (typeof jid === 'string' ? jid : '').split('@')[0].split(':')[0].replace(/\D/g, '')

const resolveTargetJid = (m, participants = []) => {
  const raw = m.mentionedJid?.[0] || m.quoted?.sender || null
  if (!raw) return null
  if (!raw.endsWith('@lid')) return raw
  const p = participants.find(p => p.id === raw || p.lid === raw)
  if (p?.phoneNumber) return `${String(p.phoneNumber).replace(/\D/g, '')}@s.whatsapp.net`
  if (p?.id?.includes('@s.whatsapp.net')) return p.id
  return raw
}

const findByNum = (jid) => {
  const num = extraerNum(jid)
  if (!num) return null
  return User.findOne({ jid: { $regex: `^${num}@` } })
}

const SHIELD_REFUND = {
  normal: 0,
  rare: 0.05,
  mythic: 0.15
}

const SHIELD_ICON = {
  normal: '🛡️',
  rare: '🔰',
  mythic: '✨'
}

function bestShield(inv) {
  const stock = inv?.shieldStock instanceof Map ? Object.fromEntries(inv.shieldStock) : (inv?.shieldStock || {})
  for (const tier of ['mythic', 'rare', 'normal']) {
    if (stock[tier] > 0) return { tier }
  }
  if ((inv?.shield || 0) > 0 && !stock.normal && !stock.rare && !stock.mythic) {
    return { tier: 'normal', legacy: true }
  }
  return null
}

const handler = async (m, { userDb, participants }) => {
    if (!userDb) return
    const senderJid = userDb.jid
    const cooldown = 1800000
    const now = Date.now()
    const r = now - (userDb.lastRob || 0)

    if (r < cooldown) {
        const f = cooldown - r
        return m.reply(`*⌬┤ ⏳ ├⌬ AGUARDE.*\n> Tente novamente em: *${Math.floor(f / 60000)}m ${Math.floor((f % 60000) / 1000)}s*.`)
    }

    const targetRaw = resolveTargetJid(m, participants)
    if (!targetRaw || extraerNum(targetRaw) === extraerNum(m.sender)) {
        return m.reply('*⌬┤ ⚠️ · MARQUE OU RESPONDA A ALGUÉM.*')
    }

    const v = await findByNum(targetRaw)
    if (!v) return m.reply('*⌬┤ ❌ · USUÁRIO NÃO CADASTRADO.*')

    const targetJid = v.jid
    const shield = bestShield(v.inventory)

    if (shield) {
        userDb.lastRob = now

        const updateTarget = { $inc: {} }
        if (shield.legacy) {
            updateTarget.$inc['inventory.shield'] = -1
        } else {
            updateTarget.$inc[`inventory.shieldStock.${shield.tier}`] = -1
            updateTarget.$inc['inventory.shield'] = -1
        }

        const refundPct = SHIELD_REFUND[shield.tier] || 0
        let refund = 0
        if (refundPct > 0) {
            refund = Math.floor((userDb.zenCoins || 0) * refundPct)
            if (refund > 0) {
                updateTarget.$inc.zenCoins = refund
                userDb.zenCoins -= refund
            }
        }

        const updateSender = { $set: { lastRob: now } }
        if (refund > 0) updateSender.$inc = { zenCoins: -refund }

        await Promise.all([
          User.updateOne({ jid: targetJid }, updateTarget),
          User.updateOne({ jid: senderJid }, updateSender)
        ])

        let txt = `*⌬┤ ${SHIELD_ICON[shield.tier]} ├⌬ ROUBO BLOQUEADO*\n\n> Você tentou roubar @${extraerNum(targetJid)}, mas o *Escudo* foi ativado e bloqueou o ataque. O escudo foi destruído.`
        if (refund > 0) {
            txt += `\n> 💸 Além disso, o escudo aplicou uma penalidade: você perdeu *${refund} ${config.CURRENCY_NAME}*, transferidos para @${extraerNum(targetJid)}.`
        }

        return m.reply(txt, { mentions: [targetJid] })
    }

    const bancoProtegido = v.bankExpiry > now
    let capitalExpuesto = v.zenCoins
    if (!bancoProtegido) capitalExpuesto += v.bankBalance

    if (capitalExpuesto < 500) return m.reply('*⌬┤ ❌ ├⌬ VÍTIMA SEM RECURSOS.*\n> Ela não possui capital exposto suficiente para valer o risco.')

    userDb.lastRob = now

    let chanceExito = 0.5
    if (userDb.inventory?.amulet === 'thief') chanceExito = 0.6

    if (Math.random() < chanceExito) {
        const robado = Math.floor(capitalExpuesto * 0.10)
        let lossWallet = 0, lossBank = 0

        if (v.zenCoins >= robado) {
            lossWallet = robado
        } else {
            lossWallet = v.zenCoins
            lossBank = robado - v.zenCoins
        }

        userDb.zenCoins += robado
        await Promise.all([
          User.updateOne({ jid: targetJid }, { $inc: { zenCoins: -lossWallet, bankBalance: -lossBank } }),
          User.updateOne({ jid: senderJid }, { $inc: { zenCoins: robado }, $set: { lastRob: now } })
        ])

        let msg = `*╔═══⌦ ✦ 🔫 ROUBO BEM-SUCEDIDO ✦ ⌫═══╗*\n\n`
                + `> 👤 *Vítima:* @${extraerNum(targetJid)}\n`
                + `> 💰 *Valor roubado:* ${robado} ${config.CURRENCY_NAME}\n`
        if (!bancoProtegido && lossBank > 0) {
            msg += `\n> 🔓 *Observação:* O banco sem proteção também foi saqueado.`
        }
        msg += `\n*╚══⌦ ${config.footer} ⌫══╝*`
        m.reply(msg, { mentions: [targetJid] })

    } else {
        const multa = 500
        const loss = Math.min(userDb.zenCoins, multa)
        userDb.zenCoins -= loss
        await User.updateOne({ jid: senderJid }, { $inc: { zenCoins: -loss }, $set: { lastRob: now } })
        m.reply(
          `*⌬┤ 👮 ├⌬ A POLÍCIA TE PEGOU!*\n\n> Você foi pego tentando roubar @${extraerNum(targetJid)}.\n> 💸 *Multa paga:* ${loss} ${config.CURRENCY_NAME}`,
          { mentions: [targetJid] }
        )
    }
}

handler.help = ['roubar @usuario']
handler.tags = ['eco']
handler.command = ['rob', 'robar', 'roubar']
handler.groupOnly = true
handler.register = true
export default handler
