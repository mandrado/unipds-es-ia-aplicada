import { config } from '../config.ts';
import { createMemoryService } from '../services/memoryService.ts';
import { OpenRouterService } from '../services/openrouterService.ts';
import { PreferencesService } from '../services/preferencesService.ts';
import { buildChatGraph } from './graph.ts';

export async function buildGraph(dbPath: string = './preferences.db') {
  const llmClient = new OpenRouterService(config);

  // Utiliando Postgres para armazenamento de memória
  const memoryService = await createMemoryService();
  // Utilizando SQLite para armazenamento de preferências
  const preferencesService = new PreferencesService(dbPath);

  const graph = buildChatGraph(llmClient, preferencesService, memoryService);

  return {
    graph,
    preferencesService,
  };
}

export const graph = async () => buildGraph();
export default graph;
