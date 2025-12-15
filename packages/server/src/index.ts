import { startMCPServer } from './mcp/server.js';
import { startHTTPServer } from './api/server.js';

// Only run MCP mode if explicitly requested with --mcp flag
const isMCP = process.argv.includes('--mcp');

async function main() {
  if (isMCP) {
    console.error('Starting REAPER Assistant in MCP mode...');
    await startMCPServer();
  } else {
    console.log('Starting REAPER Assistant in HTTP mode...');
    await startHTTPServer();
  }
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
