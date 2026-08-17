import config from '../../config.js'

const handler = async (m, { text, command }) => {
  const target = m.mentionedJid?.[0] || m.quoted?.sender || null
  let num = target ? target.split('@')[0].split(':')[0].replace(/\D/g, '') : (text || '').replace(/\D/g, '')

  if (!num) return m.reply(`*⌬┤ ✙ ├⌬ NÚMERO OBRIGATÓRIO.*\n> Mencione, responda ou informe o número com DDI.`)

  const owners = Array.isArray(config.ownerNumber) ? config.ownerNumber : [config.ownerNumber]
  const exists = owners.some(o => String(o).replace(/\D/g, '') === num)

  if (['addowner', 'adicionardono'].includes(command)) {
    if (exists) return m.reply(`*⌬┤ ⚠️ ├⌬ JÁ É DONO.*\n> +${num} já possui privilégios de dono.`)
    config.ownerNumber.push(num)
    return m.reply(`*⌬┤ ✅ ├⌬ DONO ADICIONADO.*\n> +${num} agora possui privilégios de dono.\n> ⚠️ Esta alteração é válida apenas até a bot reiniciar; atualize *config.js* para torná-la permanente.`)
  }

  if (['delowner', 'removeowner', 'removerdono'].includes(command)) {
    if (!exists) return m.reply(`*⌬┤ ⚠️ ├⌬ NÃO É DONO.*`)
    if (owners.length <= 1) return m.reply(`*⌬┤ ❌ ├⌬ OPERAÇÃO BLOQUEADA.*\n> Não é possível remover o último dono da bot.`)
    config.ownerNumber = owners.filter(o => String(o).replace(/\D/g, '') !== num)
    return m.reply(`*⌬┤ ✅ ├⌬ DONO REMOVIDO.*\n> +${num} perdeu os privilégios de dono.\n> ⚠️ Esta alteração é válida apenas até a bot reiniciar; atualize *config.js* para torná-la permanente.`)
  }
}

handler.help = ['addowner <numero>', 'removerdono <numero>']
handler.command = ['addowner', 'adicionardono', 'delowner', 'removeowner', 'removerdono']
handler.tags = ['owner']
handler.ownerOnly = true
handler.noRegister = true

export default handler