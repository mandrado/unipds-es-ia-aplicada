import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { CONFIG } from "./config.ts";
import { DocumentProcessor } from "./documentProcessor.ts";
import { type PretrainedModelOptions } from "@huggingface/transformers";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";

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
    console.log(Object.entries(documents), "\n");

} catch (error) {
    console.error("Erro ao processar documentos:", error);
}
