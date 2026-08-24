import assert from 'node:assert/strict';
import test from 'node:test';

import { buildSalesGraph } from '../src/graph/graph.ts';
import { createCypherExecutorNode } from '../src/graph/nodes/cypherExecutorNode.ts';
import { createCypherGeneratorNode } from '../src/graph/nodes/cypherGeneratorNode.ts';

const fakeNeo4jService = {
  validateQuery: async () => false,
  query: async () => [],
};

test('cypher executor increments correction attempts before retrying', async () => {
  const executor = createCypherExecutorNode(fakeNeo4jService as any);

  const result = await executor({
    question: 'Who bought Formação JavaScript Expert?',
    query: 'MATCH (n) RETURN n',
  });

  assert.equal(result.needsCorrection, true);
  assert.equal(result.correctionAttempts, 1);
  assert.equal(result.validationError, 'Query validation failed - syntax or structure error');
});

test('cypher executor blocks undefined query before calling Neo4j', async () => {
  const executor = createCypherExecutorNode({
    validateQuery: async () => {
      throw new Error('validateQuery should not be called for an empty query');
    },
    query: async () => [],
  } as any);

  const result = await executor({
    question: 'Who bought Formação JavaScript Expert?',
    query: undefined,
  });

  assert.equal(result.error, 'No Cypher query generated for this question');
  assert.equal(result.needsCorrection, false);
});

test('cypher generator rejects invalid LLM response shape', async () => {
  const generator = createCypherGeneratorNode(
    {
      generateStructured: async () => ({
        success: true,
        data: {},
      }),
    } as any,
    {
      getSchema: async () => 'schema',
    } as any,
  );

  const result = await generator({
    question: 'List all courses',
  });

  assert.equal(
    result.error,
    'LLM returned an invalid Cypher query format. Expected { "query": "..." }',
  );
});

test('analytical response node returns answer and followUpQuestions from LLM', async () => {
  const { createAnalyticalResponseNode } =
    await import('../src/graph/nodes/analyticalResponseNode.ts');

  const node = createAnalyticalResponseNode({
    generateStructured: async () => ({
      success: true,
      data: {
        answer: 'The top course is JavaScript Expert with 42% of purchases.',
        followUpQuestions: [
          'Which course has the highest revenue?',
          'What is the conversion rate?',
        ],
      },
    }),
  } as any);

  const result = await node({
    question: 'Which courses are commonly bought together?',
    query: 'MATCH (c:Course) RETURN c.name AS courseName',
    dbResults: [{ courseName: 'JavaScript Expert' }],
  });

  assert.equal(result.answer, 'The top course is JavaScript Expert with 42% of purchases.');
  assert.deepEqual(result.followUpQuestions, [
    'Which course has the highest revenue?',
    'What is the conversion rate?',
  ]);
});

test('graph stops at END when planner fails instead of recursing', async () => {
  let calls = 0;
  const graph = buildSalesGraph(
    {
      generateStructured: async () => {
        calls += 1;
        return {
          success: false,
          error: 'planner failed',
        };
      },
    } as any,
    {
      getSchema: async () => 'schema',
      validateQuery: async () => true,
      query: async () => [],
    } as any,
  );

  const result = await graph.invoke(
    {
      messages: [{ type: 'human', content: 'Which course sold the most?' }],
    },
    { recursionLimit: 20 },
  );

  assert.equal(calls, 1);
  assert.equal(result.error, 'planner failed');
});
