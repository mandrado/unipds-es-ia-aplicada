import { RemoveMessage } from '@langchain/core/messages';
import { type Runtime } from '@langchain/langgraph';
import { HumanMessage } from 'langchain';
import {
  type ConversationSummary,
  getSummarizationSystemPrompt,
  getSummarizationUserPrompt,
  SummarySchema,
} from '../../prompts/v1/summarization.ts';
import { OpenRouterService } from '../../services/openrouterService.ts';
import { PreferencesService } from '../../services/preferencesService.ts';
import type { GraphState } from '../graph.ts';

// Esta função cria um nó de sumarização que é responsável por gerar um resumo da conversa atual usando o LLM e
// armazená-lo no serviço de preferências. O nó também remove mensagens antigas do estado para manter o
// contexto gerenciável.
export function createSummarizationNode(
  llmClient: OpenRouterService,
  preferencesService: PreferencesService,
) {
  return async (state: GraphState, runtime?: Runtime): Promise<Partial<GraphState>> => {
    const conversationHistory = state.messages.map((msg) => ({
      role: HumanMessage.isInstance(msg) ? 'User' : 'AI',
      content: msg.text,
    }));

    const previousSummary = state.conversationSummary as ConversationSummary | undefined;
    const systemPrompt = getSummarizationSystemPrompt();
    const userPrompt = getSummarizationUserPrompt(conversationHistory, previousSummary);

    const result = await llmClient.generateStructured(systemPrompt, userPrompt, SummarySchema);

    // Se houver um erro na geração do resumo, logamos o erro e retornamos sem alterar o estado.
    if (result.error || !result.data) {
      console.error('❌ Falha ao sumarizar conversa:', result.error);

      return {
        // Mantemos o estado atual sem alterações, mas indicamos que não precisamos de sumarização.
        needsSummarization: false,
      };
    }

    const userId = String(runtime?.context?.userId || state.userId || 'unknown');

    await preferencesService.storeSummary(userId, result.data);

    // Após armazenar o resumo, removemos as mensagens antigas do estado para manter o
    // contexto gerenciável.
    const deleteMessages = state.messages
      .slice(0, -2)
      .map((m) => new RemoveMessage({ id: m.id as string }));

    return {
      messages: deleteMessages,
      conversationSummary: result.data,
      needsSummarization: false,
    };
  };
}
