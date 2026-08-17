import fs from 'fs'
import path from 'path'

const PLUGINS = path.resolve('./plugins')

const handler = async (m, { text, usedPrefix, command }) => {
  let relPath = (text || '').trim().replace(/^plugins[\\/]/, '').replace(/\.\./g, '')
  if (!relPath) return m.reply(`*⌬┤ ✙ ├⌬ USO:* ${usedPrefix}${command} <pasta/arquivo.js>`)
  if (!relPath.endsWith('.js')) relPath += '.js'

  const fullPath = path.join(PLUGINS, relPath)
  if (!fullPath.startsWith(PLUGINS)) return m.reply(`*⌬┤ ❌ ├⌬ CAMINHO INVÁLIDO.*`)
  if (!fs.existsSync(fullPath)) return m.reply(`*⌬┤ ❌ ├⌬ PLUGIN NÃO ENCONTRADO.*\n> Arquivo: *${relPath}*`)

  const code = fs.readFileSync(fullPath, 'utf8')
  const caption = `*⌬┤ 🧩 ├⌬ PLUGIN*\n> 📄 *${relPath}*\n> 📦 ${Buffer.byteLength(code, 'utf8').toLocaleString('pt-BR')} bytes`

  if (code.length <= 3500) {
    return m.reply(`${caption}\n\n\`\`\`js\n${code}\n\`\`\``)
  }

  await m.reply(caption)
  await m.reply(code.slice(0, 3500) + '\n\n... *(conteúdo truncado)*')
}

handler.help = ['verplugin <arquivo>']
handler.command = ['verplugin', 'viewplugin', 'showplugin']
handler.tags = ['owner']
handler.ownerOnly = true
handler.noRegister = true

export default handler