import { AIMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { prompts } from '../../config.ts';
import type { GraphState } from '../state.ts';

export async function blockedNode(state: GraphState): Promise<Partial<GraphState>> {
  const guardRailCheck = state.guardrailCheck!;
  const analysis = guardRailCheck.analysis ? `**Analysis:** ${guardRailCheck.analysis}` : '';

  const permissions = state.user.permissions.join(', ') ?? 'None';
  const template = PromptTemplate.fromTemplate(prompts.blocked);
  const blockedMessage = await template.format({
    REASON: guardRailCheck.reason ?? 'Security check failed.',
    ANALYSIS: analysis,
    USER_ROLE: state.user.role,
    USER_NAME: state.user.displayName,
    PERMISSIONS: permissions,
  });

  return {
    messages: [new AIMessage(blockedMessage)],
  };
}
