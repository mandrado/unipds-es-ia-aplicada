import 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
import { workerEvents } from '../events/constants.js';
let _globalCtx = {};
let _model = null;

// Pesos para cada feature, ajustados manualmente com base na importância percebida
const WEIGHTS = {
    category: 0.4,
    color: 0.3,
    price: 0.2,
    age: 0.1,
}

// 🔢 Normalize continuous values (price, age) to 0–1 range
// Why? Keeps all features balanced so no one dominates trainingS
// Formula: (val - min) / (max - min)
// Example: price=129.99, minPrice=39.99, maxPrice=199.99 → 0.56
const normalize = (val, min, max) => (val - min) / ( (max - min) || 1);

function makeContext(products, users) {
    const ages = users.map(u => u.age);
    const prices = products.map(p => p.price);

    const ageMin = Math.min(...ages);
    const ageMax = Math.max(...ages);
    
    const priceMin = Math.min(...prices);
    const priceMax = Math.max(...prices);

    const colors = [...new Set(products.map(p => p.color))];
    const categories = [...new Set(products.map(p => p.category))];

    const colorsIndex = Object.fromEntries(
        colors.map((color, index) => { 
            return [color, index]
        }))
    const categoriesIndex = Object.fromEntries(
        categories.map((category, index) => { 
            return [category, index]
        }))

    // Computar a média de idade dos compradores por produto
    // ajuda a personalizar as recomendações com base na faixa etária dos usuários
    const midAge = (ageMin + ageMax) / 2;
    const ageSums = {};
    const ageCounts = {};

    users.forEach(user => {
        user.purchases.forEach(p => {
            ageSums[p.name] = (ageSums[p.name] || 0) + user.age;
            ageCounts[p.name] = (ageCounts[p.name] || 0) + 1;
        });
    })

    const productAvgAgeNorm = Object.fromEntries(
        products.map(product => {
            const avg = ageCounts[product.name] ? 
            ageSums[product.name] / ageCounts[product.name] : 
            midAge;

            return [product.name, normalize(avg, ageMin, ageMax)]
        })
    )
    
    return {
        products,
        users,
        productAvgAgeNorm,
        colorsIndex,
        categoriesIndex,
        ageMin,
        ageMax,
        priceMin,
        priceMax,
        numCategories: categories.length,
        numColors: colors.length,
        // price + age + color + categories
        dimentions : 2 + colors.length + categories.length
    }
}

const oneHotWeighted = (index, lenght, weight) => 
    tf.oneHot(index, lenght).cast('float32').mul(weight);

function encodeProduct(product, context) {
    // normalizando dados para ficar de 0 a 1 
    // e aplicando pesos para cada feature
    const price = tf.tensor1d([
        normalize(
            product.price, 
            context.priceMin, 
            context.priceMax
        ) * WEIGHTS.price]
    )

    const age = tf.tensor1d([
        (
            context.productAvgAgeNorm[product.name] ?? 0.5
        ) * WEIGHTS.age]
    )
    
    const category = oneHotWeighted(
        context.categoriesIndex[product.category],
        context.numCategories,
        WEIGHTS.category
    )

    const color = oneHotWeighted(
        context.colorsIndex[product.color],
        context.numColors,
        WEIGHTS.color
    )

    return tf.concat1d(
        [price, age, category, color]
    )
}

function encodeUser(user, context) {

    if(user.purchases.length) {
        return tf.stack(
            user.purchases.map(
                product => encodeProduct(product, context)
            )
        )
        .mean(0) // média dos vetores dos produtos comprados para representar o usuário
        .reshape([ // reshape para 2D (1, features) para compatibilidade com modelos
            1, 
            context.dimentions
        ]) 
    }    
    
    return tf.concat1d(
        [
            tf.zeros([1]), // placeholder para preço (ignorado), sem sentido para usuário
            tf.tensor1d([
                normalize(user.age, context.ageMin, context.ageMax) 
                * WEIGHTS.age
            ]), // idade normalizada e ponderada
            tf.zeros([context.numCategories]).cast('float32'), // categorias não se aplicam diretamente ao usuário
            tf.zeros([context.numColors]).cast('float32') // cores não se aplicam diretamente ao usuário
        ]
    ).reshape([1, context.dimentions]) // reshape para 2D (1, features)
}

function createTrainingData(context) {
    const inputs = []
    const labels = []

    context.users
        .filter(user => user.purchases.length)
        .forEach(user => {
            const userVector = encodeUser(user, context).dataSync();
            context.products.forEach(product => {
                const productVector = encodeProduct(product, context).dataSync();

                const label = user.purchases.some(
                    purchase => purchase.name === product.name ? 
                    1 : 0 // 1 se comprou, 0 caso contrário
                ) 
                // combinando o vetor do usuário e do produto para criar a entrada do modelo
                inputs.push([...userVector, ...productVector]);
                labels.push(label);


            });
        })
    
    return {
        inputs: tf.tensor2d(inputs),
        labels: tf.tensor1d(labels, 'float32'),
        inputDimention: context.dimentions * 2, // vetor do usuário + vetor do produto
        outputDimention: 1 // classificação binária: comprou ou não
    }
}

async function configureNeuralNetAndTrain(trainData){

    const model = tf.sequential();
    // cama de entrada
    // - inputShape: Numero de features (dimentions) por exemplo de treino (trainData.inputDimention
    // Exemplo: se temos 10 features para o usuário e 10 para o produto, inputShape seria 20
    // - units: 128 neurônios na camada, (Muitos "olhos" observando os padrões)
    // Mais neurônios podem capturar padrões mais complexos, mas também aumentam o risco de overfitting
    // - activation: 'relu' (Rectified Linear Unit) é uma função de ativação que ajuda o modelo a aprender padrões não lineares.
    // Ela é eficiente e amplamente utilizada em redes neurais.
    model.add(
        tf.layers.dense({
            inputShape: [trainData.inputDimention],
            units: 128,
            activation: 'relu'
        })
    );

    // camada oculta 2
    // 64 neurônios (menos que a primeira camada: começa a comprimir informação, 
    // forçando o modelo a focar nos padrões mais importantes)
    // é um número comum para camadas ocultas, permitindo que o modelo capture interações mais complexas entre as features sem ser excessivamente grande.
    // -ativation: 'relu' (ainda extraindo combinações relevantes de features, mas agora com uma representação mais compacta)
    model.add(
        tf.layers.dense({
            units: 64,
            activation: 'relu'
        })
    );
    
    // camada oculta 3
    // 32 neurônios (continua a compressão, forçando o modelo a focar ainda mais nos padrões mais críticos)
    // Exemplo: De muitos sinais, mantém apenas os mais fortes e relevantes para a decisão final.
    // -ativation: 'relu' (ainda extraindo combinações relevantes de features, mas agora com uma representação mais compacta)
    model.add(
        tf.layers.dense({
            units: 32,
            activation: 'relu'
        })
    );
    
    // camada de saída
    // 1 neurônio (porque vamos prever uma única saída: a probabilidade de compra)
    // - activation: 'sigmoid' (transforma a saída em um valor entre 0 e 1, interpretado como a probabilidade de compra)
    // Exemplo: 0.9 = recomendação muito forte, 0.1 = recomendação fraca
    model.add(
        tf.layers.dense({
            units: trainData.outputDimention,
            activation: 'sigmoid'
        })
    );

    model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
    });

    await model.fit(trainData.inputs, trainData.labels, {
        epochs: 100,
        batchSize: 32,
        shuffle: true,
        callbacks: { 
            onEpochEnd: (epoch, logs) => {
                postMessage({
                    type: workerEvents.trainingLog,
                    epoch: epoch,
                    loss: logs.loss,
                    accuracy: logs.acc ?? logs.accuracy
                });
            }
        }
    })

    return model;
}

async function trainModel({ users }) {
    
    console.log('Training model with users:', users)

    postMessage({ type: workerEvents.progressUpdate, progress: { progress: 50 } });
    const products = await (await fetch('/data/products.json')).json();

    const context = makeContext(products, users);
    context.productVetors = products.map(product => {
        return{
            name: product.name,
            meta: {...product},
            vector: encodeProduct(product, context).dataSync()
        }
    })
        
    _globalCtx = context;

    const trainData = createTrainingData(context)
    _model = await configureNeuralNetAndTrain(trainData)
    
    postMessage({ type: workerEvents.progressUpdate, progress: { progress: 100 } });
    postMessage({ type: workerEvents.trainingComplete });
}

function recommend({ user } = {}) {
    if (!_model || !user) return;
    const context = _globalCtx;
    // convertendo o usuário para um vetor de características
    // (preco ignorado, idade normalizada, categorias e cores como zeros)
    // isso torna as informações do usuário compatíveis com o formato de entrada do modelo, 
    // permitindo que ele faça previsões baseadas nas características do usuário e dos produtos

    const userVector = encodeUser(user, context).dataSync();

    // Em aplicativos reais:
    // seria melhor calcular as recomendações para todos os produtos de uma vez.
    // Armazene todos os vetores de produtos em um banco de dados vetorial (como Neo4j, PostgreSQL com extensão pgvector ou Pinecone) e faça uma consulta de similaridade para encontrar os produtos mais próximos do vetor do usuário.
    // Isso é muito mais eficiente do que iterar sobre cada produto e fazer uma previsão individualmente.
    // Consulta: Encontre os 200 produtos mais proximos do vetor do usuário usando uma métrica de similaridade 
    // (como cosseno ou euclidiana) e retorne esses produtos como recomendações.
    // Execute _model.predict() apenas nesses produtos filtrados para obter 
    // as previsões de compra, em vez de fazer isso para todos os produtos disponíveis.

    // Crie pares de entreada: para cada produto, concatene o vetor do usuário com o vetor do produto 
    // para formar a entrada do modelo.
    // Por que? O modelo foi treinado para entender a relação entre as características do usuário e do produto, 
    // então precisamos fornecer ambos os vetores para obter uma previsão precisa.

    const inputs = context.productVetors.map(product => {
        return [...userVector, ...product.vector]
    })

    // Converta todos esses pares (usuário + produto) em um tensor 2D, onde cada linha representa um par usuário-produto.
    // Isso é necessário porque o modelo espera uma entrada em formato de lote (batch), mesmo que seja apenas um exemplo.
    const inputTensor = tf.tensor2d(inputs);

    // Rode a rede neural treinada para todos os pares de usuário-produto e 
    // obtenha as previsões de compra (valores entre 0 e 1).
    // O modelo irá avaliar cada par e fornecer uma probabilidade de compra, 
    // Quanto maior o valor, maior a probabilidade de compra.
    const predictions = _model.predict(inputTensor);

    // Extraia as pontuações para umn array JS normal e combine com os produtos correspondentes.
    // Isso nos dá uma lista de produtos junto com suas respectivas pontuações de recomendação.
     const scores = predictions.dataSync();
     const recommendations = context.productVetors.map((product, index) => {
        return {
            
            ...product.meta,
            name: product.name,
            score: scores[index] // pontuação de recomendação para este produto
        }
     })

     const sortedProducts = recommendations.sort(
        (a, b) => b.score - a.score
    );

    // Envie a lista ordendada de recomendações de volta para o thread principal,
     postMessage({
        type: workerEvents.recommend,
        user, 
        recommendations: sortedProducts.slice(0, 20) // retornando apenas as top 20 recomendações
     })
}

const handlers = {
    [workerEvents.trainModel]: trainModel,
    [workerEvents.recommend]: d => recommend(d),
};

self.onmessage = e => {
    const { action, ...data } = e.data;
    if (handlers[action]) handlers[action](data);
};
