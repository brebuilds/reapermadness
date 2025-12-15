# Reapermadness 🎛️

Your AI-powered REAPER assistant for live looping and music production.

## 🚀 Quick Start (Easiest Way)

### Step 1: Install Prerequisites
- [Node.js 18+](https://nodejs.org/) - Download and install
- [pnpm](https://pnpm.io/) - Run: `npm install -g pnpm`

### Step 2: Download & Run
```bash
git clone <repo-url>
cd reapermadness
pnpm install
pnpm dev
```

### Step 3: Open in Browser
Go to **http://localhost:5173**

### Step 4: Enable OSC in REAPER (one-time)
1. Open REAPER → Preferences (`Ctrl+P`)
2. Go to **Control/OSC/Web**
3. Click **Add**
4. Set **Mode: OSC (Open Sound Control)**
5. Set **Local listen port: 8000**
6. Click OK

**That's it!** Chat with Reapermadness, control your looper, and jam!

---

## 🖥️ Build Desktop App (Windows Installer)

Want a double-click installer? Build the Electron app:

```bash
# Install dependencies
pnpm install

# Build Windows installer
pnpm build:desktop:win
```

The installer will be in `packages/desktop/dist/`. Double-click to install Reapermadness like any Windows app!

---

## ✨ Features

### 💬 Chat with Reapermadness
Your personal REAPER expert! Ask anything:
- "How do I set up Super8 for live looping?"
- "What's the best foot controller?"
- "Help me fix latency"
- "What shortcuts should I know?"

### 🎮 Visual Looper Control
8-track Super8 dashboard with big buttons:
- Tap to record/play/overdub
- Stop All / Clear All
- Works on phone too!

### 🎚️ Transport Controls
- Play / Stop / Record
- Set tempo
- Toggle repeat

### 🌙 Performance Mode
Hit the expand button for a minimal, stage-friendly UI with giant buttons.

---

## 🎛️ MIDI Mappings (Super8)

| MIDI Note | Action |
|-----------|--------|
| C2 (36) | Track 1 |
| C#2 (37) | Track 2 |
| D2 (38) | Track 3 |
| D#2 (39) | Track 4 |
| E2 (40) | Track 5 |
| F2 (41) | Track 6 |
| F#2 (42) | Track 7 |
| G2 (43) | Track 8 |
| G#2 (44) | Stop All |
| A#2 (46) | Clear All |

---

## 📝 All Commands

```bash
# Development
pnpm dev              # Run everything (recommended)
pnpm dev:server       # Server only
pnpm dev:web          # Web UI only

# Build
pnpm build            # Build all
pnpm build:desktop:win # Build Windows installer

# Other
pnpm start            # Run server only (production)
pnpm start:mcp        # MCP mode for Claude Desktop
```

---

## 🔧 Troubleshooting

### Chat not working?
1. Make sure you see "HTTP mode" in terminal (not "MCP mode")
2. Clear browser localStorage: `localStorage.removeItem('reaper-assistant-settings')`
3. Refresh the page

### REAPER not responding?
1. Check OSC is enabled in REAPER Preferences → Control/OSC/Web
2. Make sure port is **8000**
3. Restart REAPER after enabling OSC

### Server won't start?
1. Make sure nothing else is using port 3001
2. Try: `pnpm install` again
3. Check Node.js is version 18+: `node --version`

---

## 🎸 Optional: Claude Desktop Integration

If you use Claude Desktop, you can also add Reapermadness as an MCP server:

```json
{
  "mcpServers": {
    "reaper": {
      "command": "node",
      "args": ["/path/to/reapermadness/packages/server/dist/index.js", "--mcp"]
    }
  }
}
```

This is optional - the web UI works standalone!

---

## 📄 License

MIT - Free to use and modify!

**Happy looping! 🎛️🎸**
