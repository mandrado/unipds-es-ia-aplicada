import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { CONFIG } from "./config.ts";
import { DocumentProcessor } from "./documentProcessor.ts";
import { type PretrainedModelOptions } from "@huggingface/transformers";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { displayResults } from "./util.ts";

let _neo4jVectorStore = null;

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
    console.log("Iniciando processamento de documentos (sistema de embeddings) com neo4j...\n");

    const documentProcessor = new DocumentProcessor(
        CONFIG.pdf.path,
        CONFIG.textSplitter
    )
    const documents = await documentProcessor.loadAndSplit();
    const embeddings = new HuggingFaceTransformersEmbeddings({
        model: CONFIG.embedding.modelName,
        pretrainedOptions: CONFIG.embedding.pretrainedOptions as PretrainedModelOptions,
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
    for(const[index, doc] of documents.entries()){
        console.log(`Adicionando chunk ${index + 1}/${documents.length}...`);
        await _neo4jVectorStore.addDocuments([doc]);
    }
    console.log("\n✅ Todos os documentos processados e armazenados com sucesso no Neo4j!\n");
    //console.log(Object.entries(documents), "\n");

    // ==================== STEP 2: RUN SIMILARITY SEARCH ====================
    console.log("🔍 ETAPA 2: Executando buscas por similaridade...\n");
    const questions = [
        "O que significa treinar uma rede neural?",
        "O que são tensores e como são representados em JavaScript?",
        "Como converter objetos JavaScript em tensores?",
        "O que é normalização de dados e por que é necessária?",
        "Como funciona uma rede neural no TensorFlow.js?",
        "O que significa treinar uma rede neural?",
        "o que é hot enconding e quando usar?"        
    ];
    for(const question of questions){
        console.log(`\n${'='.repeat(80)}`);
        console.log(`❓ PERGUNTA: ${question}`);
        console.log(`${'='.repeat(80)}\n`);

        const results = await _neo4jVectorStore.
        similaritySearch(
            question,
            CONFIG.similarity.topK
        );
        displayResults(results)
    }

} catch (error) {
    console.error("Erro ao processar documentos:", error);
}
finally {
    await _neo4jVectorStore?.close();
}
