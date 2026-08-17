import User from '../../lib/database/models/zen-users.js'
import config from '../../config.js'

const crimes = [
    { t: "🏦 Roubo ao Banco Central", g: 4000, p: 0.15, h: "Você entrou com uma equipe de hackers e saiu pela porta da frente." },
    { t: "🏧 Hack de Caixa Eletrônico", g: 1800, p: 0.35, h: "Você instalou um malware e o caixa começou a cuspir notas." },
    { t: "🍭 Roubo de doce de uma criança", g: 120, p: 0.95, h: "Foi fácil, mas você se sente um pouco mal... ou não, o doce estava bom." },
    { t: "🎭 Esquema de Pirâmide", g: 5000, p: 0.10, h: "Você vendeu criptomoedas inexistentes. Um gênio do mal, aparentemente." },
    { t: "🧥 Furto no Shopping", g: 700, p: 0.65, h: "Você tirou o sensor de uma jaqueta cara e saiu assobiando." },
    { t: "🚗 Roubo de um Tesla", g: 2500, p: 0.25, h: "Você invadiu o modo autônomo e o carro foi sozinho até sua casa." },
    { t: "💎 Joalheria de Luxo", g: 3500, p: 0.20, h: "Você quebrou o vidro, pegou os diamantes e fugiu de moto." },
    { t: "📱 iPhone de Exposição", g: 900, p: 0.55, h: "Você cortou o cabo de segurança com um alicate e desapareceu." },
    { t: "⛽ Combustível sem pagar", g: 400, p: 0.80, h: "Você encheu o tanque e acelerou antes que o frentista reagisse." },
    { t: "🚲 Bicicleta de Entregador", g: 300, p: 0.85, h: "O pobre entregador subiu ao quinto andar e voltou a pé." },
    { t: "🚢 Iate abandonado", g: 3200, p: 0.20, h: "Você rebocou o iate até um porto clandestino para desmontá-lo." },
    { t: "🛰️ Dados Militares", g: 4500, p: 0.12, h: "Você interceptou um sinal de satélite e vendeu os segredos." },
    { t: "🖼️ Museu de Arte", g: 3800, p: 0.18, h: "Você trocou um Picasso original por um desenho do seu primo." },
    { t: "👜 Bolsa de marca", g: 600, p: 0.70, h: "Um puxão rápido no metrô e você saiu com uma Gucci." },
    { t: "⌚ Relógio de Turista", g: 1100, p: 0.45, h: "Você perguntou as horas e levou o relógio sem a pessoa perceber." },
    { t: "🧪 Fórmula Secreta", g: 2200, p: 0.30, h: "Você roubou a receita da Coca-Cola, mas era só água com açúcar." },
    { t: "🗳️ Votos Falsos", g: 1400, p: 0.40, h: "Você alterou o resultado de um concurso de beleza de cachorros." },
    { t: "🍿 Entrada escondida no cinema", g: 150, p: 0.90, h: "Você entrou pela saída e assistiu ao filme de graça." },
    { t: "🐕 Cachorro com Pedigree", g: 2000, p: 0.30, h: "Você devolveu o cachorro em troca da recompensa. Negócio redondo." },
    { t: "🎸 Guitarra de Rock", g: 2600, p: 0.25, h: "Era a guitarra de uma lenda, ou pelo menos era isso que dizia o anúncio." },
    { t: "🍇 Uvas no Mercado", g: 50, p: 0.98, h: "Você comeu meio quilo antes de chegar ao caixa." },
    { t: "📬 Correspondência do Vizinho", g: 200, p: 0.80, h: "Tinha um vale-presente da Amazon. Obrigado, vizinho." },
    { t: "🚓 Rodas de Viatura", g: 500, p: 0.60, h: "Você deixou a viatura sobre tijolos. Uma escolha questionável." },
    { t: "📉 Fraude Fiscal", g: 3100, p: 0.22, h: "Você declarou que a bot é uma ONG sem fins lucrativos." },
    { t: "🧀 Queijo da Padaria", g: 250, p: 0.85, h: "Um pedaço de parmesão de 2 kg debaixo da jaqueta." },
    { t: "🍗 Frango Assado", g: 180, p: 0.88, h: "Você saiu da rotisseria com o almoço na mão." },
    { t: "🕶️ Óculos Ray-Ban", g: 550, p: 0.75, h: "Você experimentou, olhou no espelho e simplesmente continuou andando." },
    { t: "🎮 PlayStation 5", g: 1300, p: 0.40, h: "Você fingiu ser funcionário da transportadora e levou um console." },
    { t: "📦 Pacote da Amazon", g: 450, p: 0.78, h: "Estava na varanda de alguém. Para sua sorte, havia algo valioso dentro." },
    { t: "🎅 Presentes de Natal", g: 800, p: 0.65, h: "Você levou as caixas debaixo da árvore. O Grinch teria orgulho." },
    { t: "🥂 Jantar de Gala", g: 1200, p: 0.40, h: "Você comeu lagosta e escapou pela janela do banheiro." },
    { t: "🧹 Vassoura de Gari", g: 80, p: 0.92, h: "Não serve para muita coisa, mas alguém comprou." },
    { t: "🧸 Urso Gigante", g: 350, p: 0.80, h: "Você ganhou num jogo de feira usando dardos adulterados." },
    { t: "💊 Farmácia Noturna", g: 1600, p: 0.35, h: "Você roubou suprimentos e vendeu no mercado negro." },
    { t: "🎫 Revenda de Ingressos", g: 2100, p: 0.28, h: "Ingressos falsos para o show do momento. Elegância criminal zero." },
    { t: "🧺 Roupa do Varal", g: 150, p: 0.90, h: "Você levou três cuecas e um vestido de seda." },
    { t: "🛶 Canoa do Lago", g: 750, p: 0.60, h: "Você soltou a canoa e remou até outra cidade." },
    { t: "📻 Rádio de Carro Antigo", g: 300, p: 0.82, h: "Você abriu a porta com um cabide. Um clássico de filme ruim." },
    { t: "🧴 Perfumes no Duty Free", g: 1400, p: 0.38, h: "Você encheu os bolsos de perfumes de grife." },
    { t: "🍕 Pizza alheia", g: 120, p: 0.95, h: "O entregador errou a casa e você decidiu não corrigir." },
    { t: "🛹 Skate de um Skatista", g: 400, p: 0.75, h: "Ele caiu tentando uma manobra e você foi embora com o skate." },
    { t: "🔧 Caixa de Ferramentas", g: 650, p: 0.68, h: "Foi roubada da garagem de um mecânico aposentado." },
    { t: "🔦 Lanterna Tática", g: 200, p: 0.85, h: "Você tirou de uma mochila no camping municipal." },
    { t: "🪁 Pipa de uma Criança", g: 50, p: 0.98, h: "A pipa voou para longe, você pegou e nunca devolveu." },
    { t: "🧥 Casaco de Pele", g: 2800, p: 0.20, h: "Pertencia a uma senhora rica que se distraiu tomando chá." },
    { t: "📚 Livros Didáticos", g: 950, p: 0.50, h: "Estudantes pagam caro por essas coisas usadas hoje em dia." },
    { n: "🎤 Microfone de Karaokê", g: 450, p: 0.72, h: "Você levou depois de cantar sua música favorita." },
    { t: "🥃 Garrafa de Whisky", g: 1100, p: 0.42, h: "Uma reserva de 18 anos que você tirou do bar." },
    { t: "🛴 Patinete Elétrico", g: 850, p: 0.58, h: "Não tinha cadeado. Agora, segundo você, é seu meio de transporte." },
    { t: "🛐 Relíquia do Templo", g: 5000, p: 0.08, h: "Uma estatueta de jade puro. Os monges definitivamente não gostaram." }
]

const handler = async (m, { userDb }) => {
    if (!userDb) return
    const cooldown = 1200000 
    const now = Date.now()
    const remaining = cooldown - (now - (userDb.lastCrime || 0))

    if (remaining > 0) {
        return m.reply(`*⌬┤ ⏳ ├⌬ SOB VIGILÂNCIA.*\n\n> As testemunhas ainda estão falando com a polícia.\n> Fique escondido por: *${Math.floor(remaining / 60000)}m ${Math.floor((remaining % 60000) / 1000)}s*.`)
    }

    let usedBuff = false
    let successChance = 0.45
    const update = { $inc: {}, $set: { lastCrime: now } }

    if (userDb.inventory.mask && !userDb.dailyStats.maskUsed) {
        successChance = 1.0 
        update.$set['dailyStats.maskUsed'] = true
        userDb.dailyStats.maskUsed = true
        usedBuff = true
    }

    const plan = crimes[Math.floor(Math.random() * crimes.length)]
    userDb.lastCrime = now

    if (Math.random() < successChance) {
        const botin = plan.g + (userDb.level * 40)
        userDb.zenCoins += botin
        update.$inc.zenCoins = botin

        let txt = `*⌬┤ 🔫 ├⌬ CRIME BEM-SUCEDIDO*\n\n> 🕵️ *Crime:* ${plan.t || plan.n}\n> 💰 *Lucro:* ${botin} ${config.CURRENCY_NAME}\n`
        if (usedBuff) txt += `> 👺 *Bônus da Máscara (1/1):* ✅ ATIVADO (sucesso garantido)\n`
        txt += `\n> 📖 *História:* ${plan.h}`
        m.reply(txt)
    } else {
        const multa = Math.floor(plan.g / 2)
        const loss = Math.min(userDb.zenCoins, multa)
        userDb.zenCoins -= loss
        update.$inc.zenCoins = -loss
        m.reply(`*⌬┤ 👮 ├⌬ PARADO PELA POLÍCIA!*\n\n> Você foi pego cometendo: ${plan.t || plan.n}.\n> 💸 *Multa paga:* ${loss} ${config.CURRENCY_NAME}.\n> _Talvez o crime realmente não compense._`)
    }

    await User.updateOne({ jid: m.sender }, update)
}

handler.help = ['crime']
handler.tags = ['eco']
handler.command = ['crime', 'crimen']
handler.register = true
export default handler