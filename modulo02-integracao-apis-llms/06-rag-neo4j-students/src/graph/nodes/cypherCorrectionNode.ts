import {
  CypherCorrectionSchema,
  getSystemPrompt,
  getUserPromptTemplate,
} from '../../prompts/v1/cypherCorrection.ts';
import { Neo4jService } from '../../services/neo4jService.ts';
import { OpenRouterService } from '../../services/openrouterService.ts';
import type { GraphState } from '../graph.ts';

export function createCypherCorrectionNode(
  llmClient: OpenRouterService,
  neo4jService: Neo4jService,
) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    try {
      console.log('🔧 Auto-correcting Cypher query...');
      const schema = await neo4jService.getSchema();
      const systemPrompt = getSystemPrompt(schema);
      const userPrompt = getUserPromptTemplate(
        state.query!,
        state.validationError!,
        state.question,
      );

      const { data, error } = await llmClient.generateStructured(
        systemPrompt,
        userPrompt,
        CypherCorrectionSchema,
      );
      if (error) {
        return {
          ...state,
          error: `Query correction failed: ${error ?? 'Unknown error'}`,
        };
      }

      const correctedQuery =
        typeof data?.correctedQuery === 'string' ? data.correctedQuery.trim() : '';
      if (!correctedQuery || correctedQuery === state.query) {
        return {
          ...state,
          error: 'Query correction did not produce a valid replacement query',
          validationError: undefined,
          needsCorrection: false,
        };
      }

      console.log(`✅ Query corrected: ${data?.explanation}`);

      return {
        ...state,
        query: correctedQuery,
        originalQuery: state.originalQuery ?? state.query,
        validationError: undefined,
        needsCorrection: false,
      };
    } catch (error: any) {
      console.error('Error correcting query:', error.message);
      return {
        ...state,
        error: `Query correction failed: ${error.message}`,
      };
    }
  };
}
