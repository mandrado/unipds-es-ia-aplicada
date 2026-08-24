import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import type { z } from 'zod/v3';
import { config } from '../config.ts';

export type LLMResponse = {
  model: string;
  content: string;
};

export class OpenRouterService {
  private llmClient: ChatOpenAI;

  constructor() {
    this.llmClient = new ChatOpenAI({
      apiKey: config.apiKey,
      modelName: config.models[0],
      temperature: config.temperature,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': config.httpReferer,
          'X-Title': config.xTitle,
        },
      },
      modelKwargs: {
        models: config.models,
        provider: config.provider,
      },
    });
  }

  async generateStructured<T>(systemPrompt: string, userPrompt: string, schema: z.ZodSchema<T>) {
    try {
      const structuredModel = this.llmClient.withStructuredOutput(schema, {
        name: 'structured_response',
      });

      const messages = [new SystemMessage(systemPrompt), new HumanMessage(userPrompt)];

      const response = await structuredModel.invoke(messages);
      const directPayload = (response as any)?.parsed ?? (response as any)?.structured ?? response;
      const payload = typeof directPayload === 'string' ? JSON.parse(directPayload) : directPayload;

      if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        return {
          success: true,
          data: payload as T,
        };
      }

      return {
        success: false,
        error: 'LLM structured output was empty or malformed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
