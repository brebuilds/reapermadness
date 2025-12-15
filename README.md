# REAPER Knowledge Assistant 🎛️

A comprehensive REAPER DAW assistant for Linux users focused on live looping and performance. Features an MCP server for Claude Desktop, React web app with looper dashboard, and OSC control of REAPER.

## ✨ Features

- **Knowledge Base**: Comprehensive REAPER documentation with Super8 looper, Linux audio setup, actions, and troubleshooting
- **MCP Server**: 20+ tools for Claude Desktop integration
- **React Dashboard**: Visual 8-track looper control, transport, tempo
- **OSC Control**: Direct control of REAPER transport and looper
- **Performance Mode**: Stage-friendly dark UI with large touch targets
- **Linux Focus**: JACK, PipeWire, and yabridge setup guides

## 📁 Project Structure

```
reaper-assistant/
├── packages/
│   ├── server/           # MCP server + Express API + OSC client
│   │   └── src/
│   │       ├── mcp/      # MCP server implementation
│   │       ├── api/      # Express REST API
│   │       ├── osc/      # REAPER OSC client
│   │       └── knowledge/# Knowledge base + search
│   └── web/              # React frontend
│       └── src/
│           ├── components/
│           │   ├── Looper/    # Super8 dashboard
│           │   ├── Transport/ # Play/stop/record
│           │   └── Chat/      # Knowledge search
│           └── stores/   # Zustand state
├── templates/            # REAPER project files
├── scripts/              # Lua scripts for REAPER
├── docs/                 # Setup guides
└── knowledge-base/       # Standalone knowledge files
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- REAPER with OSC enabled

### Installation

```bash
# Clone and install
git clone <repo-url>
cd reaper-assistant
pnpm install

# Start development (both server and web)
pnpm dev
```

### Configure REAPER OSC

1. Open REAPER Preferences (`Ctrl+P`)
2. Go to **Control/OSC/Web**
3. Click **Add** → **OSC**
4. Configure:
   - Local listen port: `8000`
   - Device IP: `127.0.0.1`
   - Device port: `9000`
5. Click OK and restart REAPER

See [docs/REAPER-OSC-Setup.md](docs/REAPER-OSC-Setup.md) for detailed instructions.

### Open the Web App

Navigate to http://localhost:5173

- **Dashboard**: Control Super8 looper tracks and transport
- **Chat**: Search the knowledge base
- **Settings**: Configure OSC connection

## 🎮 Super8 Looper Control

The dashboard provides visual control of Super8's 8 tracks:

| Button | Action |
|--------|--------|
| Track 1-8 | Record/Play/Overdub |
| Stop All | Stop all tracks |
| Clear All | Clear all loops |

MIDI note mappings:
- **C2-G2**: Tracks 1-8
- **G#2**: Stop All
- **A#2**: Clear All

## 🔧 MCP Server for Claude Desktop

Install as an MCP server for Claude Desktop:

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

### Available Tools

**Knowledge Tools:**
- `reaper_search` - Natural language search
- `reaper_get_super8` - Super8 looper documentation
- `reaper_get_linux_setup` - JACK/PipeWire/yabridge guides
- `reaper_get_action` - Find actions by ID or name
- `reaper_get_shortcuts` - Keyboard shortcuts
- `reaper_get_troubleshooting` - Common issues

**Control Tools:**
- `reaper_play`, `reaper_stop`, `reaper_record`
- `reaper_set_tempo`
- `reaper_trigger_action`
- `reaper_loop_track`, `reaper_loop_stop_all`, `reaper_loop_clear_all`

## 🎸 Templates & Scripts

### REAPER Templates

- `Solo-Guitar-Looper.RPP` - Single instrument looping setup
- `Jamband-4Track.RPP` - 4 inputs with separate loopers
- `Podcast-2Person.RPP` - Two-person podcast template

### Lua Scripts

- `Create_Looping_Setup.lua` - Auto-create looping session
- `Set_Buffer_For_Live.lua` - Optimize for low latency
- `Quick_Add_Track_With_Input.lua` - Add monitored track
- `Export_Stems.lua` - Export all tracks as stems
- `Toggle_All_Track_Monitoring.lua` - Toggle monitoring

To install scripts: Copy to REAPER's Scripts folder and add to Actions list.

## 🐧 Linux Audio Setup

For best performance with live looping on Linux:

1. **Use JACK or PipeWire** (not plain PulseAudio)
2. **Set buffer to 128-256 samples**
3. **Configure realtime privileges**

See [docs/Linux-Audio-Setup.md](docs/Linux-Audio-Setup.md) for complete guide.

## 📝 Commands

```bash
# Development
pnpm dev              # Run both server and web
pnpm dev:server       # Server only
pnpm dev:web          # Web only

# Build
pnpm build            # Build all packages

# Production
pnpm start            # Start HTTP server
pnpm start:mcp        # Start MCP server (stdio)
```

## 🔌 Environment Variables

**Server** (`packages/server/.env`):
```env
PORT=3001
OSC_HOST=127.0.0.1
OSC_PORT=8000
OSC_LISTEN_PORT=9000
```

**Web** (`packages/web/.env.local`):
```env
VITE_API_URL=http://localhost:3001
VITE_ANTHROPIC_API_KEY=  # Optional, for Claude chat
```

## 🎯 Use Cases

- **Live Looping Performance**: Control Super8 from web dashboard or foot controller via MIDI
- **Learning REAPER**: Ask natural language questions about features, shortcuts, workflows
- **Linux Audio Help**: Get help with JACK, PipeWire, and yabridge setup
- **Session Setup**: Use templates and scripts to quickly create projects
- **AI-Powered Control**: Use MCP server with Claude Desktop for voice/chat control

## 📚 Documentation

- [REAPER OSC Setup](docs/REAPER-OSC-Setup.md)
- [Linux Audio Setup](docs/Linux-Audio-Setup.md)

## 🙏 Credits

- Built for Marc and Linux live loopers everywhere
- Knowledge compiled from reaper.fm and community resources
- REAPER is developed by Cockos Incorporated

## 📄 License

MIT License - Free to use, modify, and share!

---

**Happy looping! 🎛️🎸**
