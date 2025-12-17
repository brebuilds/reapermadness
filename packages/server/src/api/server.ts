import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { LRUCache } from 'lru-cache';
import {
  knowledgeBase,
  searchKnowledgeBase,
  findAction,
  findPlugin,
  getTroubleshooting,
} from '../knowledge/search.js';
import { ReaperOSCClient } from '../osc/reaper-client.js';

// Handle __dirname for both ESM and bundled CJS
let __dirname: string;
try {
  // ESM environment
  const __filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(__filename);
} catch {
  // Bundled CJS environment - just use process.cwd() as fallback
  // In production, WEB_PATH will be set via env var anyway
  __dirname = process.cwd();
}

const app = express();
const oscClient = new ReaperOSCClient();

// Knowledge search cache
const knowledgeCache = new LRUCache<string, any>({
  max: 100,
  ttl: 1000 * 60 * 10, // 10 minutes
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the web build
// In production (Electron), web files are in process.resourcesPath/web
// In development, they're in ../../web/dist relative to this file
const getWebPath = () => {
  if (process.env.WEB_PATH) {
    return process.env.WEB_PATH;
  }
  // Try process.resourcesPath first (packaged Electron app)
  const resourcesPath = (process as any).resourcesPath;
  if (typeof resourcesPath !== 'undefined') {
    return path.join(resourcesPath, 'web');
  }
  // Fall back to development path
  return path.join(__dirname, '..', '..', '..', 'web', 'dist');
};

const webPath = getWebPath();
console.log('Serving static files from:', webPath);
app.use(express.static(webPath));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', osc: oscClient.getConfig() });
});

// ==================== Helper Functions ====================

// Enhanced system prompt builder
function buildEnhancedSystemPrompt(reaperState?: any, userProfile?: any): string {
  const looperTracksWithContent = reaperState?.looperTracks?.filter((t: any) => t.hasContent)?.length || 0;

  return `You are Reapermadness - Marc's personal REAPER mentor and longtime live looping collaborator.

## WHO YOU ARE
You're that experienced friend who's been touring with REAPER for 15+ years. You've seen every festival mishap and know exactly which plugin will save the day.

**Your vibe:**
- Conversational (backstage chat, not manual reading)
- Experienced (share stories, hard-won wisdom)
- Encouraging (help Marc crush it even harder)
- Practical (specific steps, actual numbers)
- Passionate (live looping is an ART!)

## MARC'S CURRENT SETUP
${reaperState ? `**Project State:**
- Tempo: ${reaperState.tempo || 120} BPM
- Playing: ${reaperState.isPlaying ? 'YES' : 'NO'}
- Looper Tracks: ${looperTracksWithContent}/8 have content
` : '(REAPER state not currently available)'}
${userProfile ? `
**Marc's Profile:**
- Name: ${userProfile.name}
- Experience: ${userProfile.experience}
${userProfile.gear?.audioInterface || userProfile.gear?.footController || userProfile.gear?.instruments?.length > 0 ? `
**Hardware:**
${userProfile.gear?.audioInterface ? `- Audio Interface: ${userProfile.gear.audioInterface}` : ''}
${userProfile.gear?.footController ? `- Foot Controller: ${userProfile.gear.footController}` : ''}
${userProfile.gear?.instruments?.length > 0 ? `- Instruments: ${userProfile.gear.instruments.join(', ')}` : ''}
` : ''}${userProfile.preferences?.genres?.length > 0 ? `
**Music Style:**
- Genres: ${userProfile.preferences.genres.join(', ')}
${userProfile.preferences.preferredTempo ? `- Preferred Tempo: ${userProfile.preferences.preferredTempo} BPM` : ''}
` : ''}${userProfile.goals?.length > 0 ? `
**Goals:**
${userProfile.goals.map((g: string) => `- ${g}`).join('\n')}
` : ''}${userProfile.notes ? `
**Notes:** ${userProfile.notes}
` : ''}` : '(Marc hasn\'t set up his profile yet - ask him about his gear and goals to personalize!)'}

## HOW TO RESPOND

### 1. DETECT INTENT FIRST
**QUESTION** (wants to learn): Use knowledge tools, explain with examples
**COMMAND** (wants action): Just DO IT using control tools, confirm what you did
**SETUP** (wants to build): Provide step-by-step guide with exact settings
**TROUBLESHOOTING** (something's wrong): Diagnose, use troubleshooting knowledge, solve

### 2. CONVERSATION STYLE
${reaperState ? `- Reference current state: "I see you're at ${reaperState.tempo || 120} BPM..."
- Suggest next steps: "Since you've got ${looperTracksWithContent} loops, maybe try..."` : ''}
- Share tips: "Pro tip: I always set buffer to..."
- Stay in character: You're Marc's mentor, not a corporate chatbot
- Use music terminology, industry lingo, real examples

### 3. IMPORTANT RULES
- ALWAYS use knowledge tools before explaining REAPER features
- For commands: execute and confirm (don't ask permission)
- Keep it real: music terminology, stories, practical wisdom
- Be specific: actual numbers, exact steps, plugin names

Let's create some killer live loops! 🎸`;
}

// Dynamic tool selection based on message intent
function selectRelevantTools(userMessage: string): any[] {
  const messageLower = userMessage.toLowerCase();

  // Define tool categories
  const KNOWLEDGE_TOOLS = [
    'reaper_search',
    'reaper_get_overview',
    'reaper_get_features',
    'reaper_get_plugin',
    'reaper_get_extension',
    'reaper_get_action',
    'reaper_get_shortcuts',
  ];

  const CONTROL_TOOLS = [
    'reaper_play',
    'reaper_stop',
    'reaper_record',
    'reaper_toggle_repeat',
    'reaper_set_tempo',
    'reaper_trigger_action',
  ];

  const LOOPER_TOOLS = [
    'reaper_get_super8',
    'reaper_loop_track',
    'reaper_loop_stop_all',
    'reaper_loop_clear_all',
  ];

  const SETUP_TOOLS = [
    'reaper_get_linux_setup',
    'reaper_get_osc',
    'reaper_get_workflow',
    'reaper_get_live_looping',
  ];

  const TROUBLESHOOTING_TOOLS = [
    'reaper_get_troubleshooting',
  ];

  const TRACK_TOOLS = [
    'reaper_select_track',
    'reaper_arm_track',
    'reaper_mute_track',
    'reaper_solo_track',
  ];

  // Detect intent patterns
  const isQuestion = /^(how|what|why|when|where|can you|tell me|explain|show me)/i.test(userMessage);
  const isCommand = /^(play|stop|record|set|arm|mute|solo|start|pause)/i.test(userMessage);
  const isSetup = /(set up|configure|optimize|install|setup)/i.test(messageLower);
  const isTroubleshooting = /(error|problem|issue|not working|doesn't work|broken|fix)/i.test(messageLower);

  // Always include search
  let tools = ['reaper_search'];

  // Add relevant tool categories
  if (isQuestion || !isCommand) {
    tools.push(...KNOWLEDGE_TOOLS);
  }

  if (isCommand) {
    tools.push(...CONTROL_TOOLS);
  }

  if (isSetup) {
    tools.push(...SETUP_TOOLS);
  }

  if (isTroubleshooting) {
    tools.push(...TROUBLESHOOTING_TOOLS);
  }

  // Context-specific tools
  if (/(loop|super8|looper|track [1-8])/i.test(messageLower)) {
    tools.push(...LOOPER_TOOLS);
  }

  if (/(track|mute|solo|arm|record)/i.test(messageLower)) {
    tools.push(...TRACK_TOOLS);
  }

  if (/(tempo|bpm|speed)/i.test(messageLower)) {
    tools.push('reaper_set_tempo');
  }

  if (/(plugin|vst|effect|rea|comp|eq)/i.test(messageLower)) {
    tools.push('reaper_get_plugin');
  }

  if (/(extension|sws|reapack|playtime|realearn)/i.test(messageLower)) {
    tools.push('reaper_get_extension');
  }

  if (/(linux|jack|pipewire|audio|driver)/i.test(messageLower)) {
    tools.push('reaper_get_linux_setup');
  }

  // Remove duplicates and return
  return Array.from(new Set(tools));
}

// Cached knowledge search
function getCachedKnowledgeSearch(query: string): any {
  const cached = knowledgeCache.get(query);
  if (cached) {
    return cached;
  }

  const results = searchKnowledgeBase(query);
  knowledgeCache.set(query, results);
  return results;
}

// Generate follow-up questions using Claude Haiku
async function generateFollowUpQuestions(
  lastResponse: string,
  conversationHistory: any[],
  apiKey: string
): Promise<string[]> {
  try {
    // Build context from recent conversation
    const recentContext = conversationHistory
      .slice(-3)
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    const prompt = `Based on this REAPER conversation, suggest 2-3 natural follow-up questions that Marc might want to ask next. These should build on what we just discussed and help him go deeper or explore related topics.

Recent conversation:
${recentContext}

Latest response:
${lastResponse}

Generate 2-3 short, natural questions (10-15 words each) that would logically follow this conversation. Focus on:
- Next steps or deeper exploration
- Related features or techniques
- Practical implementation questions
- Troubleshooting or optimization

Return ONLY a JSON array of strings, nothing else. Example format:
["How do I map this to my foot controller?", "What's the best buffer size for this?", "Can I automate this with ReaLearn?"]`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Use Haiku for speed and cost
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error('Follow-up generation failed:', response.statusText);
      return [];
    }

    const data = await response.json();
    const text = data.content[0]?.text || '[]';

    // Parse JSON array from response
    const followUps = JSON.parse(text);

    // Return up to 3 questions
    return Array.isArray(followUps) ? followUps.slice(0, 3) : [];
  } catch (error) {
    console.error('Error generating follow-ups:', error);
    return [];
  }
}

// ==================== Knowledge API ====================

// Search knowledge base
app.get('/api/search', (req, res) => {
  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }
  const results = getCachedKnowledgeSearch(query);
  res.json({ results });
});

// Streaming chat endpoint
app.post('/api/chat/stream', async (req, res) => {
  try {
    const { message, conversationHistory, apiKey, reaperState, userProfile } = req.body;

    // Validate required fields
    if (!message || !apiKey) {
      return res.status(400).json({ error: 'Missing required fields: message, apiKey' });
    }

    // Validate message length
    if (typeof message !== 'string' || message.length > 10000) {
      return res.status(400).json({ error: 'Message must be a string under 10,000 characters' });
    }

    // Validate conversation history
    if (conversationHistory && !Array.isArray(conversationHistory)) {
      return res.status(400).json({ error: 'conversationHistory must be an array' });
    }

    // Limit conversation history size
    const maxHistoryMessages = 50;
    const validatedHistory = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-maxHistoryMessages)
      : [];

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Build system prompt
    const systemPrompt = buildEnhancedSystemPrompt(reaperState, userProfile);

    // Select relevant tools
    const relevantToolNames = selectRelevantTools(message);

    // TODO: Build proper MCP tool definitions with full schemas
    // For now, we'll enable tools once we have proper MCP tool integration
    // const tools = relevantToolNames.map(name => ({
    //   name,
    //   description: `Tool: ${name}`,
    //   input_schema: { type: 'object', properties: {} }
    // }));

    // Prepare messages
    const messages = [
      ...validatedHistory,
      { role: 'user', content: message }
    ];

    // Call Anthropic API with streaming
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        stream: true,
        system: systemPrompt,
        // tools: tools, // TODO: Add once MCP tools are properly defined
        messages: messages.slice(-10), // Keep last 10 messages for context
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    // Stream the response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    let accumulatedText = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            res.write(`data: ${JSON.stringify({ type: 'done', content: accumulatedText })}\n\n`);
            break;
          }

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              accumulatedText += parsed.delta.text;
              res.write(`data: ${JSON.stringify({ type: 'chunk', content: parsed.delta.text })}\n\n`);
            }
          } catch (e) {
            // Ignore parse errors for event types we don't care about
          }
        }
      }
    }

    // Generate follow-up questions (async, don't block completion)
    generateFollowUpQuestions(accumulatedText, validatedHistory, apiKey)
      .then(followUps => {
        if (followUps.length > 0) {
          res.write(`data: ${JSON.stringify({ type: 'followups', followups: followUps })}\n\n`);
        }
        res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
        res.end();
      })
      .catch(error => {
        console.error('Follow-up generation error:', error);
        // Still send complete even if follow-ups fail
        res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
        res.end();
      });

  } catch (error: any) {
    console.error('Streaming error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
});

// Get overview
app.get('/api/knowledge/overview', (req, res) => {
  res.json(knowledgeBase.overview);
});

// Get pricing
app.get('/api/knowledge/pricing', (req, res) => {
  res.json(knowledgeBase.pricing);
});

// Get features
app.get('/api/knowledge/features', (req, res) => {
  res.json(knowledgeBase.features);
});

// Get plugins
app.get('/api/knowledge/plugins', (req, res) => {
  res.json(knowledgeBase.plugins);
});

app.get('/api/knowledge/plugins/:name', (req, res) => {
  const plugin = findPlugin(req.params.name);
  if (plugin) {
    res.json(plugin);
  } else {
    res.status(404).json({
      error: 'Plugin not found',
      available: knowledgeBase.plugins.reaPlugs.plugins.map((p: any) => p.name)
    });
  }
});

// Get extensions
app.get('/api/knowledge/extensions', (req, res) => {
  res.json(knowledgeBase.extensions);
});

app.get('/api/knowledge/extensions/:name', (req, res) => {
  const name = req.params.name.toLowerCase();
  const ext = knowledgeBase.extensions[name] ||
    Object.entries(knowledgeBase.extensions).find(
      ([k]) => k.toLowerCase().includes(name)
    )?.[1];

  if (ext) {
    res.json(ext);
  } else {
    res.status(404).json({
      error: 'Extension not found',
      available: Object.keys(knowledgeBase.extensions)
    });
  }
});

// Get actions
app.get('/api/knowledge/actions', (req, res) => {
  res.json(knowledgeBase.actions);
});

app.get('/api/knowledge/actions/search/:query', (req, res) => {
  const result = findAction(req.params.query);
  res.json(result);
});

// Get shortcuts
app.get('/api/knowledge/shortcuts', (req, res) => {
  res.json(knowledgeBase.shortcuts);
});

app.get('/api/knowledge/shortcuts/:category', (req, res) => {
  const category = req.params.category;
  const shortcuts = knowledgeBase.shortcuts.essential[category];
  if (shortcuts) {
    res.json(shortcuts);
  } else {
    res.status(404).json({
      error: 'Category not found',
      available: Object.keys(knowledgeBase.shortcuts.essential)
    });
  }
});

// Get Super8 looper info
app.get('/api/knowledge/super8', (req, res) => {
  res.json(knowledgeBase.super8Looper);
});

// Get live looping info
app.get('/api/knowledge/live-looping', (req, res) => {
  res.json(knowledgeBase.liveLooping);
});

// Get Linux setup
app.get('/api/knowledge/linux', (req, res) => {
  res.json(knowledgeBase.linuxSetup);
});

// Get OSC info
app.get('/api/knowledge/osc', (req, res) => {
  res.json(knowledgeBase.osc);
});

// Get workflows
app.get('/api/knowledge/workflows', (req, res) => {
  res.json(knowledgeBase.workflows);
});

app.get('/api/knowledge/workflows/:type', (req, res) => {
  const workflow = knowledgeBase.workflows[req.params.type];
  if (workflow) {
    res.json(workflow);
  } else {
    res.status(404).json({
      error: 'Workflow not found',
      available: Object.keys(knowledgeBase.workflows)
    });
  }
});

// Get troubleshooting
app.get('/api/knowledge/troubleshooting', (req, res) => {
  res.json(knowledgeBase.troubleshooting);
});

app.get('/api/knowledge/troubleshooting/:issue', (req, res) => {
  const result = getTroubleshooting(req.params.issue);
  if (result) {
    res.json(result);
  } else {
    res.status(404).json({
      error: 'Issue not found',
      available: knowledgeBase.troubleshooting.commonIssues.map((i: any) => i.issue)
    });
  }
});

// Get resources
app.get('/api/knowledge/resources', (req, res) => {
  res.json(knowledgeBase.resources);
});

// ==================== OSC Control API ====================

// Get OSC config
app.get('/api/osc/config', (req, res) => {
  res.json(oscClient.getConfig());
});

// Update OSC config
app.post('/api/osc/config', (req, res) => {
  const { host, port, listenPort } = req.body;
  oscClient.updateConfig({ host, port, listenPort });
  res.json({ success: true, config: oscClient.getConfig() });
});

// Get REAPER state
app.get('/api/reaper/state', (req, res) => {
  res.json(oscClient.getState());
});

// Subscribe to REAPER state changes (SSE)
app.get('/api/reaper/state/stream', (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial state
  res.write(`data: ${JSON.stringify(oscClient.getState())}\n\n`);

  // Subscribe to state changes
  const unsubscribe = oscClient.onStateChange((state) => {
    try {
      res.write(`data: ${JSON.stringify(state)}\n\n`);
    } catch (error) {
      console.error('Error sending state update:', error);
    }
  });

  // Cleanup on client disconnect or error
  const cleanup = () => {
    unsubscribe();
  };

  req.on('close', cleanup);
  req.on('error', cleanup);
});

// Transport controls
app.post('/api/transport/play', (req, res) => {
  oscClient.play();
  res.json({ success: true, action: 'play' });
});

app.post('/api/transport/stop', (req, res) => {
  oscClient.stop();
  res.json({ success: true, action: 'stop' });
});

app.post('/api/transport/pause', (req, res) => {
  oscClient.pause();
  res.json({ success: true, action: 'pause' });
});

app.post('/api/transport/record', (req, res) => {
  oscClient.record();
  res.json({ success: true, action: 'record' });
});

app.post('/api/transport/repeat', (req, res) => {
  oscClient.toggleRepeat();
  res.json({ success: true, action: 'repeat toggled' });
});

app.post('/api/transport/metronome', (req, res) => {
  oscClient.toggleMetronome();
  res.json({ success: true, action: 'metronome toggled' });
});

app.post('/api/transport/goto-start', (req, res) => {
  oscClient.goToStart();
  res.json({ success: true, action: 'go to start' });
});

// Tempo
app.post('/api/tempo', (req, res) => {
  const { bpm } = req.body;
  if (typeof bpm !== 'number' || bpm < 20 || bpm > 400) {
    return res.status(400).json({ error: 'BPM must be a number between 20 and 400' });
  }
  oscClient.setTempo(bpm);
  res.json({ success: true, bpm });
});

// Action trigger
app.post('/api/action/:id', (req, res) => {
  const actionId = parseInt(req.params.id);
  if (isNaN(actionId)) {
    return res.status(400).json({ error: 'Invalid action ID' });
  }
  oscClient.triggerAction(actionId);
  res.json({ success: true, actionId });
});

// Track controls
app.post('/api/track/:num/volume', (req, res) => {
  const trackNum = parseInt(req.params.num);
  const { volume } = req.body;
  oscClient.setTrackVolume(trackNum, volume);
  res.json({ success: true, trackNum, volume });
});

app.post('/api/track/:num/pan', (req, res) => {
  const trackNum = parseInt(req.params.num);
  const { pan } = req.body;
  oscClient.setTrackPan(trackNum, pan);
  res.json({ success: true, trackNum, pan });
});

app.post('/api/track/:num/mute', (req, res) => {
  const trackNum = parseInt(req.params.num);
  const { muted } = req.body;
  oscClient.setTrackMute(trackNum, muted);
  res.json({ success: true, trackNum, muted });
});

app.post('/api/track/:num/solo', (req, res) => {
  const trackNum = parseInt(req.params.num);
  const { soloed } = req.body;
  oscClient.setTrackSolo(trackNum, soloed);
  res.json({ success: true, trackNum, soloed });
});

app.post('/api/track/:num/arm', (req, res) => {
  const trackNum = parseInt(req.params.num);
  const { armed } = req.body;
  oscClient.setTrackRecordArm(trackNum, armed);
  res.json({ success: true, trackNum, armed });
});

// ==================== Super8 Looper API ====================

app.post('/api/looper/track/:num', (req, res) => {
  const track = parseInt(req.params.num);
  if (track < 1 || track > 8) {
    return res.status(400).json({ error: 'Track must be between 1 and 8' });
  }
  oscClient.loopTrack(track);
  res.json({ success: true, track, action: 'triggered' });
});

app.post('/api/looper/stop-all', (req, res) => {
  oscClient.loopStopAll();
  res.json({ success: true, action: 'stop all' });
});

app.post('/api/looper/clear-all', (req, res) => {
  oscClient.loopClearAll();
  res.json({ success: true, action: 'clear all' });
});

// Catch-all route to serve index.html for client-side routing
// This must be after all API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(webPath, 'index.html'));
});

// Start server
export async function startHTTPServer(): Promise<void> {
  const port = parseInt(process.env.PORT || '3001');

  app.listen(port, () => {
    console.log(`REAPER Assistant API running at http://localhost:${port}`);
    console.log(`OSC configured for ${oscClient.getConfig().host}:${oscClient.getConfig().port}`);
    console.log('\nEndpoints:');
    console.log('  GET  /health                      - Health check');
    console.log('  GET  /api/search?q=query          - Search knowledge base');
    console.log('  GET  /api/knowledge/*             - Knowledge queries');
    console.log('  POST /api/transport/*             - Transport controls');
    console.log('  POST /api/looper/*                - Super8 looper controls');
  });
}
