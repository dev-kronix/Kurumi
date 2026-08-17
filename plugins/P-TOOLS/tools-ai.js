import fetch from 'node-fetch'
import axios from 'axios'
import FormData from 'form-data'
import gtts from 'node-gtts'
import fs from 'fs'
import { promisify } from 'util'
import { exec } from 'child_process'
import { join } from 'path'
import config from '../../config.js'

const readFile = promisify(fs.readFile)
const unlink = promisify(fs.unlink)
const execPromise = promisify(exec)

const SPENZY = 'https://spenzy-api.vercel.app/api/ai'
const GEMINI_KEY = process.env.GEMINI_API_KEY || ''
const REMOVEBG_KEY = process.env.REMOVEBG_API_KEY || ''
const NOVA_KEY = process.env.NOVA_API_KEY || ''

const IDENTITY = `Você é ${config.botName || 'Kurumi'}, uma assistente feminina de WhatsApp. Fale sempre em português do Brasil e se refira a si mesma no feminino. Sua personalidade é elegante, confiante, misteriosa, espirituosa e direta, com um toque de humor seco, sem exagerar nem ser grosseira. Seja útil, natural e objetiva. Nunca se apresente como ZenBot. Este fork é mantido e personalizado por DevKronix e é baseado no projeto ZenBot original de AxelDev09. Se perguntarem sobre sua origem, autoria ou manutenção, explique isso de forma curta e transparente.`

const promptComIdentidade = (query = '') => `${IDENTITY}\n\nMensagem do usuário: ${query}`

async function reagir(conn, m, emoji) {
  return conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }).catch(() => {})
}

async function removerFundo(m, conn, q, mime, command, usedPrefix, userDb) {
  if (!/image/.test(mime)) {
    return m.reply(`*⌬┤ 🖼️ ├⌬ USO.*\n> Responda a uma imagem com *${usedPrefix}${command}* para remover o fundo.\n> Custa *1 ✦*.`)
  }
  if (userDb.kogen < 1) return m.reply('*⌬┤ 💎 ├⌬ SEM KŌGEN.*\n> Você não tem Kōgen suficiente para usar este comando.')
  if (!REMOVEBG_KEY) return m.reply('*⌬┤ ⚙️ ├⌬ CONFIGURAÇÃO PENDENTE.*\n> A chave *REMOVEBG_API_KEY* não foi configurada.')

  await m.reply('*⌬┤ ⏳ ├⌬ Processando imagem...*')
  await reagir(conn, m, '⏳')

  try {
    const buffer = await q.download()
    const formData = new FormData()
    formData.append('image_file', buffer, 'image.png')
    formData.append('size', 'auto')

    const res = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
      headers: { 'X-Api-Key': REMOVEBG_KEY, ...formData.getHeaders() },
      responseType: 'arraybuffer'
    })

    await conn.sendMessage(m.chat, {
      image: Buffer.from(res.data),
      caption: '*⌬┤ ✂️ · FUNDO REMOVIDO ├⌬*'
    }, { quoted: m })

    userDb.kogen -= 1
    await m.reply('✦ Você usou *1 Kōgen*')
    await reagir(conn, m, '✅')
  } catch {
    await reagir(conn, m, '❌')
    return m.reply('*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível remover o fundo. Nenhum Kōgen foi cobrado.')
  }
}

async function gerarImagem(m, conn, command, query, userDb) {
  if (userDb.kogen < 1) return m.reply('*⌬┤ 💎 ├⌬ SEM KŌGEN.*\n> Você não tem Kōgen suficiente para usar este comando.')

  await m.reply('*⌬┤ ⏳ ├⌬ Gerando imagem...*')
  await reagir(conn, m, '⏳')

  try {
    let imageUrl = null
    let caption = `*⌬┤ 🖼️ ├⌬ IMAGEM GERADA*\n\n> 🎨 Prompt: _${query}_`

    if (command === 'flux') {
      const initRes = await axios.get(`https://omegatech-api.dixonomega.tech/api/ai/flux-pro2?prompt=${encodeURIComponent(query)}`)
      if (!initRes.data.success) throw new Error('Falha ao iniciar geração')

      const taskId = initRes.data.task_id
      for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 4000))
        const check = await axios.get(`https://omegatech-api.dixonomega.tech/api/ai/nano-banana2-result?task_id=${taskId}`)
        if (check.data.status === 'completed' && check.data.image_url) {
          imageUrl = check.data.image_url
          break
        }
      }
      if (!imageUrl) throw new Error('Timeout')
      caption += '\n> ⚙️ Motor: Flux.1 Pro'
    } else if (command === 'aimg') {
      const form = new FormData()
      form.append('prompt', query)
      form.append('token', 'cat_bot_token_decoded_here')
      const res = await axios.post('https://text2video.aritek.app/text2img', form, { headers: form.getHeaders() })
      imageUrl = res.data?.url
      caption += '\n> ⚙️ Motor: Aritek AI'
    } else {
      const res = await axios.get(`https://zellapi.autos/ai/text2image5?prompt=${encodeURIComponent(query)}`, { timeout: 30000 })
      imageUrl = res.data?.result || res.data?.url
    }

    if (!imageUrl) throw new Error('URL de imagem ausente')

    await conn.sendMessage(m.chat, { image: { url: imageUrl.trim() }, caption }, { quoted: m })
    userDb.kogen -= 1
    await m.reply('✦ Você usou *1 Kōgen*')
    await reagir(conn, m, '✅')
  } catch (e) {
    console.error('[IA IMAGEM]', e?.message || e)
    await reagir(conn, m, '❌')
    return m.reply('*⌬┤ ❌ ├⌬ ERRO.*\n> O serviço de imagens está indisponível ou sobrecarregado. Tente novamente mais tarde. Nenhum Kōgen foi cobrado.')
  }
}

async function gerarVoz(m, conn, query) {
  const id = Math.floor(Math.random() * 10000)
  const input = join('./tmp', `input_${id}.mp3`)
  const output = join('./tmp', `output_${id}.opus`)

  await reagir(conn, m, '🗣️')

  try {
    const speech = gtts('pt-br')
    await new Promise((resolve, reject) => {
      speech.save(input, query, err => err ? reject(err) : resolve())
    })
    await execPromise(`ffmpeg -i ${input} -c:a libopus -b:a 32k -vbr on -compression_level 10 ${output}`)
    const buffer = await readFile(output)
    await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: m })
    await reagir(conn, m, '✅')
  } catch {
    await reagir(conn, m, '❌')
    return m.reply('*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível gerar o áudio. Verifique se o FFmpeg está instalado.')
  } finally {
    if (fs.existsSync(input)) await unlink(input).catch(() => {})
    if (fs.existsSync(output)) await unlink(output).catch(() => {})
  }
}

const handler = async (m, { conn, command, text, usedPrefix, userDb }) => {
  const query = text?.trim()
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || q.mediaType || ''

  const removerFundoCmds = ['delfon', 'removebg', 'removerfundo']
  const imagemCmds = ['generarimg', 'gerarimg', 'crearimg', 'criarimg', 'aiimg', 'flux', 'aimg']

  if (removerFundoCmds.includes(command)) return removerFundo(m, conn, q, mime, command, usedPrefix, userDb)

  if (imagemCmds.includes(command)) {
    if (!query) return m.reply(`*⌬┤ ✙ ├⌬ USO.*\n> *${usedPrefix}${command} <descrição>*\n> Custa *1 ✦* por geração.`)
    return gerarImagem(m, conn, command, query, userDb)
  }

  if (['voz', 'decir', 'falar'].includes(command)) {
    if (!query) return m.reply(`*⌬┤ ✙ ├⌬ USO.*\n> *${usedPrefix}${command} <texto>*`)
    return gerarVoz(m, conn, query)
  }

  if (!query && !/image/.test(mime)) return m.reply(`*⌬┤ ✙ ├⌬ USO.*\n> *${usedPrefix}${command} <sua pergunta>*`)
  await reagir(conn, m, '⏳')

  try {
    if (['gemini', 'ia', 'askai', 'perguntar'].includes(command)) {
      if (!GEMINI_KEY) return m.reply('*⌬┤ ⚙️ ├⌬ CONFIGURAÇÃO PENDENTE.*\n> A chave *GEMINI_API_KEY* não foi configurada.')

      const currentParts = [{ text: promptComIdentidade(query || 'Descreva esta imagem.') }]
      if (/image/.test(mime)) {
        const media = await q.download()
        currentParts.push({ inline_data: { mime_type: mime, data: media.toString('base64') } })
      }

      const payload = { contents: [{ role: 'user', parts: currentParts }] }
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        payload,
        { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
      )

      const answer = res.data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!answer) throw new Error('Resposta vazia')
      await reagir(conn, m, '✅')
      return conn.sendMessage(m.chat, { text: `*⌬┤ 🔷 ├⌬ GEMINI*\n\n${answer.replace(/\*\*/g, '*')}` }, { quoted: m })
    }

    if (['nova', 'catia'].includes(command)) {
      if (!NOVA_KEY) return m.reply('*⌬┤ ⚙️ ├⌬ CONFIGURAÇÃO PENDENTE.*\n> A chave *NOVA_API_KEY* não foi configurada.')

      const payload = {
        model: 'nova-2-lite-v1',
        messages: [
          { role: 'system', content: IDENTITY },
          { role: 'user', content: query }
        ]
      }
      const { data } = await axios.post('https://api.nova.amazon.com/v1/chat/completions', payload, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${NOVA_KEY}` }
      })
      let response = data.choices[0].message.content
      response = response.replace(/###\s+/g, '■ ').replace(/##\s+/g, '▼ ').replace(/#\s+/g, '► ').replace(/\*\*/g, '*')
      await reagir(conn, m, '✅')
      return m.reply(`*⌬┤ 🌌 ├⌬ NOVA AI*\n\n${response.trim()}`)
    }

    if (['chatgpt', 'gpt'].includes(command)) {
      const encoded = encodeURIComponent(promptComIdentidade(query))
      const res = await fetch(`${SPENZY}/chatgpt?text=${encoded}`)
      const data = await res.json()
      if (!data?.status || !data?.result?.message) throw new Error('Resposta vazia')
      await reagir(conn, m, '✅')
      return conn.sendMessage(m.chat, { text: `*⌬┤ 🧠 ├⌬ CHATGPT*\n\n${data.result.message}` }, { quoted: m })
    }

    if (['copilot', 'ms', 'nagi'].includes(command)) {
      const encoded = encodeURIComponent(promptComIdentidade(query))
      const res = await axios.get(`https://api.yupra.my.id/api/ai/gpt5?text=${encoded}`, { timeout: 20000 })
      const answer = res.data?.result || res.data?.response
      if (!answer) throw new Error('Resposta vazia')
      await reagir(conn, m, '✅')
      const title = command === 'nagi' ? '✨ NAGI' : '🪟 COPILOT'
      return conn.sendMessage(m.chat, { text: `*⌬┤ ${title.split(' ')[0]} ├⌬ ${title.split(' ')[1]}*\n\n${answer}` }, { quoted: m })
    }
  } catch (e) {
    console.error('[IA]', e?.message || e)
    await reagir(conn, m, '❌')
    return m.reply('*⌬┤ ❌ ├⌬ ERRO.*\n> Não foi possível obter uma resposta da IA. Tente novamente.')
  }
}

handler.command = [
  'chatgpt', 'gpt', 'nagi', 'gemini', 'ia', 'askai', 'perguntar', 'copilot', 'ms', 'nova', 'catia',
  'generarimg', 'gerarimg', 'crearimg', 'criarimg', 'aiimg', 'flux', 'aimg',
  'delfon', 'removebg', 'removerfundo', 'voz', 'decir', 'falar'
]
handler.tags = ['tools']
handler.help = ['chatgpt <msg>', 'ia <msg/foto>', 'flux <descrição> ✦', 'removerfundo <foto> ✦', 'falar <texto>']

export default handler
