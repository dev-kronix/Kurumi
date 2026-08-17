const DEFAULT_PALABRAS = ["puta","mierda","cabrón","idiota","pendejo","imbécil","estúpido","tarado","gilipollas","pelotudo","forro","boludo","culiao","hdp","hijo de puta","concha","pija","verga","choto","maricón","puto","zorra","perra","cagón","cagon","sorete","inutil","baboso","patán","payaso","ridículo","tonto","bobo","menso","weon","huevon","cp","pendeja","cabrona","mierdoso","asqueroso","malparido","coño","carajo","chingada","chingado","chingar","culero","culera","maldito","maldita","malnacido","malnacida","estupida","idiotas","idiot","estupidos","imbeciles","estúpidos","estúpidas","tarados","pelotudos","forros","boludos","culiaos","maricas","maricones","putas","putos","zorras","perras","cagones","soretes","babosos","patanes","payasos","ridículos","bobos","mensos","pene","nepe","gore","mierdosos","asquerosos","malparidos","culeros","culeras","malditos","malditas","malnacidos","malnacidas","pajero","pajeros","pajera","cállate","cornudo","cornuda","cornudos","cornudas","chupapija","chupapijas","chupaverga","chupaculo","chupaculos","chupapollas","chupapolla","chupapollos","cojudo","cojuda","cojudos","cojudas","imbecil","mrd","imbeciles","imbecilidades","estupidez","estupideces","idiotez","idioteces","taradez","taradeces","gil","giles","gilazo","gilazos","ano","anal","mongólico","mongólica","mongólicos","mongólicas","mongolo","mongola","mongolos","mongolas","animal","animales","basura","basurita","burro","burros","burra","burras","feo","matate","putita","putito","cerdo","cerdos","cerda","cerdas","chancho","chanchos","chancha","chanchas","perro","perros","rata","ratas","ratón","ratones","ratona","ratonas","hdpt","suicídate","estorbo","salame","bitch","víbora","víboras","gay","lesbiana","porra","caralho","merda","filho da puta","fdp","vai se foder","vsf","arrombado","arrombada","desgraçado","desgraçada"]
const MAX_WARNS_TOX = 5

function esToxic(texto) {
  if (!texto) return false
  const t_ = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return DEFAULT_PALABRAS.some(p => {
    const pn = p.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return new RegExp(`\\b${pn}\\b`).test(t_)
  })
}

const handler = async (m, { args, groupDb, usedPrefix, command }) => {
  const modo = args[0]?.toLowerCase()
  if (!['on', '1', 'true', 'activar', 'ativar', 'off', '0', 'false', 'desactivar', 'desativar'].includes(modo)) {
    return m.reply(`*⌬┤ ✙ ├⌬ MODO INVÁLIDO.*\n> Use: *${usedPrefix}${command} on | off*`)
  }

  const activar = ['on', '1', 'true', 'activar', 'ativar'].includes(modo)
  groupDb.antitoxic = activar
  await groupDb.save()
  
  return m.reply(`*⌬┤ 🚫 ├⌬ ANTI TÓXICO ${activar ? 'ATIVADO' : 'DESATIVADO'}.*`)
}

handler.before = async (m, { conn, isAdmin, isOwner, groupDb, userDb }) => {
  if (!m.isGroup || m.fromMe || isAdmin || isOwner || !groupDb?.antitoxic) return false
  if (!m.text || !esToxic(m.text)) return false

  const sender = m.sender
  const nombre = sender.split('@')[0]

  try { await conn.sendMessage(m.chat, { delete: m.key }) } catch {}
  
  if (userDb) {
    userDb.warnTox = (userDb.warnTox || 0) + 1
    
    if (userDb.warnTox >= MAX_WARNS_TOX) {
      userDb.warnTox = 0
      await userDb.save()
      try { await conn.groupParticipantsUpdate(m.chat, [sender], 'remove') } catch {}
      await conn.sendMessage(m.chat, { text: `*⌬┤ 🚫 ├⌬ EXPULSO.*\n> @${nombre} foi expulso por acumular *${MAX_WARNS_TOX} advertências* por linguagem tóxica.`, mentions: [sender] })
    } else {
      await userDb.save()
      await conn.sendMessage(m.chat, { text: `*⌬┤ ⚠️ ├⌬ LINGUAGEM INADEQUADA.*\n> @${nombre}, removi sua mensagem.\n> Advertência *${userDb.warnTox}/${MAX_WARNS_TOX}*. Ao chegar a *${MAX_WARNS_TOX}*, você será expulso.`, mentions: [sender] })
    }
  }
  return true
}

handler.help = ['antitoxico <on/off>']
handler.tags = ['group']
handler.command = ['antitoxic', 'antitoxico']
handler.groupOnly = true
handler.adminOnly = true
handler.alwaysBefore = true
handler.noRegister = true

export default handler