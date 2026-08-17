import fs from 'fs'
import path from 'path'
import { plugins } from '../../handler.js'

const PLUGINS = path.resolve('./plugins')

const handler = async (m, { text, usedPrefix, command }) => {
  let relPath = (text || '').trim().replace(/^plugins[\\/]/, '').replace(/\.\./g, '')
  if (!relPath) return m.reply(`*⌬┤ ✙ ├⌬ USO:* ${usedPrefix}${command} <pasta/arquivo.js>`)
  if (!relPath.endsWith('.js')) relPath += '.js'

  const fullPath = path.join(PLUGINS, relPath)
  if (!fullPath.startsWith(PLUGINS)) return m.reply(`*⌬┤ ❌ ├⌬ CAMINHO INVÁLIDO.*`)
  if (!fs.existsSync(fullPath)) return m.reply(`*⌬┤ ❌ ├⌬ PLUGIN NÃO ENCONTRADO.*\n> Arquivo: *${relPath}*`)

  try {
    fs.unlinkSync(fullPath)
    delete plugins[relPath]
    m.reply(`*⌬┤ ✅ ├⌬ PLUGIN REMOVIDO.*\n> 📄 *${relPath}*`)
  } catch (e) {
    m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> ${e.message}`)
  }
}

handler.help = ['removerplugin <arquivo>']
handler.command = ['borrarplugin', 'delplugin', 'removerplugin', 'deleteplugin']
handler.tags = ['owner']
handler.ownerOnly = true
handler.noRegister = true

export default handler