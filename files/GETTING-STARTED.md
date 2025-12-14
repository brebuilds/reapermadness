# Getting Started with Claude Code

## Initial Setup

Put these files in your project directory:
- `CLAUDE.md` (the context file)
- `reaper-project-prompt.md` (the full spec)
- `reaper-knowledge-package.zip` (reference material - unzip it)

## First Message to Claude Code

```
Read CLAUDE.md and reaper-project-prompt.md to understand the project.

Let's build the REAPER Knowledge Assistant. Start by:

1. Initialize the pnpm monorepo structure
2. Create the comprehensive knowledge base JSON (this is critical - make it thorough)
3. Then we'll build the MCP server

Focus on making the knowledge base incredibly comprehensive - include all the ReaPlugs, Super8 documentation, Linux audio setup, and the most important REAPER actions.
```

## Subsequent Prompts

After knowledge base is done:
```
Now build the MCP server with all the knowledge query tools. Make sure it works both as stdio MCP (for Claude Desktop) and as an HTTP server (for the React app).
```

After MCP server:
```
Add the OSC client for REAPER control. Implement transport controls, tempo, and action triggering. Include Super8 looper control.
```

After OSC:
```
Build the React frontend with:
1. Chat interface
2. Looper dashboard (8-track visual)
3. Quick action buttons
4. Settings page
5. Performance mode (minimal UI, big buttons)

Use Tailwind, make it dark mode, touch-friendly.
```

## Tips for Claude Code

1. **Let it iterate** - Don't try to build everything at once
2. **Test as you go** - Have REAPER open with OSC enabled
3. **Knowledge base is king** - Spend time making it comprehensive
4. **Use subagents** - Claude Code can spawn agents for parallel work if needed

## REAPER OSC Setup (Do This First!)

In REAPER:
1. Preferences → Control/OSC/Web
2. Add → OSC (Open Sound Control)
3. Mode: Configure device IP + local port
4. Device IP: 127.0.0.1
5. Device port: 9000 (where REAPER sends TO)
6. Local listen port: 8000 (where REAPER listens)
7. Check "Allow binding messages to REAPER actions"

Test with any OSC tool or the app once built.

## File Reference

The `reaper-knowledge-package.zip` contains:
- `knowledge-base/reaper-knowledge-base.json` - Starting point for knowledge
- `knowledge-base/reaper-knowledge-base.md` - Markdown version
- `mcp-server/` - Basic MCP server (expand this significantly)
- `streamlit-app/` - Ignore this, we're doing React
- `templates/` - REAPER project templates

Use these as reference but build fresh with the full architecture.
