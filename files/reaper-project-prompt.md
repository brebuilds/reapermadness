# REAPER Knowledge Assistant - Full Build Prompt

## Project Overview

Build a comprehensive REAPER DAW assistant for a Linux user (Marc) who does live looping and jamband performances. This should be mind-blowing - not just a chatbot, but an actual REAPER control system.

## Architecture

```
┌─────────────────────────────────────────────────┐
│  React App (Vite + TypeScript + Tailwind)       │
│  - Chat interface (Anthropic API)               │
│  - Quick action buttons                         │
│  - Loop visualization                           │
│  - Performance mode (dark, touch-friendly)      │
│  - Settings panel                               │
└─────────────────────┬───────────────────────────┘
                      │ HTTP/WebSocket
┌─────────────────────▼───────────────────────────┐
│  Node.js Backend + MCP Server                   │
│  - Express API for React app                    │
│  - MCP server for Claude Desktop                │
│  - OSC connection to REAPER                     │
│  - Knowledge base queries                       │
│  - Script management                            │
└─────────────────────┬───────────────────────────┘
                      │ OSC (UDP)
┌─────────────────────▼───────────────────────────┐
│  REAPER (with OSC enabled)                      │
│  - Receives/sends OSC messages                  │
│  - Executes actions                             │
│  - Reports transport state                      │
└─────────────────────────────────────────────────┘
```

## Core Components to Build

### 1. Knowledge Base (JSON)

Create a comprehensive knowledge base including:

**REAPER Core:**
- Overview, pricing ($60/$225), philosophy
- All core features + v7 highlights
- File formats, project structure
- System requirements (Windows, macOS, **Linux focus**)

**Plugins:**
- All ReaPlugs with parameters (ReaEQ, ReaComp, ReaGate, ReaDelay, ReaVerb, ReaPitch, ReaLimit, ReaXcomp, ReaSynth, ReaSamplOmatic5000)
- JSFX categories and notable effects
- Super8 looper - FULL documentation including all MIDI mappings

**Extensions:**
- SWS/S&M Extension - features and key actions
- ReaPack - setup and popular repositories
- Playtime 2 - clip launcher features
- ReaLearn - MIDI/OSC mapping

**Actions Database:**
- Include the most important ~500 actions with:
  - Action ID/command ID
  - Default shortcut (if any)
  - Description
  - Category (transport, editing, navigation, recording, etc.)
- SWS extension actions (key ones)

**Live Looping (CRITICAL - Marc's main use case):**
- Super8 Looper complete guide
  - All 8 track controls
  - MIDI note mappings (C2-G2 for tracks, A2 stop all, A#2 clear all)
  - Sync modes
  - Overdub behavior
- Playtime 2 setup
- Mobius VST integration
- MSuperLooper
- Hardware recommendations:
  - MIDI foot controllers (FCB1010, Morningstar MC6/MC8, Boss ES-8)
  - Audio interfaces for low latency
  - Recommended buffer settings

**Linux-Specific:**
- JACK Audio setup and configuration
- PipeWire as JACK replacement
- yabridge for Windows VST plugins
- linvst alternative
- Linux troubleshooting
- Recommended distros (Ubuntu Studio, Fedora Jam, etc.)

**Workflows:**
- Podcast production
- Audiobook (ACX specs)
- Film/video scoring
- Live performance setup
- Recording band practice

**Shortcuts:**
- All essential shortcuts organized by category
- Custom action creation guide

**Troubleshooting:**
- Latency issues
- Audio dropouts  
- MIDI problems
- Plugin crashes
- Linux-specific issues (JACK xruns, etc.)

**Learning Resources:**
- Official docs
- YouTube channels (REAPER Mania, Kenny Gioia)
- Books
- Communities (forum, Reddit, Discord)

### 2. MCP Server (TypeScript)

Create an MCP server with these tools:

```typescript
// Knowledge tools
reaper_search(query: string) // Natural language search
reaper_get_overview()
reaper_get_pricing()
reaper_get_features()
reaper_get_plugin(name?: string)
reaper_get_extension(name?: string)
reaper_get_action(search: string) // Search actions by name/description
reaper_get_shortcut(category?: string)
reaper_get_live_looping()
reaper_get_linux_setup()
reaper_get_workflow(type: string)
reaper_get_troubleshooting(issue?: string)

// REAPER Control tools (via OSC)
reaper_transport_play()
reaper_transport_stop()
reaper_transport_record()
reaper_transport_toggle_repeat()
reaper_set_tempo(bpm: number)
reaper_trigger_action(actionId: number | string)
reaper_get_transport_state() // Returns play/stop/record state, position, tempo

// Super8 Looper control
reaper_loop_record_track(track: 1-8)
reaper_loop_play_track(track: 1-8)
reaper_loop_stop_track(track: 1-8)
reaper_loop_clear_track(track: 1-8)
reaper_loop_stop_all()
reaper_loop_clear_all()

// Project tools
reaper_create_track(name: string, withFX?: string[])
reaper_get_project_info()
```

**OSC Implementation:**
- Use `osc` npm package
- Default REAPER OSC port: 8000 (configurable)
- Send to localhost by default
- Handle bidirectional communication for state queries

### 3. React Frontend

**Tech Stack:**
- Vite + React + TypeScript
- Tailwind CSS
- Zustand for state management
- React Query for API calls

**Pages/Views:**

**Chat View:**
- Clean chat interface
- Message history
- Streaming responses
- Quick suggestion chips
- Code/JSON syntax highlighting in responses

**Quick Actions Panel:**
- Transport controls (Play, Stop, Record, Loop)
- Tempo control (tap tempo, BPM input)
- Track quick-add buttons
- Common action buttons (split, delete, undo, redo)

**Looper Dashboard:**
- Visual 8-track Super8 representation
- Per-track: Record/Play/Stop/Clear buttons
- Status indicators (recording, playing, empty)
- Global Stop All / Clear All
- Sync mode selector

**Performance Mode:**
- Full dark theme
- Extra large touch targets
- Minimal UI, maximum function
- Hide chat, show only controls
- Optionally fullscreen

**Settings:**
- OSC host/port configuration
- Anthropic API key input
- Theme selection
- REAPER connection test button

**Design:**
- Dark mode by default (stage-friendly)
- High contrast for visibility
- Touch-friendly button sizes (min 48px)
- Responsive (works on tablet for stage use)

### 4. Lua Scripts for REAPER

Create useful Lua scripts that can be installed via the app:

```lua
-- Create_Looping_Setup.lua
-- Creates a full Super8 looping template with:
-- - Input track with monitoring
-- - Super8 track with looper
-- - Master FX track with limiter
-- - Proper routing

-- Quick_Add_Track_With_Input.lua
-- Adds a new track with input monitoring enabled

-- Set_Buffer_For_Live.lua  
-- Optimizes buffer settings for live performance

-- Export_Stems.lua
-- Quick stem export for all tracks
```

### 5. REAPER Project Templates (.RPP)

Create these templates:

1. **Solo-Looper.RPP** - Single instrument into Super8
2. **Jamband-4Track.RPP** - 4 inputs (guitar, bass, keys, drums) each with loop capability  
3. **Podcast-2Person.RPP** - Two mic setup with processing
4. **Recording-Session.RPP** - Multi-track recording template

### 6. Setup & Documentation

**README.md:**
- Project overview
- Installation steps for Linux
- REAPER OSC setup instructions
- Claude Desktop MCP configuration
- Environment variables
- Troubleshooting

**REAPER-OSC-Setup.md:**
- Step-by-step OSC enable in REAPER
- Port configuration
- Testing connection
- Custom OSC patterns if needed

## File Structure

```
reaper-assistant/
├── packages/
│   ├── server/                    # Node.js backend + MCP
│   │   ├── src/
│   │   │   ├── index.ts          # Main entry
│   │   │   ├── mcp/              # MCP server implementation
│   │   │   │   ├── server.ts
│   │   │   │   └── tools/
│   │   │   │       ├── knowledge.ts
│   │   │   │       ├── osc-control.ts
│   │   │   │       └── looper.ts
│   │   │   ├── api/              # Express API for React
│   │   │   │   ├── routes.ts
│   │   │   │   └── handlers/
│   │   │   ├── osc/              # OSC client
│   │   │   │   └── reaper-client.ts
│   │   │   └── knowledge/        # Knowledge base
│   │   │       ├── data.json
│   │   │       └── search.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                       # React frontend
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── components/
│       │   │   ├── Chat/
│       │   │   ├── Looper/
│       │   │   ├── QuickActions/
│       │   │   └── Settings/
│       │   ├── hooks/
│       │   ├── stores/
│       │   └── api/
│       ├── package.json
│       ├── vite.config.ts
│       └── tailwind.config.js
│
├── templates/                     # REAPER project templates
│   ├── Solo-Looper.RPP
│   ├── Jamband-4Track.RPP
│   └── ...
│
├── scripts/                       # Lua scripts for REAPER
│   ├── Create_Looping_Setup.lua
│   └── ...
│
├── docs/
│   ├── REAPER-OSC-Setup.md
│   └── Linux-Audio-Setup.md
│
├── package.json                   # Workspace root
├── pnpm-workspace.yaml
└── README.md
```

## Key Implementation Details

### OSC Communication with REAPER

REAPER's default OSC patterns:
```
/action/{actionID}         # Trigger action
/tempo/raw                 # Set tempo (float)
/play                      # Play (1) / Stop (0)
/stop                      # Stop
/record                    # Toggle record
/repeat                    # Toggle repeat
/time                      # Transport position
/track/{N}/...            # Track controls
```

For Super8 (JSFX), you'll need to send MIDI via OSC or use actions:
- Super8 responds to MIDI notes, so triggering via `/vkb_midi/{channel}/{note}/{velocity}` or dedicated actions

### Claude API Integration

For the React chat:
```typescript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are a REAPER DAW expert assistant. You have access to a comprehensive knowledge base about REAPER features, plugins, live looping, and Linux audio setup. You can also control REAPER directly via OSC commands. Be helpful, practical, and give specific actionable advice. When the user asks how to do something, give them the exact steps, shortcuts, or actions needed.`,
    messages: conversationHistory
  })
});
```

### MCP Server Entry Point

The server should work both as:
1. MCP server (stdio transport) for Claude Desktop
2. HTTP server for the React app

```typescript
// Detect if running as MCP or HTTP
const isMCP = process.argv.includes('--mcp') || !process.stdin.isTTY;

if (isMCP) {
  startMCPServer();
} else {
  startHTTPServer();
}
```

## Success Criteria

Marc should be able to:

1. ✅ Ask "How do I set up Super8 for live looping?" and get a complete answer
2. ✅ Click a button and have REAPER start playing
3. ✅ See a visual looper interface and control all 8 tracks
4. ✅ Ask "What's the shortcut for splitting items?" and get "S"
5. ✅ Say "Set tempo to 95 BPM" and have REAPER change tempo
6. ✅ Get Linux-specific help for JACK/PipeWire setup
7. ✅ Use quick action buttons during a live performance
8. ✅ Install the MCP server in Claude Desktop for AI-powered control
9. ✅ Load pre-built templates for different scenarios
10. ✅ Have his mind completely blown 🤯

## Getting Started

1. Initialize the monorepo with pnpm workspaces
2. Build the knowledge base JSON first (this is the foundation)
3. Create the MCP server with knowledge tools
4. Add OSC integration and control tools
5. Build the React frontend
6. Add the looper dashboard
7. Create templates and scripts
8. Write documentation
9. Test everything together

Let's build something incredible! 🎛️🚀
