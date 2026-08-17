import { plugins } from '../../handler.js'

const handler = async (m) => {
  const entries = Object.entries(plugins).sort(([a], [b]) => a.localeCompare(b))
  if (!entries.length) return m.reply(`*⌬┤ ℹ️ ├⌬ NENHUM PLUGIN CARREGADO.*`)

  const grupos = {}
  for (const [file, plugin] of entries) {
    const pasta = file.includes('/') ? file.split('/')[0] : 'RAIZ'
    if (!grupos[pasta]) grupos[pasta] = []
    const cmds = Array.isArray(plugin.command) ? plugin.command.join(', ') : plugin.command instanceof RegExp ? plugin.command.toString() : String(plugin.command || 'sem comando')
    grupos[pasta].push(`> 📄 *${file}*\n>    ⌨️ ${cmds}`)
  }

  let txt = `*╔═══⌦ ✦ 🧩 PLUGINS CARREGADOS ✦ ⌫═══╗*\n\n`
  for (const [pasta, itens] of Object.entries(grupos)) {
    txt += `*⌬┤ 📁 ${pasta} ├⌬*\n${itens.join('\n')}\n\n`
  }
  txt += `> 📊 *Total:* ${entries.length} plugins\n*╚══════════════════════════╝*`

  m.reply(txt)
}

handler.help = ['listplugins']
handler.command = ['listplugins', 'plugins', 'listarplugins']
handler.tags = ['owner']
handler.ownerOnly = true
handler.noRegister = true

export default handler