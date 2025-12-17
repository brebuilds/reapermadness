import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
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

// ==================== Knowledge API ====================

// Search knowledge base
app.get('/api/search', (req, res) => {
  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }
  const results = searchKnowledgeBase(query);
  res.json({ results });
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
