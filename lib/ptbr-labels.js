// Tradução apenas de apresentação. Nunca use o retorno desta função como chave de banco.
// Os nomes legados em espanhol são preservados nos inventários para manter compatibilidade.

const REPLACEMENTS = [
  ['Conejo', 'Coelho'], ['Liebre', 'Lebre'], ['Pavo salvaje', 'Peru selvagem'], ['Venado', 'Veado'],
  ['Jabalí', 'Javali'], ['Zorro ártico', 'Raposa ártica'], ['Zorro', 'Raposa'], ['Mapache', 'Guaxinim'],
  ['Erizo', 'Ouriço'], ['Ardilla', 'Esquilo'], ['Rata de monte', 'Rato do mato'], ['Codorniz', 'Codorna'],
  ['Serpiente', 'Cobra'], ['Zorrillo', 'Gambá'], ['Búfalo joven', 'Búfalo jovem'], ['Puercoespín real', 'Porco-espinho real'],
  ['Puercoespín', 'Porco-espinho'], ['Tejón', 'Texugo'], ['Nutria', 'Lontra'], ['Mono pequeño', 'Macaco pequeno'],
  ['Cabra montés', 'Cabra-montês'], ['Carnero', 'Carneiro'], ['Caballo salvaje', 'Cavalo selvagem'],
  ['Perro callejero', 'Cão de rua'], ['Gato montés', 'Gato-do-mato'], ['Halcón joven', 'Falcão jovem'],
  ['Búho nocturno', 'Coruja noturna'], ['Loro colorido', 'Papagaio colorido'], ['Cerdo salvaje', 'Porco selvagem'],
  ['Lobo joven', 'Lobo jovem'], ['Paloma', 'Pombo'], ['Topo', 'Toupeira'], ['Perezoso', 'Bicho-preguiça'],
  ['Visón', 'Visom'], ['Faisán', 'Faisão'], ['Coatí', 'Quati'], ['Tití', 'Sagui'], ['Hurón', 'Furão'],
  ['Lagartija', 'Lagartixa'], ['Cangrejo', 'Caranguejo'], ['Camarón', 'Camarão'], ['Calamar', 'Lula'],
  ['Pulpo pequeño', 'Polvo pequeno'], ['Pulpo', 'Polvo'], ['Trucha arcoíris', 'Truta arco-íris'], ['Trucha de Oro', 'Truta Dourada'],
  ['Trucha', 'Truta'], ['Merluza', 'Pescada'], ['Caballa', 'Cavala'], ['Pejerrey', 'Peixe-rei'],
  ['Atún Aleta Azul', 'Atum-rabilho'], ['Atún pequeño', 'Atum pequeno'], ['Anchoa', 'Anchova'], ['Bacalao', 'Bacalhau'],
  ['Lenguado', 'Linguado'], ['Surubí', 'Surubim'], ['Pez Espada', 'Peixe-espada'], ['Pez Payaso', 'Peixe-palhaço'],
  ['Pez Cirujano', 'Peixe-cirurgião'], ['Pez Ángel', 'Peixe-anjo'], ['Pez Globo', 'Baiacu'], ['Pez Martillo', 'Peixe-martelo'],
  ['Pez Mariposa', 'Peixe-borboleta'], ['Pez Loro', 'Peixe-papagaio'], ['Pez Mandarín', 'Peixe-mandarim'],
  ['Pez Disco', 'Acará-disco'], ['Pez León', 'Peixe-leão'], ['Pez Vela', 'Peixe-vela'], ['Pez Tigre', 'Peixe-tigre'],
  ['Pez Gato', 'Peixe-gato'], ['Pez Betta', 'Peixe-betta'], ['Pez Cofre', 'Peixe-cofre'], ['Pez Erizo', 'Peixe-ouriço'],
  ['Pez Napoleón', 'Peixe-napoleão'], ['Pez Gatillo', 'Peixe-porco'], ['Pez Oro Macizo', 'Peixe de Ouro Maciço'],
  ['Pez Galáctico', 'Peixe Galáctico'], ['Gran Pez Sol', 'Grande Peixe-lua'], ['Salmón Plata', 'Salmão Prateado'],
  ['Salmón Real', 'Salmão-real'], ['Salmón', 'Salmão'], ['Anguila', 'Enguia'], ['Morena', 'Moreia'],
  ['Langosta Real', 'Lagosta-real'], ['Calamar Cristal', 'Lula de Cristal'], ['Calamar Colosal', 'Lula Colossal'],
  ['Pulpo Anillos', 'Polvo-de-anéis'], ['Pulpo Mimético', 'Polvo-mímico'], ['Tiburón Bebé', 'Tubarão Filhote'],
  ['Tiburón Tigre', 'Tubarão-tigre'], ['Tiburón Mako', 'Tubarão-mako'], ['Tiburón Zorro', 'Tubarão-raposa'],
  ['Tiburón Blanco', 'Tubarão-branco'], ['Tiburón Basalto', 'Tubarão de Basalto'], ['Tiburón Cristal', 'Tubarão de Cristal'],
  ['Guardián Abismo', 'Guardião do Abismo'], ['Ballena Azul', 'Baleia-azul'], ['Ballena Jorobada', 'Baleia-jubarte'],
  ['Ballena Galáctica', 'Baleia Galáctica'], ['Orca asesina', 'Orca'], ['Cachalote Blanco', 'Cachalote Branco'],
  ['Tortuga Ancestral', 'Tartaruga Ancestral'], ['Caracol Fuego', 'Caracol de Fogo'], ['Ostra Perla', 'Ostra de Pérola'],
  ['Perla Blanca', 'Pérola Branca'], ['Perla Negra', 'Pérola Negra'], ['Leopardo Nieves', 'Leopardo-das-neves'],
  ['Oso Pardo', 'Urso-pardo'], ['Oso Polar', 'Urso-polar'], ['Oso Negro', 'Urso-negro'], ['Lobo de Crin', 'Lobo-guará'],
  ['Cocodrilo', 'Crocodilo'], ['Caimán Negro', 'Jacaré-negro'], ['Aligátor', 'Jacaré'], ['Cobra Real', 'Cobra-real'],
  ['Pitón', 'Píton'], ['Rinoceronte Negro', 'Rinoceronte-negro'], ['Rinoceronte Blanco', 'Rinoceronte-branco'],
  ['Águila Imperial', 'Águia-imperial'], ['Águila Real', 'Águia-real'], ['Cóndor Andes', 'Condor-dos-Andes'],
  ['León Blanco', 'Leão-branco'], ['León', 'Leão'], ['Jirafa', 'Girafa'], ['Cebra', 'Zebra'],
  ['Tigre Bengala', 'Tigre-de-bengala'], ['Tigre Siberiano', 'Tigre-siberiano'], ['Tigre Albino', 'Tigre-albino'],
  ['Pavo Real', 'Pavão'], ['Ciervo Real', 'Cervo-real'], ['Toro Bravo', 'Touro bravo'], ['Gran Jabalí', 'Grande Javali'],
  ['Mamut Pequeño', 'Mamute Pequeno'], ['Espalda Plateada', 'Costas-prateadas'], ['Elefante African', 'Elefante Africano'],
  ['Dragón Komodo', 'Dragão-de-komodo'], ['Dragón de Hielo', 'Dragão de Gelo'], ['Dragón Marino', 'Dragão Marinho'],
  ['Dragón Negro', 'Dragão Negro'], ['Dragón Dorado', 'Dragão Dourado'], ['Dragón', 'Dragão'], ['Unicornio', 'Unicórnio'],
  ['Fénix Azul', 'Fênix Azul'], ['Fénix', 'Fênix'], ['León de Nemea', 'Leão de Nemeia'], ['Ciervo Dorado', 'Cervo Dourado'],
  ['Pegaso', 'Pégaso'], ['Hydra de Agua', 'Hidra de Água'], ['Hydra', 'Hidra'], ['Cerbero', 'Cérbero'],
  ['Bicornio', 'Bicórnio'], ['Licántropo', 'Lobisomem'], ['Monstruo del Lago', 'Monstro do Lago'],
  ['Espíritu Bosque', 'Espírito da Floresta'], ['León Alado', 'Leão Alado'], ['Hoja del Destino', 'Lâmina do Destino'],
  ['Corona del Rey', 'Coroa do Rei'], ['Deidad Bosque', 'Divindade da Floresta'], ['Tridente Poseidón', 'Tridente de Poseidon'],
  ['Corona Atlante', 'Coroa Atlante'], ['Tesoro Español', 'Tesouro Espanhol'], ['Diamante Marino', 'Diamante Marinho'],
  ['Arpa Sirena', 'Harpa de Sereia'], ['Corona Coral', 'Coroa de Coral'], ['Escudo Escamas', 'Escudo de Escamas'],
  ['Daga Atlantis', 'Adaga de Atlântida'], ['Cristal Océano', 'Cristal do Oceano'], ['Estrella Cósmica', 'Estrela Cósmica'],
  ['Cangrejo Diamante', 'Caranguejo Diamante'], ['Concha Verdad', 'Concha da Verdade'], ['Gran Cofre Pirata', 'Grande Baú Pirata'],
  ['Lanza Neptuno', 'Lança de Netuno'], ['Linterna Abismo', 'Lanterna do Abismo'], ['Fragmento Meteorito', 'Fragmento de Meteorito'],
  ['Ídolo Sumergido', 'Ídolo Submerso'], ['Cubo Destino', 'Cubo do Destino'], ['Corona Perlas', 'Coroa de Pérolas'],
  ['Corazón Océano', 'Coração do Oceano'], ['Cetro Mareas', 'Cetro das Marés'], ['Kraken Rey', 'Rei Kraken'],
  ['Esencia Poseidón', 'Essência de Poseidon'], ['Rama seca', 'Galho seco'], ['Piedra común', 'Pedra comum'],
  ['Hueso viejo', 'Osso velho'], ['Sombrero roto', 'Chapéu rasgado'], ['Telaraña', 'Teia de aranha'],
  ['Hojas muertas', 'Folhas mortas'], ['Hongo podrido', 'Cogumelo podre'], ['Cuerda cortada', 'Corda cortada'],
  ['Mochila rota', 'Mochila rasgada'], ['Sal derramada', 'Sal derramado'], ['Zapato viejo', 'Sapato velho'],
  ['Caracol de tierra', 'Caracol terrestre'], ['Tronco pequeño', 'Tronco pequeno'], ['Grillo muerto', 'Grilo morto'],
  ['Ovillo de lana', 'Novelo de lã'], ['Pieza de puzzle', 'Peça de quebra-cabeça'], ['Cráneo de rata', 'Crânio de rato'],
  ['Calcetín', 'Meia'], ['Retazo de tela', 'Retalho de tecido'], ['Caja vacía', 'Caixa vazia'],
  ['Martillo roto', 'Martelo quebrado'], ['Escoba vieja', 'Vassoura velha'], ['Canasta rota', 'Cesta quebrada'],
  ['Papel arrugado', 'Papel amassado'], ['Barrilete roto', 'Pipa rasgada'], ['Navaja oxidada', 'Canivete enferrujado'],
  ['Cadena rota', 'Corrente quebrada'], ['Ladrillo rojo', 'Tijolo vermelho'], ['Remo roto', 'Remo quebrado'],
  ['Tela de carpa', 'Tecido de barraca'], ['Tiesto de barro', 'Caco de barro'], ['Frasco vacío', 'Frasco vazio'],
  ['Pluma sucia', 'Pena suja'], ['Cáscara de huevo', 'Casca de ovo'], ['Bufanda vieja', 'Cachecol velho'],
  ['Hilo cortado', 'Linha cortada'], ['Seta venenosa', 'Cogumelo venenoso'], ['Diente de lobo', 'Dente de lobo'],
  ['Hierba seca', 'Erva seca'], ['Corteza', 'Casca de árvore'], ['Guijarro', 'Pedregulho'],
  ['Pañuelo sucio', 'Lenço sujo'], ['Fragmento de vasija', 'Fragmento de vaso'], ['Mimbre roto', 'Vime quebrado'],
  ['Suela gastada', 'Sola gasta'], ['Gancho oxidado', 'Gancho enferrujado']
]

export function ptItemLabel(value = '') {
  let out = String(value)
  for (const [from, to] of REPLACEMENTS) out = out.split(from).join(to)
  return out
}

export function ptRarity(value = '') {
  return ({ trash: 'SUCATA 🪵', common: 'COMUM 🏹', rare: 'RARO 🛡️', special: 'MÍTICO 🔱' })[value] || value
}
