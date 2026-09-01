import { END, START, StateGraph } from '@langchain/langgraph';
import { OpenRouterService } from '../services/openRouterService.ts';
import { createResearcherNode } from './nodes/researcherNode.ts';
import { createResponderNode } from './nodes/responderNode.ts';
import { GraphAnnotation } from './state.ts';

export function buildTrendsGraph(openRouterService: OpenRouterService) {
  return new StateGraph(GraphAnnotation)
    .addNode('researcher', createResearcherNode(openRouterService))
    .addNode('responder', createResponderNode(openRouterService))

    .addEdge(START, 'researcher')
    .addEdge('researcher', 'responder')
    .addEdge('responder', END)

    .compile();
}
