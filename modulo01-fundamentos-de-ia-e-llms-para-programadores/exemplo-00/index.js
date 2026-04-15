process.env['TF_CPP_MIN_LOG_LEVEL'] = '2';
const { default: tf } = await import('@tensorflow/tfjs-node');

// Exemplo de pessoas para treino (cada pessoa com idade, cor e localização)
// const pessoas = [
//     { nome: "Erick", idade: 30, cor: "azul", localizacao: "São Paulo" },
//     { nome: "Ana", idade: 25, cor: "vermelho", localizacao: "Rio" },
//     { nome: "Carlos", idade: 40, cor: "verde", localizacao: "Curitiba" }
// ];

// Vetores de entrada com valores já normalizados e one-hot encoded
// Ordem: [idade_normalizada, azul, vermelho, verde, São Paulo, Rio, Curitiba]
// const tensorPessoas = [
//     [0.33, 1, 0, 0, 1, 0, 0], // Erick
//     [0, 0, 1, 0, 0, 1, 0],    // Ana
//     [1, 0, 0, 1, 0, 0, 1]     // Carlos
// ]

// Usamos apenas os dados numéricos, como a rede neural só entende números.
// tensorPessoasNormalizado corresponde ao dataset de entrada do modelo.
const tensorPessoasNormalizado = [
    [0.33, 1, 0, 0, 1, 0, 0], // Erick
    [0, 0, 1, 0, 0, 1, 0],    // Ana
    [1, 0, 0, 1, 0, 0, 1]     // Carlos
]

// Labels das categorias a serem previstas (one-hot encoded)
// [premium, medium, basic]
const labelsNomes = ["premium", "medium", "basic"]; // Ordem dos labels
const tensorLabels = [
    [1, 0, 0], // premium - Erick
    [0, 1, 0], // medium - Ana
    [0, 0, 1]  // basic - Carlos
];

// Criamos tensores de entrada (xs) e saída (ys) para treinar o modelo
const inputXs = tf.tensor2d(tensorPessoasNormalizado)
const outputYs = tf.tensor2d(tensorLabels)

// inputXs.print();
// outputYs.print();

async function trainModel(inputXs, outputYs) {
    const model = tf.sequential();
    // Primeira camada da rede
    // entrada de 7 posições (idade normalizada + 3 cores + 3 localizações) e 10 neurônios na camada oculta
    model.add(tf.layers.dense({ inputShape: [7], units: 80, activation: 'relu' }));
    // 80 neurônios na segunda camada oculta, quanto mais neurônios, mais complexa a rede pode aprender
    // e consequentemente mais tempo de treino, mas cuidado para não exagerar e causar overfitting

    // a ReLU age como um filtro:
    // É como se ela deixasse somente os dados interessantes passarem para a próxima camada,
    // permitindo que apenas os valores positivos passem para a próxima camada, 
    // o que ajuda a rede a aprender padrões complexos.
    // se for zero ou negativo, a ReLU retorna zero, o que ajuda a rede a focar nos dados mais relevantes.
    model.add(tf.layers.dense({ units: 80, activation: 'relu' }));
    // Camada de saída com 3 neurônios (uma para cada categoria) e função de ativação softmax para obter probabilidades
    // um para cada categoria (premium, medium, basic) e 
    // a função softmax transforma as saídas em probabilidades que somam 1, facilitando a interpretação dos resultados.
    model.add(tf.layers.dense({ units: 3, activation: 'softmax' }));

    // Compilando o modelo com otimizador Adam ( Adaptive Moment Estimation) 
    // Adam é um algoritmo de otimização eficiente para treinamento de redes neurais,
    // ele ajusta os pesos da rede com base no erro de previsão, ajudando a encontrar a melhor 
    // configuração de pesos para minimizar a função de perda. 
    // ele aprende com histórico de erros e acertos, o que o torna mais rápido e eficaz em muitos casos.
    // função de perda categoricalCrossentropy (usada para classificação multi-classe) e métrica de acurácia
    // loss: categoricalCrossentropy é uma função de perda usada para problemas de classificação multi-classe,
    // ela mede a diferença entre as probabilidades previstas pelo modelo e as categorias reais (one-hot encoded).
    // Ele compara o que o modelo prevê (probabilidades) com as categorias reais (one-hot encoded) e penaliza mais fortemente
    // as previsões erradas, ajudando o modelo a aprender a fazer previsões mais precisas.
    // a categoria premium será sempre [1, 0, 0], a medium será [0, 1, 0] e a basic será [0, 0, 1].

    // quanto mais distantes as previsões do modelo estiverem das categorias reais, 
    // maior será a perda, e o otimizador Adam irá ajustar os pesos da rede para minimizar essa perda ao longo do tempo.
    model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });

    // Treinando o modelo por 100 épocas (iterações sobre o dataset)
    // verbose: 0 para não mostrar o progresso do treino, 1 para mostrar a barra de progresso, 2 para mostrar apenas as métricas
    // epochs: 100 para treinar o modelo por 100 iterações sobre o dataset, o que pode ajudar a rede a aprender melhor os padrões dos dados.
    // shuffle: true para embaralhar os dados a cada época, ajudando a evitar overfitting, 
    // o que significa que o modelo não vai aprender a memorizar a ordem dos dados, mas sim os padrões gerais.
    await model.fit(inputXs, outputYs, { 
        verbose: 0, 
        epochs: 100,
        shuffle: true,
            callbacks:{
                onEpochEnd: async (epoch, logs) => console.log(
                    `Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`
                )
           } 
    }); 

    return model;
}

async function predict(model, pessoaTensorNormalizada) {
    // transformando o array da nova pessoa em um tensor 2D (mesma forma dos dados de treino)
    const inputTensor = tf.tensor2d(pessoaTensorNormalizada);
    // Fazendo a previsão com o modelo treinado (output será um vetor de 3 probabilidades para cada categoria)
    const prediction = model.predict(inputTensor);
    const predArray = await prediction.array();
    console.log(`Probabilidades previstas para cada categoria: ${predArray[0].map(p => p.toFixed(4)).join(', ')}`);

    // Obtendo o índice da categoria com a maior probabilidade
    const predictedIndex = prediction.argMax(-1).dataSync()[0];
    // Mapeando o índice para o nome da categoria
    const predictedCategory = labelsNomes[predictedIndex];
    console.log(`A pessoa ${pessoa.nome} foi classificada como: ${predictedCategory}`);

    return predArray[0].map((p, i) => ({ p, i}));
}

// Treinando o modelo com os dados de entrada (inputXs) e saída (outputYs)
// quanto mais dado melhor!
// assim o modelo pode aprender mais padrões e fazer previsões mais precisas,
// mas cuidado para não exagerar e causar overfitting (quando o modelo aprende tão bem os dados de treino que não generaliza bem para novos dados)
const model = await trainModel(inputXs, outputYs);

// testando o modelo com um novo dado de entrada (uma pessoa de 28 anos, cor azul e localização São Paulo)
const pessoa = { nome: "Maria", idade: 48, cor: "verde", localizacao: "Curitiba" };
// Normalizando os dados de entrada da nova pessoa
const idadeNormalizada = pessoa.idade / 100; // Normalizando a idade (dividindo por 100 para ficar entre 0 e 1)
const corAzul = pessoa.cor === "azul" ? 1 : 0;
const corVermelho = pessoa.cor === "vermelho" ? 1 : 0;
const corVerde = pessoa.cor === "verde" ? 1 : 0;
const localizacaoSP = pessoa.localizacao === "São Paulo" ? 1 : 0;
const localizacaoRio = pessoa.localizacao === "Rio" ? 1 : 0;
const localizacaoCuritiba = pessoa.localizacao === "Curitiba" ? 1 : 0;

const pessoaTensorNormalizada = [
    [
        idadeNormalizada, 
        corAzul, 
        corVermelho, 
        corVerde, 
        localizacaoSP, 
        localizacaoRio, 
        localizacaoCuritiba
    ]
];

const predicao = await predict(model, pessoaTensorNormalizada);

const resultado = predicao
// Ordena as categorias pela probabilidade (do mais provável para o menos provável)
    .sort((a, b) => b.p - a.p) 
    // Mapeia para o nome da categoria e formata a probabilidade como porcentagem
    .map(p => `${labelsNomes[p.i]}: (${(p.p * 100).toFixed(2)}%)`) 
    // Junta as categorias em uma string formatada para exibição
    .join('\n');  
    console.log(resultado);
