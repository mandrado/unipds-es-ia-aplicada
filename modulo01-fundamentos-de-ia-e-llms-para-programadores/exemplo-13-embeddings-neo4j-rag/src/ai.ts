import { type Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";

// Definição do tipo de função para logs de debug
type DebugLog = (...args: unknown[]) => void;

// Definição do tipo de parâmetros para a classe AI
type params = {
    debugLog: DebugLog,
    vectorStore: Neo4jVectorStore,
    nlpModel: ChatOpenAI,
    promptConfig: any,
    templateText: string,
    topK: number
}

// Definição da interface para o estado da cadeia de execução
interface ChainState {
    question: string;
    context?: string;
    answer?: string;
    topScore?: number;
    error?: string;
}

export class AI {
    private params: params;

    constructor(params: params) {
        this.params = params;
    }
    // Implementação dos métodos de recuperação de informações e geração de resposta usando o modelo NLP
    async retrieveVectorSearchResults(input: ChainState): Promise<ChainState> {
        this.params.debugLog("Iniciando busca vetorial para a pergunta:", input.question);
        const vectorResults = await this.params.vectorStore.
            similaritySearchWithScore(input.question, this.params.topk);

        // Verifica se não foram encontrados resultados
        if (!vectorResults.length) {
            this.params.debugLog("⚠️ Nenhum resultado encontrado para a pergunta:", input.question);
            return {
                ...input,
                error: "Nenhum resultado relevante encontrado para a pergunta."
            }
        }

        // Exibe o melhor score encontrado para a pergunta
        const topScore = vectorResults[0]![1];
        this.params.debugLog(`✅ Encontrados ${vectorResults.length} resultados relevantes para a pergunta: "${input.question}". Melhor Score: ${topScore.toFixed(3)}`);

        const contexts = vectorResults
            .filter(([, score]) => score >= topScore * 0.5) // Filtra resultados com score próximo ao melhor
            .map(([doc]) => doc.pageContent) // Extrai o conteúdo dos documentos
            .join("\n\n---\n\n");

        //console.log("Resultados da busca vetorial:", vectorResults);
        return {
            ...input,
            context: contexts,
            topScore,
        }
    }

    // Implementação do método de geração de resposta usando o modelo NLP
    async generateNLPResponse(input: ChainState): Promise<ChainState> {
        if (input.error) return input
        this.params.debugLog("🤖 Gerando resposta com IA...");

        const responsePrompt = ChatPromptTemplate.fromTemplate(
            this.params.templateText
        )
        // Exibe o prompt final que será enviado para o modelo NLP (útil para debug)
        const responseChain = responsePrompt
            .pipe(this.params.nlpModel)
            .pipe(new StringOutputParser())

        // Cria o objeto de entrada para o modelo NLP com base nas configurações e no contexto encontrado
        const rawResponse = await responseChain.invoke({
            role: this.params.promptConfig.role,
            task: this.params.promptConfig.task,
            tone: this.params.promptConfig.constraints.tone,
            language: this.params.promptConfig.constraints.language,
            format: this.params.promptConfig.constraints.format,
            instructions: this.params.promptConfig.instructions.map((instruction: string, idx: number) =>
                `${idx + 1}. ${instruction}`
            ).join('\n'),
            question: input.question,
            context: input.context
        })

        return {
            ...input,
            answer: rawResponse,
        }
    }

    // Método para processar a pergunta e gerar a resposta usando a cadeia de execução
    async answerQuestion(question: string) {
        // Cria a cadeia de execução combinando os métodos de recuperação e geração de resposta
        const chain = RunnableSequence.from([
            this.retrieveVectorSearchResults.bind(this),
            this.generateNLPResponse.bind(this)
        ])

        // Executa a cadeia de execução com a pergunta inicial e exibe os logs de debug para cada etapa
        const result = await chain.invoke({ question })
        this.params.debugLog("\n🎙️  Pergunta:");
        this.params.debugLog(question, "\n");
        this.params.debugLog("💬 Resposta:");
        this.params.debugLog(result.answer || result.error, "\n");

        return result

    }
}
