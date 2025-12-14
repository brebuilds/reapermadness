import { startMCPServer } from './mcp/server.js';
import { startHTTPServer } from './api/server.js';

// Detect if running as MCP (stdio) or HTTP server
const isMCP = process.argv.includes('--mcp') || !process.stdin.isTTY;

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
