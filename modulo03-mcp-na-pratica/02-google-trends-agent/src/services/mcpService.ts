import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { config } from '../config.ts';
import { createGoogleTrendsTool } from '../tools/googleTrendsTool.ts';
import { SerpAPIService } from './serpApiService.ts';

export const getMCPTools = async () => {
  const mcpClient = new MultiServerMCPClient({
    filesystem: {
      transport: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', process.cwd()],
    },
  });

  const mcpTools = await mcpClient.getTools();

  const serpAPIService = new SerpAPIService(config.serpAPIConfig);
  const googleTrendsTool = createGoogleTrendsTool(serpAPIService);

  return [...mcpTools, googleTrendsTool];
};
