import fs from 'fs'
import path from 'path'

const ERROR_FILE = path.resolve('./tmp/error_logs.json')

function loadErrors() {
  try {
    if (!fs.existsSync(ERROR_FILE)) return []
    return JSON.parse(fs.readFileSync(ERROR_FILE, 'utf8'))
  } catch { return [] }
}

function saveErrors(errors) {
  fs.mkdirSync(path.dirname(ERROR_FILE), { recursive: true })
  fs.writeFileSync(ERROR_FILE, JSON.stringify(errors, null, 2))
}

const handler = async (m, { command, text }) => {
  const errors = loadErrors()

  if (['erros', 'errors', 'errores'].includes(command)) {
    if (!errors.length) return m.reply(`*⌬┤ ✅ ├⌬ SEM ERROS REGISTRADOS.*`)
    const recent = errors.slice(-10).reverse()
    let txt = `*╔═══⌦ ✦ 🐞 ERROS RECENTES ✦ ⌫═══╗*\n\n`
    recent.forEach((e, i) => {
      txt += `*${i + 1}.* ${e.command || 'desconhecido'}\n`
      txt += `> 🕒 ${e.date || '---'}\n`
      txt += `> 💬 ${String(e.message || e.error || 'Erro sem mensagem').slice(0, 300)}\n\n`
    })
    txt += `> 📊 *Total armazenado:* ${errors.length}`
    return m.reply(txt)
  }

  if (['limparerros', 'clearerrors', 'clearerrores'].includes(command)) {
    saveErrors([])
    return m.reply(`*⌬┤ ✅ ├⌬ REGISTRO DE ERROS LIMPO.*`)
  }

  if (['adderror', 'adicionarerro'].includes(command)) {
    if (!text) return m.reply(`*⌬┤ ✙ ├⌬ TEXTO OBRIGATÓRIO.*`)
    errors.push({ command: 'manual', date: new Date().toLocaleString('pt-BR'), message: text })
    saveErrors(errors.slice(-100))
    return m.reply(`*⌬┤ ✅ ├⌬ ERRO MANUAL REGISTRADO.*`)
  }
}

handler.help = ['erros', 'limparerros']
handler.command = ['erros', 'errors', 'errores', 'limparerros', 'clearerrors', 'clearerrores', 'adderror', 'adicionarerro']
handler.tags = ['owner']
handler.ownerOnly = true
handler.noRegister = true

export default handler