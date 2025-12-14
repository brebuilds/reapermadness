# REAPER Knowledge Package 📦

A comprehensive knowledge base and tools for learning and using REAPER DAW, optimized for AI assistants and chatbots.

## 📁 What's Included

```
reaper-knowledge-package/
├── knowledge-base/
│   ├── reaper-knowledge-base.json    # Structured data (for RAG/embedding)
│   └── reaper-knowledge-base.md      # Human-readable (for Claude Projects)
├── mcp-server/                        # MCP Server for Claude Desktop
│   ├── src/index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── data/reaper-knowledge-base.json
├── streamlit-app/                     # Web chat interface
│   ├── streamlit_app.py
│   ├── requirements.txt
│   └── data/reaper-knowledge-base.json
├── templates/                         # REAPER project templates
│   └── Solo-Guitar-Looper.RPP
└── README.md
```

## 🚀 Quick Start Options

### Option A: Claude Project (Easiest!)
1. Go to [claude.ai](https://claude.ai)
2. Create a new Project
3. Upload `knowledge-base/reaper-knowledge-base.md`
4. Add this Project Instruction:
   ```
   You are a REAPER DAW expert assistant. Use the uploaded knowledge base 
   to answer questions about REAPER features, plugins, extensions, live 
   looping, shortcuts, and workflows. Be helpful, accurate, and provide 
   practical guidance.
   ```
5. Start chatting!

### Option B: MCP Server (Claude Desktop)
```bash
cd mcp-server
npm install
npm run build
```

Add to Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "reaper": {
      "command": "node",
      "args": ["/path/to/reaper-knowledge-package/mcp-server/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop. Now you have 14 specialized REAPER tools!

### Option C: Streamlit Chat Interface
```bash
cd streamlit-app
pip install -r requirements.txt
streamlit run streamlit_app.py
```

Opens a beautiful web chat interface at `http://localhost:8501`

## 🛠️ MCP Server Tools

The MCP server provides these tools:

| Tool | Description |
|------|-------------|
| `reaper_search` | Natural language search across all knowledge |
| `reaper_get_overview` | What is REAPER, platforms, use cases |
| `reaper_get_pricing` | Licensing and pricing info |
| `reaper_get_features` | Core features and v7 highlights |
| `reaper_get_plugin_info` | Built-in plugins (ReaPlugs, JSFX) |
| `reaper_get_extension_info` | Extensions (SWS, ReaPack, Playtime, ReaLearn) |
| `reaper_get_scripting_info` | ReaScript capabilities |
| `reaper_get_theme_info` | Themes and customization |
| `reaper_get_shortcuts` | Keyboard shortcuts by category |
| `reaper_get_live_looping` | Live looping setups and tips |
| `reaper_get_workflow_info` | Podcast, audiobook, film workflows |
| `reaper_get_learning_resources` | Tutorials and documentation |
| `reaper_get_system_requirements` | Requirements by platform |
| `reaper_get_troubleshooting` | Common issues and solutions |

## 📚 Knowledge Base Contents

### Topics Covered
- **Overview**: What REAPER is, philosophy, platforms
- **Pricing**: $60/$225 licensing, trial info
- **Features**: Core features, v7 highlights, routing
- **Plugins**: All ReaPlugs (ReaEQ, ReaComp, etc.) + JSFX
- **Extensions**: SWS, ReaPack, Playtime 2, ReaLearn
- **Scripting**: Lua, EEL2, Python capabilities
- **Themes**: Popular themes and customization
- **Shortcuts**: 700+ keyboard shortcuts
- **Live Looping**: Super8, Playtime, Mobius, hardware
- **Workflows**: Podcast, audiobook, film/video
- **System Requirements**: Windows, macOS, Linux
- **Troubleshooting**: Common issues and fixes
- **Learning Resources**: Tutorials, books, communities

## 🎸 Live Looping Focus

Special attention to live performance:

- **Super8 Looper**: Built-in 8-track looper with MIDI mapping
- **Playtime 2**: Ableton-style clip launching
- **Hardware**: Foot controller recommendations
- **Templates**: Ready-to-use looping setups
- **Performance Tips**: Latency optimization, workflow

## 🎹 REAPER Templates

The `templates/` folder includes ready-to-use REAPER projects:

- **Solo-Guitar-Looper.RPP**: Guitar input → Super8 → Master FX

To use: Open in REAPER (File > Open Project)

## 📝 Example Queries

Try asking:
- "What does REAPER cost?"
- "How do I set up Super8 for live looping?"
- "What keyboard shortcut splits items?"
- "Tell me about the SWS extension"
- "How do I set up for podcast editing?"
- "What are the system requirements for Mac?"
- "Help with audio latency issues"

## 🔧 Customization

### Adding Knowledge
Edit `reaper-knowledge-base.json` to add:
- New plugins
- Custom workflows
- Additional shortcuts
- Community scripts

### Extending the MCP Server
Add new tools in `mcp-server/src/index.ts`:
1. Add tool definition to `tools` array
2. Add handler in `switch` statement
3. Rebuild: `npm run build`

## 📄 License

MIT License - Free to use, modify, and share!

## 🙏 Credits

- Knowledge compiled from [reaper.fm](https://reaper.fm) and community resources
- Built by Bre & Claude
- REAPER is developed by Cockos Incorporated

---

**Happy REAPER-ing! 🎛️**
