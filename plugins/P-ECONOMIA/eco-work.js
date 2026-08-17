import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const jobs = [
    { n: "🧹 Limpador da NASA", h: "Você limpou os vidros do telescópio James Webb e encontrou uma moeda grudada." },
    { n: "🎭 Dublê de ação", h: "Você pulou de um prédio de 20 andares. Sobreviveu, mas o orçamento só deu para pagar isso." },
    { n: "👴 Instrutor de avós", h: "Você explicou para 10 avós que Wi-Fi não é magia negra. Eles deram uma gorjeta." },
    { n: "🌵 Vendedor de areia", h: "Você conseguiu vender areia para um xeque árabe. Um gênio do marketing, aparentemente." },
    { n: "☣️ Moderador de grupos", h: "Você sobreviveu 10 minutos em um grupo de 'Debates Políticos'. Merece um aumento." },
    { n: "🇷🇺 Tradutor de hackers", h: "Você ajudou a decifrar uma mensagem que dizia 'Admin123'. Trabalho pesadíssimo." },
    { n: "🐕 Passeador de Pitbulls", h: "Os cachorros passearam com você, mas pelo menos pagaram o serviço." },
    { n: "🗿 Estátua viva", h: "Você ficou 8 horas sem se mexer. Uma criança te confundiu com um banheiro, mas o pagamento foi bom." },
    { n: "💌 Escritor de Tinder", h: "Você escreveu a bio de um feio e ele conseguiu 3 matches. Um verdadeiro herói." },
    { n: "💻 Guardião do Servidor", h: "Você impediu o servidor de explodir quando o dono tentou instalar um mod esquisito." },
    { n: "🎬 Figurante da Marvel", h: "Você interpretou um civil correndo. Seus 2 segundos de atuação foram épicos." },
    { n: "👣 Podólogo da Deep Web", h: "Melhor não perguntar que tipo de pés você viu. O pagamento é a única parte boa." },
    { n: "📱 Reparador de Nokia", h: "Você tentou consertar um Nokia 1100 e quebrou a mesa. O celular continua intacto." },
    { n: "🦄 Cavaleiro de Unicórnios", h: "Era um burro com um cone colado, mas as crianças não perceberam." },
    { n: "🎮 Streamer de Campo Minado", h: "Você teve 2 espectadores, mas um deles era um bot que doou isso." },
    { n: "🌬️ Engarrafador de ar", h: "Você vendeu 'Essência da Montanha'. Na verdade era ar do seu ventilador." },
    { n: "🧸 Babá de pelúcias", h: "Você cuidou da coleção de um colecionador excêntrico. Nenhum ursinho fugiu." },
    { n: "🤡 Palhaço gótico", h: "Você fez balões em forma de caixão numa festa de aniversário. Foi... diferente." },
    { n: "🧪 Cobaia", h: "Você testou um energético novo e agora consegue enxergar a cor da música." },
    { n: "🍕 Crítico de abacaxi", h: "Pagaram você para decidir se abacaxi combina com pizza. Você disse que sim e foi demitido." },
    { n: "🐜 Treinador de formigas", h: "Elas fizeram uma pirâmide humana. Foi o evento do ano no jardim." },
    { n: "🗳️ Contador de votos", h: "Você contou votos numa ilha deserta. Um coco chamado Wilson venceu." },
    { n: "🦷 Fada do dente", h: "Seu troco acabou e você precisou deixar uma nota promissória embaixo do travesseiro." },
    { n: "🥑 Especialista em abacates", h: "Você escolheu 10 abacates e todos estavam no ponto. Estatisticamente suspeito." },
    { n: "🧙‍♂️ Aprendiz de mago", h: "Você fez seu salário desaparecer em um segundo. Truque impressionante." },
    { n: "🛸 Observador de OVNIs", h: "Você viu uma luz estranha. Era a lanterna de um segurança te expulsando dali." },
    { n: "🧦 Caçador de meias", h: "Você encontrou a meia esquerda perdida desde 2015. Um milagre doméstico." },
    { n: "🧗 Limpador de montanhas", h: "Você tirou um chiclete grudado no topo do Everest." },
    { n: "🦓 Estilista de zebras", h: "Você pintou as listras de uma zebra que estava ficando careca." },
    { n: "🐄 Massagista de vacas", h: "A vaca ficou tão relaxada que o leite saiu com bolhas." },
    { n: "📦 Testador de caixas", h: "Você sentou em 50 caixas para testar resistência. Dormiu na quinta." },
    { n: "🧘 Guru de pedras", h: "Você ensinou meditação para uma pedra. Foi o aluno mais dedicado." },
    { n: "🌑 Minerador lunar", h: "Você trouxe poeira da Lua nos sapatos e vendeu para um colecionador." },
    { n: "🕯️ Fabricante de velas", h: "Você criou velas com cheiro de 'computador novo'. Esgotaram em um minuto." },
    { n: "🧴 Avaliador de perfumes", h: "Você cheirou tantas fragrâncias que agora seu nariz só detecta cebola." },
    { n: "📦 Entregador de pizza", h: "Você chegou em 29 minutos. O cliente queria 31 para tentar ganhar de graça." },
    { n: "🛶 Gondoleiro de esgoto", h: "Você levou um rato para o primeiro encontro romântico dele." },
    { n: "🎻 Músico de semáforo", h: "Você tocou triângulo. Um motorista pagou para você parar." },
    { n: "🕵️ Espião de vizinhos", h: "Você descobriu que a vizinha do quarto andar usa peruca. Informação de valor inestimável." },
    { n: "🧯 Bombeiro de churrasco", h: "Você salvou a carne, mas terminou coberto de molho." },
    { n: "🪁 Piloto de pipas", h: "Você levou uma mensagem de amor pelo céu. O casal terminou dois dias depois." },
    { n: "🧵 Tecelão de nuvens", h: "Você fez um suéter de algodão-doce. Um pássaro comeu tudo." },
    { n: "👞 Engraxate de estátuas", h: "O General nunca teve os sapatos tão brilhantes." },
    { n: "🍦 Provador de sorvetes", h: "Você teve um congelamento cerebral memorável, mas cada colherada valeu a pena." },
    { n: "🎈 Enchedor de balões", h: "Você encheu 500 balões no pulmão. Agora fala como um esquilo." },
    { n: "🧺 Coletor de memes", h: "Você encontrou um meme de 2012 que ainda é engraçado. Ouro puro." },
    { n: "🧤 Taxista de caracóis", h: "Você levou um de uma folha para outra. A viagem durou 4 dias." },
    { n: "🧳 Carregador de formigas", h: "Você carregou uma migalha por 2 metros. Um esforço titânico." },
    { n: "🛁 Banhista de gatos", h: "Você saiu com mais arranhões que um veterano de guerra, mas o gato ficou limpo." },
    { n: "🛐 Estagiário da Kurumi", h: "Você fez café para os outros plugins. Deixaram as sobras para você." }
]

const handler = async (m, { userDb }) => {
    if (!userDb) return
    const cooldown = 600000 
    const now = Date.now()
    const remaining = cooldown - (now - userDb.lastWork)

    if (remaining > 0) {
        return m.reply(`*⌬┤ ⏳ ├⌬ AGUARDE.*\n\n> Você está cansado demais para trabalhar.\n> Tempo restante: *${Math.floor(remaining / 60000)}m ${Math.floor((remaining % 60000) / 1000)}s*.`)
    }

    const job = jobs[Math.floor(Math.random() * jobs.length)]
    const base = Math.floor(Math.random() * 300) + 300
    const bonusLevel = userDb.level * 25
    let subtotal = base + bonusLevel

    let bonusSuit = 0
    let usedSuitBuff = false
    let bonusAmulet = 0
    const update = { $inc: {}, $set: { lastWork: now } }

    if (userDb.inventory?.suit && !userDb.dailyStats.suitUsed) {
        bonusSuit = Math.floor(subtotal * 0.20)
        update.$set['dailyStats.suitUsed'] = true
        userDb.dailyStats.suitUsed = true
        usedSuitBuff = true
    }

    if (userDb.inventory?.amulet === 'fortune') {
        bonusAmulet = Math.floor(subtotal * 0.10)
    }

    const total = subtotal + bonusSuit + bonusAmulet
    userDb.zenCoins += total
    userDb.lastWork = now
    update.$inc.zenCoins = total

    await User.updateOne({ jid: m.sender }, update)

    let txt = `*⌬┤ 💼 ├⌬ TRABALHO CONCLUÍDO*\n\n`
            + `> 👷 *Emprego:* ${job.n}\n`
            + `> 💰 *Ganho:* ${total} ${config.CURRENCY_NAME}\n`
    if (usedSuitBuff) txt += `> 👔 *Bônus da Capa (1/1):* ✅ APLICADO (+20%)\n`
    if (bonusAmulet > 0) txt += `> 🍀 *Bônus do Amuleto da Fortuna:* +${bonusAmulet} (+10%)\n`
    txt += `> ✨ *Bônus de nível:* +${bonusLevel}\n\n`
    txt += `> 📖 *História:* ${job.h}`

    m.reply(txt)
}

handler.help = ['trabalhar']
handler.tags = ['eco']
handler.command = ['work', 'w', 'laburar', 'trabajar', 'chamba', 'trabalhar']
handler.register = true
export default handler
