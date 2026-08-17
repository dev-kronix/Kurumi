import fetch from 'node-fetch'
import config from '../../config.js'

const MAX_REPO = 100
const GIT_REGEX = /github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?/i

const handler = async (m, { conn, text, usedPrefix, command, userDb }) => {
  let url = text ? text.trim() : ''
  if (!url && m.quoted) {
    const quotedText = m.quoted.body || m.quoted.text || ''
    const match = quotedText.match(/https?:\/\/[^\s]+/i)
    if (match) url = match[0]
  }

  if (!url) return m.reply(`*⌬┤ ❗ ├⌬ LINK OBRIGATÓRIO.*\n> Envie ou responda a uma mensagem com um link válido do GitHub.`)
  if (!GIT_REGEX.test(url)) return m.reply(`*⌬┤ ❗ ├⌬ LINK INVÁLIDO.*\n> Verifique se é um link válido do GitHub.`)
  if (userDb.kogen < 1) return m.reply(`*⌬┤ 💎 ├⌬ SEM ${config.PREMIUM_NAME.toUpperCase()}.*\n> Você não possui ${config.PREMIUM_NAME} suficiente para usar este comando.`)

  const chatId = m.chat
  let [, ghUser, repo] = url.match(GIT_REGEX)
  repo = repo.replace(/\.git$/i, '')
  await m.reply(`*⌬┤ ⏳ ├⌬ Baixando repositório...*\n> 📌 Limite: ${MAX_REPO} MB`)

  try {
    const apiRes = await fetch(`https://api.github.com/repos/${ghUser}/${repo}`, {
      headers: { 'User-Agent': 'KURUMI-BOT', 'Accept': 'application/vnd.github+json' },
      timeout: 15_000
    })

    if (!apiRes.ok) return m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> O repositório não existe, é privado ou o GitHub não respondeu.`)

    const info = await apiRes.json()
    const branch = info.default_branch || 'main'
    const sizeKB = info.size || 0

    if (sizeKB / 1024 > MAX_REPO) {
      return m.reply(`*⌬┤ ❌ ├⌬ REPOSITÓRIO MUITO GRANDE.*\n> O repositório possui aproximadamente ${Math.round(sizeKB / 1024)} MB e ultrapassa o limite de ${MAX_REPO} MB.`)
    }

    const zipUrl = `https://github.com/${ghUser}/${repo}/archive/refs/heads/${branch}.zip`
    const res = await fetch(zipUrl, { timeout: 60_000 })

    if (!res.ok) return m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível baixar o arquivo ZIP do repositório.`)

    const buffer = Buffer.from(await res.arrayBuffer())

    if (buffer.length / (1024 * 1024) > MAX_REPO) {
      return m.reply(`*⌬┤ ❌ ├⌬ REPOSITÓRIO MUITO GRANDE.*\n> O arquivo ultrapassa o limite de ${MAX_REPO} MB.`)
    }

    const stars = info.stargazers_count?.toLocaleString('pt-BR') || '0'
    const forks = info.forks_count?.toLocaleString('pt-BR') || '0'
    const lang  = info.language || 'N/A'
    const desc  = info.description ? `\n> 📝 ${info.description}` : ''

    await conn.sendMessage(chatId, {
      document: buffer,
      mimetype: 'application/zip',
      fileName: `${repo}-${branch}.zip`,
      caption: `*⌬┤ 🐙 ├⌬ GITHUB*${desc}\n> 🌿 *Branch:* ${branch}\n> ⭐ *Estrelas:* ${stars}\n> 🍴 *Forks:* ${forks}\n> 💻 *Linguagem:* ${lang}`
    }, { quoted: m })

    userDb.kogen -= 1
    await conn.sendMessage(chatId, { text: `${config.PREMIUM_SYMBOL} Você usou *1 ${config.PREMIUM_NAME}*` }, { quoted: m })

  } catch (e) {
    console.error('[GIT]', e.message)
    return m.reply(`*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível concluir o download. Tente novamente.`)
  }
}

handler.help = [`gitclone <link> ${config.PREMIUM_SYMBOL}`]
handler.command = ['gitclone', 'git', 'repositorio', 'repo', 'gitc']
handler.tags = ['descargas']

export default handler