import { MultiServerMCPClient } from '@langchain/mcp-adapters';

export const getMCPTools = async () => {
  const mcpClient = new MultiServerMCPClient({
    // Criando um cliente MultiServerMCPClient com transporte de
    // filesystem para comunicação com o servidor MCP
    filesystem: {
      transport: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', process.cwd()],
    },
  });

  return mcpClient.getTools();
};
