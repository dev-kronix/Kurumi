import fs from 'fs'
import path from 'path'
import { loadPlugin } from '../../handler.js'

const handler = async (m, { text, usedPrefix, command }) => {
  const target = (text || '').trim().replace(/^plugins[\\/]/, '')
  if (!target) return m.reply(`*⌬┤ ✙ ├⌬ USO:* ${usedPrefix}${command} <pasta/arquivo.js | all>`)

  if (['all', 'todos', 'tudo'].includes(target.toLowerCase())) {
    const base = path.resolve('./plugins')
    const getFiles = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => {
      const full = path.join(dir, item.name)
      return item.isDirectory() ? getFiles(full) : (item.isFile() && item.name.endsWith('.js') ? [full] : [])
    })
    const files = getFiles(base)
    let ok = 0
    for (const full of files) {
      const rel = path.relative(base, full).replace(/\\/g, '/')
      try { await loadPlugin(rel, true); ok++ } catch {}
    }
    return m.reply(`*⌬┤ ✅ ├⌬ RECARGA CONCLUÍDA.*\n> ${ok}/${files.length} plugins processados.`)
  }

  const rel = target.endsWith('.js') ? target : `${target}.js`
  const full = path.resolve('./plugins', rel)
  if (!full.startsWith(path.resolve('./plugins'))) return m.reply(`*⌬┤ ❌ ├⌬ CAMINHO INVÁLIDO.*`)
  if (!fs.existsSync(full)) return m.reply(`*⌬┤ ❌ ├⌬ PLUGIN NÃO ENCONTRADO.*\n> *${rel}*`)

  try {
    await loadPlugin(rel, true)
    m.reply(`*⌬┤ ✅ ├⌬ PLUGIN RECARREGADO.*\n> 📄 *${rel}*`)
  } catch (e) {
    m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> ${e.message}`)
  }
}

handler.help = ['reload <plugin|all>']
handler.command = ['reload', 'reloadplugin', 'recarregar', 'recarregarplugin']
handler.tags = ['owner']
handler.ownerOnly = true
handler.noRegister = true

export default handler