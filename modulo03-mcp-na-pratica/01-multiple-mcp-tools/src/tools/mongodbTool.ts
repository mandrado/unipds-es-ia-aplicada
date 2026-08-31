// https://github.com/mongodb-js/mongodb-mcp-server
console.assert(
  process.env.MDB_MCP_CONNECTION_STRING,
  'MDB_MCP_CONNECTION_STRING is not set in environment variables',
);

export const getMongoDBTool = () => {
  return {
    // https://github.com/mongodb-js/mongodb-mcp-server
    MongoDB: {
      transport: 'stdio' as const,

      command: 'npx',
      args: ['-y', 'mongodb-mcp-server@latest'],
      env: {
        MDB_MCP_CONNECTION_STRING: process.env.MDB_MCP_CONNECTION_STRING!,
      },
    },
  };
};
