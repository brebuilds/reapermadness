# CLAUDE.md - REAPER Knowledge Assistant

## Project Overview

Building a comprehensive REAPER DAW assistant for Linux users focused on live looping and performance. This is a monorepo with an MCP server, React frontend, and REAPER integration via OSC.

## Tech Stack

- **Monorepo**: pnpm workspaces
- **Server**: Node.js + TypeScript + Express
- **MCP**: @modelcontextprotocol/sdk
- **OSC**: osc (npm package) for REAPER communication
- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **State**: Zustand
- **API Calls**: React Query / TanStack Query

## Project Structure

```
reaper-assistant/
├── packages/
│   ├── server/          # MCP server + Express API + OSC client
│   └── web/             # React frontend
├── templates/           # REAPER .RPP project files
├── scripts/            # Lua scripts for REAPER
├── docs/               # Setup documentation
├── package.json        # Workspace root
├── pnpm-workspace.yaml
└── CLAUDE.md
```

## Build Order

1. **Knowledge Base First** - Create comprehensive JSON data (`packages/server/src/knowledge/data.json`)
2. **MCP Server** - Implement tools that query knowledge base
3. **OSC Client** - Add REAPER control via OSC
4. **Express API** - HTTP endpoints for React app
5. **React Frontend** - Chat + Looper dashboard + Quick actions
6. **Templates & Scripts** - REAPER project files and Lua scripts
7. **Documentation** - Setup guides

## Key Implementation Notes

### MCP Server
- Must work in two modes: stdio (for Claude Desktop) and HTTP (for React app)
- Use `@modelcontextprotocol/sdk` for MCP implementation
- Tools should be modular: knowledge tools, control tools, looper tools

### OSC Communication
REAPER default OSC port: 8000
```
/action/{id}      - Trigger action by ID
/play             - Play (value 1) / Stop (value 0)  
/stop             - Stop
/record           - Toggle record
/repeat           - Toggle repeat
/tempo/raw        - Set tempo (float BPM)
```

Super8 looper responds to MIDI notes - may need `/vkb_midi/` OSC messages or action triggers.

### React App
- Dark mode default (stage use)
- Touch-friendly (min 48px tap targets)
- Performance mode = minimal UI, big buttons, no chat
- Settings page for OSC host/port and API key

### Knowledge Base Must Include
- All ReaPlugs with parameters
- Super8 looper FULL documentation (MIDI mappings C2-G2)
- Linux audio setup (JACK, PipeWire, yabridge)
- ~500 most important actions with IDs and shortcuts
- SWS extension features
- Live looping workflows
- Troubleshooting guides

## Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev              # Run both server and web
pnpm dev:server       # Server only
pnpm dev:web          # Frontend only

# Build
pnpm build

# Run MCP server (for Claude Desktop)
node packages/server/dist/index.js --mcp

# Run HTTP server (for React app)
node packages/server/dist/index.js
```

## Environment Variables

```env
# Server
PORT=3001
OSC_HOST=127.0.0.1
OSC_PORT=8000
OSC_LISTEN_PORT=9000

# Web (in .env.local)
VITE_API_URL=http://localhost:3001
VITE_ANTHROPIC_API_KEY=  # User provides their own
```

## Claude Desktop MCP Config

```json
{
  "mcpServers": {
    "reaper": {
      "command": "node",
      "args": ["/path/to/reaper-assistant/packages/server/dist/index.js", "--mcp"]
    }
  }
}
```

## Testing Checklist

- [ ] Knowledge search returns relevant results
- [ ] MCP tools work in Claude Desktop
- [ ] OSC connects to REAPER
- [ ] Transport controls work (play/stop/record)
- [ ] Tempo changes work
- [ ] React app loads and displays chat
- [ ] Looper dashboard shows 8 tracks
- [ ] Quick action buttons trigger OSC
- [ ] Settings save and persist
- [ ] Performance mode hides UI correctly

## User Context

This is for **Marc**, a Linux user who:
- Does live looping and jamband performances
- Needs hands-free / foot controller operation
- Uses Super8 looper in REAPER
- Wants to ask "how do I do X?" and get instant answers
- Needs stage-friendly dark UI with big buttons
- Runs JACK or PipeWire for audio

## Success = Mind Blown 🤯

Marc should be able to:
1. Ask natural language questions about REAPER
2. Control REAPER transport from the app
3. See and control all 8 Super8 looper tracks visually
4. Get Linux-specific audio setup help
5. Use it during live performance with minimal UI
6. Install as MCP server in Claude Desktop
