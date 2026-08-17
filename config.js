const config = {
  botName: 'Kurumi',
  ownerName: 'DevKronix',
  version: '8.1.0',
  locale: 'pt-BR',
  gender: 'feminino',
  prefix: /^[.#/!]/,
  ownerNumber: ['55XXXXXXXXXXX'], // Troque pelo seu número com DDI, sem o +
  phoneNumber: '', // Em ambiente web, defina aqui o número que será usado pelo bot
  MODE: 'public',
  usePairingCode: true,
  antiSpam: {
    enabled: true,
    maxCmds: 5,
    ventanaMs: 8000,
    muteMs: 15000,
  },
  antiSpamSubBot: {
    enabled: true,
    maxCmds: 5,
    ventanaMs: 10000,
    muteMs: 20000,
  },
  newsletterJid: '120363403631501323@newsletter',
  groupLink: 'https://whatsapp.com/channel/0029Vb6OR9O2v1IvoXO5oT2c',
  CURRENCY_NAME: 'KurumiCoins',
  CURRENCY_SYMBOL: '⌬',
  PREMIUM_NAME: 'Kōgen',
  PREMIUM_SYMBOL: '✦',
  kogenPrice: 1000,
  packname: 'Kurumi',
  author: 'DevKronix',
  limiteSubbots: '', // Defina conforme a capacidade do seu servidor
  footer: 'ᴋᴜʀᴜᴍɪ · ᴅᴇᴠᴋʀᴏɴɪx',
  personality: {
    name: 'Kurumi',
    language: 'Português do Brasil',
    description: 'Assistente feminina, elegante, confiante, misteriosa, espirituosa e direta.'
  }
}

export default config
