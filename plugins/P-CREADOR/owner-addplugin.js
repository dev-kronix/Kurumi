import fs from 'fs'
import path from 'path'
import { loadPlugin } from '../../handler.js'

const PLUGINS = path.resolve('./plugins')

const handler = async (m, { text, usedPrefix, command }) => {
  if (!m.quoted?.text && !text) {
    return m.reply(`*⌬┤ ✙ ├⌬ USO.*\n> Responda a uma mensagem contendo o código do plugin ou envie:\n> *${usedPrefix}${command} pasta/arquivo.js* junto do código respondido.`)
  }

  const code = m.quoted?.text || m.quoted?.body || ''
  if (!code.includes('export default') && !code.includes('module.exports')) {
    return m.reply(`*⌬┤ ⚠️ ├⌬ CÓDIGO INVÁLIDO.*\n> A mensagem respondida não parece conter um plugin válido.`)
  }

  let relPath = (text || '').trim()
  if (!relPath) relPath = `P-TOOLS/plugin-${Date.now()}.js`
  if (!relPath.endsWith('.js')) relPath += '.js'
  relPath = relPath.replace(/^plugins[\\/]/, '').replace(/\.\./g, '')

  const fullPath = path.join(PLUGINS, relPath)
  if (!fullPath.startsWith(PLUGINS)) return m.reply(`*⌬┤ ❌ ├⌬ CAMINHO INVÁLIDO.*`)
  if (fs.existsSync(fullPath)) return m.reply(`*⌬┤ ⚠️ ├⌬ ARQUIVO JÁ EXISTE.*\n> Use outro nome ou remova o plugin antigo primeiro.`)

  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, code, 'utf8')
  await loadPlugin(relPath, true)

  m.reply(`*⌬┤ ✅ ├⌬ PLUGIN ADICIONADO.*\n> 📄 *${relPath}*\n> O plugin foi salvo e carregado.`)
}

handler.help = ['addplugin [pasta/arquivo.js]']
handler.command = ['addplugin', 'adicionarplugin']
handler.tags = ['owner']
handler.ownerOnly = true
handler.noRegister = true

export default handler