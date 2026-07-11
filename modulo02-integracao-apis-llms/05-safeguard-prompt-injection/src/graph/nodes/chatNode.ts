import { AIMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { getUser, prompts } from '../../config.ts';
import { OpenRouterService } from '../../services/openrouterService.ts';
import type { GraphState } from '../state.ts';

export const createChatNode = (openRouterService: OpenRouterService) => {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    try {
      // Somente faça isso em caso não haja usuário no estado, para fins de teste.
      // Em produção, o usuário deve ser definido antes de chegar a este ponto.
      if (!state.user) {
        state.user = getUser('admin')!;
        state.guardrailsEnabled = true;
      }

      const userPrompt = state.messages.at(-1)?.text ?? '';
      const template = PromptTemplate.fromTemplate(prompts.system);
      // exemplo abaixo é mais inseguro!!
      // const systemPrompt = prompts.system
      //  .replace('{USER_ROLE}', state.user.role);
      //  .replace('{USER_NAME}', state.user.displayName);

      const systemPrompt = await template.format({
        USER_ROLE: state.user.role,
        USER_NAME: state.user.displayName,
      });

      const response = await openRouterService.generate(systemPrompt, userPrompt);

      return {
        messages: [new AIMessage(response)],
      };
    } catch (error) {
      console.error('Chat node error:', error);
      return {
        messages: [
          new AIMessage(
            'I apologize, but I encountered an error processing your request. Please try again later.',
          ),
        ],
      };
    }
  };
};
