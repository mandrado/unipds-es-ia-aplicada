import type { Runtime } from '@langchain/langgraph';
import { AIMessage, HumanMessage } from 'langchain';
import { config } from '../../config.ts';
import {
  ChatResponseSchema,
  getSystemPrompt,
  getUserPromptTemplate,
} from '../../prompts/v1/chatResponse.ts';
import { OpenRouterService } from '../../services/openrouterService.ts';
import type { GraphState } from '../graph.ts';

export function createChatNode(llmClient: OpenRouterService) {
  return async (state: GraphState, runtime?: Runtime): Promise<Partial<GraphState>> => {
    const userContext = '';
    const systemPrompt = getSystemPrompt(userContext);

    const conversationHitory = state.messages
      .map((msg) => `${HumanMessage.isInstance(msg) ? 'User' : 'AI'}: ${msg.content}`)
      .join('\n');

    const userMessage = state.messages.at(-1)?.text as string;
    const userPrompt = getUserPromptTemplate(userMessage, conversationHitory);

    const result = await llmClient.generateStructured(systemPrompt, userPrompt, ChatResponseSchema);

    if (!result.success || !result.data) {
      console.error('🔴 Falha ao gerar resposta do LLM:', result.error);
      return {
        messages: [
          new AIMessage(
            'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.',
          ),
        ],
      };
    }

    const response = result.data;

    // Calcular se a conversa precisa de sumarização com base no número de mensagens
    // Depois de sumarizar, nos mantemos 2 mensagens, a última do usuário e a resposta do LLM, para manter o contexto.
    // Então nos mantemos apenas as últimas 2 mensagens do usuário e a última resposta do LLM.
    // Isso nos dá um total de 5 mensagens no estado após a sumarização, que é o limite definido em config.maxMessagesToSummary.

    const totalMessages = state.messages.length;
    const needsSummarization = totalMessages >= config.maxMessagesToSummary;

    return {
      messages: [new AIMessage(response.message)],
      extractedPreferences: response.shouldSavePreferences ? response.preferences : undefined,
      needsSummarization: false, // Inicialmente, não precisamos de sumarização após a resposta do LLM
    };
  };
}
