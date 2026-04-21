import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { CONFIG } from "./config.ts";
import { DocumentProcessor } from "./documentProcessor.ts";
import { type PretrainedModelOptions } from "@huggingface/transformers";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { ChatOpenAI } from "@langchain/openai";
import { AI } from "./ai.ts";
import { writeFile, mkdir } from 'node:fs/promises';

let _neo4jVectorStore = null;

// Função para adicionar delay entre requisições (evita rate limiting)
async function clealAll(vectorStore: Neo4jVectorStore, nodeLabel: string): Promise<void> {
    console.log(`Limpando todos os nós com label "${nodeLabel}" do Neo4j...`);
    try {
        await vectorStore.query(`MATCH (n:${nodeLabel}) DETACH DELETE n`);
        console.log(`Todos os nós com label "${nodeLabel}" foram limpos com sucesso.`);

    } catch (error) {
        console.error(`Erro ao limpar nós com label "${nodeLabel}":`, error);
    }
}

try {
    console.log("🚀 Iniciando processamento de documentos (sistema de embeddings) com neo4j...\n");

    const documentProcessor = new DocumentProcessor(
        CONFIG.pdf.path,
        CONFIG.textSplitter
    )
    const documents = await documentProcessor.loadAndSplit();

    const embeddings = new HuggingFaceTransformersEmbeddings({
        model: CONFIG.embedding.modelName,
        pretrainedOptions: CONFIG.embedding.pretrainedOptions as PretrainedModelOptions,
    });

    const nlpModel = new ChatOpenAI({
        temperature: CONFIG.openRouter.temperature,
        maxRetries: CONFIG.openRouter.maxRetries,
        modelName: CONFIG.openRouter.nlpModel,
        openAIApiKey: CONFIG.openRouter.apiKey,
        configuration: {
            baseURL: CONFIG.openRouter.url,
            defaultHeaders: CONFIG.openRouter.defaultHeaders
        }
    });

    // const response = await embeddings.embedQuery("JavaScript?");
    // console.log("Embedding da consulta:", response);
    // const response = await embeddings.embedDocuments(["JavaScript?"]);
    // console.log("Embedding da consulta:", response);

    _neo4jVectorStore = await Neo4jVectorStore.fromExistingGraph(
        embeddings,
        CONFIG.neo4j
    );

    clealAll(_neo4jVectorStore, CONFIG.neo4j.nodeLabel);
    for (const [index, doc] of documents.entries()) {
        console.log(`✅ Adicionando chunk ${index + 1}/${documents.length}...`);
        await _neo4jVectorStore.addDocuments([doc]);
    }
    console.log("\n✅ Todos os documentos processados e armazenados com sucesso no Neo4j!\n");
    //console.log(Object.entries(documents), "\n");

    // ==================== STEP 2: RUN SIMILARITY SEARCH ====================
    console.log("🔍 ETAPA 2: Executando buscas por similaridade...\n");
    const questions = [
        "O que significa treinar uma rede neural?",
        // "O que são tensores e como são representados em JavaScript?",
        // "Como converter objetos JavaScript em tensores?",
        // "O que é normalização de dados e por que é necessária?",
        // "Como funciona uma rede neural no TensorFlow.js?",
        // "O que significa treinar uma rede neural?",
        // "o que é hot enconding e quando usar?"        
    ];

    const ai = new AI({
        nlpModel,
        debugLog: console.log,
        vectorStore: _neo4jVectorStore,
        promptConfig: CONFIG.promptConfig,
        templateText: CONFIG.templateText,
        topK: CONFIG.similarity.topK,
    })

    for (const index in questions) {
        const question = questions[index]
        console.log(`\n${'='.repeat(80)}`);
        console.log(`📌 PERGUNTA: ${question}`);
        console.log('='.repeat(80));
        const result = await ai.answerQuestion(question!)
        if (result.error) {
            console.log(`\n❌ Erro: ${result.error}\n`);
            continue
        }

        console.log(`\n${result.answer}\n`);

        // Salva a resposta em um arquivo markdown
        await mkdir(CONFIG.output.answersFolder, { recursive: true });
        // Gera um nome de arquivo único usando o índice da pergunta e um timestamp
        const fileName = `${CONFIG.output.answersFolder}/${CONFIG.output.fileName}-${index}-${Date.now()}.md`
        // Escreve a resposta no arquivo markdown
        await writeFile(fileName, result.answer!)

        // const results = await _neo4jVectorStore.
        // similaritySearch(
        //     question,
        //     CONFIG.similarity.topK
        // );
        // displayResults(results)
    }

    // Cleanup
    console.log(`\n${'='.repeat(80)}`);
    console.log("✅ Processamento concluído com sucesso!\n");

} catch (error) {
    console.error('error', error)
} finally {
    await _neo4jVectorStore?.close();
}
