<div align="center">

<img src="banner.svg" alt="Kurumi" width="800"/>

# Kurumi

**Bot de WhatsApp multifuncional em português do Brasil.**  
Fork mantido por **DevKronix**, baseado no projeto original **ZenBot**, de **AxelDev09**.

[![Version](https://img.shields.io/badge/versão-8.1.0-e11d48?style=for-the-badge&logo=whatsapp&logoColor=white)](.)
[![Node](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](.)
[![ESM](https://img.shields.io/badge/módulos-ESM-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](.)
[![MongoDB](https://img.shields.io/badge/banco-MongoDB%20%7C%20JSON-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](.)
[![License](https://img.shields.io/badge/licença-GPL--3.0-22c55e?style=for-the-badge)](LICENSE)

</div>

---

## O que é a Kurumi?

A **Kurumi** é uma bot de WhatsApp baseada em Baileys, organizada em plugins e preparada para grupos, sub-bots, economia, RPG, downloads, ferramentas, IA e outros recursos.

Esta versão foi localizada para **PT-BR** e recebeu uma nova identidade. A Kurumi se apresenta no feminino e os recursos de IA usam uma personalidade própria: elegante, confiante, misteriosa, espirituosa e direta.

> A identidade visual e os textos desta versão são da Kurumi. Alguns nomes internos antigos, como campos de banco de dados, foram preservados para não quebrar dados e instalações existentes. Porque migração destrutiva só para deixar nome bonito seria uma decisão muito criativa, no pior sentido possível.

---

## Requisitos

- **Node.js 18+** (recomendado: 20 ou superior)
- **FFmpeg** instalado
- Uma conta do WhatsApp
- **MongoDB** é opcional. Sem MongoDB, a Kurumi usa armazenamento JSON local automaticamente.

---

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/dev-kronix/Kurumi.git
cd Kurumi
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

Copie `.env-example` para `.env` e preencha somente o que for usar:

```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/kurumi
NODE_ENV=production

GEMINI_API_KEY=
REMOVEBG_API_KEY=
NOVA_API_KEY=
```

`MONGODB_URI` é opcional. Sem ela, o banco JSON local é ativado.

### 4. Configure a Kurumi

Edite `config.js`:

```js
botName: 'Kurumi',
ownerName: 'DevKronix',
ownerNumber: ['55XXXXXXXXXXX'],
MODE: 'public',
```

Use seu número com DDI e sem o sinal `+`.

### 5. Inicie

```bash
npm start
```

Na primeira execução, digite o número solicitado no terminal e use o código em:

**WhatsApp → Dispositivos conectados → Conectar com número de telefone**.

---

## Instalação no Termux

```bash
pkg update && pkg upgrade -y
pkg install git nodejs ffmpeg -y
termux-setup-storage
git clone https://github.com/dev-kronix/Kurumi.git /sdcard/Kurumi
cd /sdcard/Kurumi
npm install
npm start
```

---

## Estrutura principal

```text
Kurumi/
├── kurumi.js          # entrypoint principal
├── zen.js             # compatibilidade com instalações antigas
├── config.js          # nome, dono, prefixos e preferências
├── handler.js         # roteamento e validação dos comandos
├── plugins/           # comandos e recursos
├── lib/               # banco, serialização, RPG e utilitários
├── .env-example       # exemplo das variáveis de ambiente
└── package.json
```

---

## Sistema de plugins

Os plugins são carregados automaticamente da pasta `plugins/`. Em desenvolvimento, eles podem ser recarregados ao salvar.

Exemplo:

```js
const handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.reply('Olá! Eu sou a Kurumi.')
}

handler.help = ['exemplo <texto>']
handler.tags = ['tools']
handler.command = ['exemplo']
handler.groupOnly = false
handler.adminOnly = false
handler.botAdminOnly = false
handler.ownerOnly = false
handler.noRegister = true

export default handler
```

### Hooks disponíveis

| Hook | Quando roda |
|---|---|
| `handler` | Quando o comando corresponde ao plugin |
| `handler.before` | Antes da execução do comando |
| `handler.all` | Em todas as mensagens recebidas |
| `handler.after` | Depois da execução do comando |

---

## Configuração

### Prefixos padrão

```text
. # / !
```

### Modos

| Modo | Comportamento |
|---|---|
| `public` | Qualquer usuário pode usar os comandos permitidos |
| `private` | Somente o dono pode usar a bot |

### Anti-spam

```js
antiSpam: {
  enabled: true,
  maxCmds: 5,
  ventanaMs: 8000,
  muteMs: 15000,
}
```

Os nomes internos `ventanaMs` e alguns outros identificadores herdados foram mantidos por compatibilidade. Isso não muda o idioma das mensagens exibidas ao usuário.

---

## IA e personalidade

Os comandos de IA usam a identidade da **Kurumi** e instruem os modelos a:

- responder em português do Brasil;
- se identificar no feminino;
- usar o nome Kurumi;
- manter um estilo elegante, confiante, misterioso e espirituoso;
- não se apresentar como ZenBot;
- informar corretamente que esta versão é mantida por DevKronix e deriva do projeto ZenBot original.

Alguns provedores exigem chaves no `.env`. Chaves privadas não devem ser colocadas diretamente no código ou enviadas para o GitHub.

---

## Banco de dados

A Kurumi tenta usar MongoDB quando `MONGODB_URI` estiver definida.

Se a variável não existir ou a conexão falhar, ela usa automaticamente arquivos JSON em:

```text
lib/database/data/
```

Campos internos herdados, como `zenCoins`, continuam existindo para manter compatibilidade com bancos antigos. Para o usuário, a moeda é exibida como **KurumiCoins**.

---

## Sub-bots

O sistema Jadibot/sub-bot continua disponível. O limite pode ser configurado em `config.js`:

```js
limiteSubbots: 30
```

Cada sub-bot pode manter nome e imagem próprios.

---

## Créditos e licença

Este repositório é um **fork/modificação** do ZenBot. O projeto original e o trabalho de **AxelDev09** continuam creditados conforme a licença e o histórico do repositório.

A versão Kurumi é mantida e personalizada por **DevKronix**.

Licença: **GPL-3.0**. Consulte [LICENSE](LICENSE).

---

<div align="center">

**Kurumi · PT-BR · DevKronix**

</div>
