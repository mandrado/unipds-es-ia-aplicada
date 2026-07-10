import type { BaseMessage } from '@langchain/core/messages';
import { MessagesZodMeta } from '@langchain/langgraph';
import { withLangGraph } from '@langchain/langgraph/zod';
import { z } from 'zod/v3';
import { type User } from '../config.ts';
import type { GuardrailResult } from '../services/openrouterService.ts';

export const SafeguardStateAnnotation = z.object({
  messages: withLangGraph(z.custom<BaseMessage[]>(), MessagesZodMeta),

  user: z.custom<User>(),

  guardrailCheck: z.custom<GuardrailResult | null>().nullable().default(null),
  guardrailsEnabled: z.boolean(),
});

export type GraphState = z.infer<typeof SafeguardStateAnnotation>;
