import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  knowledgeBase,
  searchKnowledgeBase,
  getSection,
  findAction,
  findPlugin,
  getTroubleshooting,
} from '../knowledge/search.js';
import { ReaperOSCClient } from '../osc/reaper-client.js';

// Initialize OSC client
const oscClient = new ReaperOSCClient();

// Tool definitions
const tools = [
  {
    name: 'reaper_search',
    description: 'Search the REAPER knowledge base for any topic. Use natural language queries.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query - natural language' },
      },
      required: ['query'],
    },
  },
  {
    name: 'reaper_get_overview',
    description: 'Get general information about REAPER DAW',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reaper_get_pricing',
    description: 'Get REAPER licensing and pricing information',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reaper_get_features',
    description: "Get REAPER's core features and v7 highlights",
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reaper_get_plugin',
    description: 'Get information about built-in plugins (ReaPlugs)',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Plugin name (e.g., ReaComp, ReaEQ)' },
      },
    },
  },
  {
    name: 'reaper_get_extension',
    description: 'Get information about REAPER extensions (SWS, ReaPack, Playtime, ReaLearn)',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Extension name' },
      },
    },
  },
  {
    name: 'reaper_get_action',
    description: 'Find REAPER action by ID or name search',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Action ID number or name to search' },
      },
      required: ['search'],
    },
  },
  {
    name: 'reaper_get_shortcuts',
    description: 'Get keyboard shortcuts by category',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Category: transport, editing, navigation, tracks, markers, views' },
      },
    },
  },
  {
    name: 'reaper_get_super8',
    description: 'Get complete Super8 looper documentation including MIDI mappings',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reaper_get_live_looping',
    description: 'Get information about live looping setups, hardware, and workflows',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reaper_get_linux_setup',
    description: 'Get Linux audio setup guide (JACK, PipeWire, yabridge)',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reaper_get_osc',
    description: 'Get OSC setup and control information for REAPER',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reaper_get_workflow',
    description: 'Get workflow guide for specific use cases',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', description: 'Workflow: podcast, audiobook, filmScoring, livePerformance' },
      },
    },
  },
  {
    name: 'reaper_get_troubleshooting',
    description: 'Get troubleshooting help for common issues',
    inputSchema: {
      type: 'object',
      properties: {
        issue: { type: 'string', description: 'Issue: latency, dropouts, midi, sync, vst, sound' },
      },
    },
  },
  // REAPER Control Tools
  {
    name: 'reaper_play',
    description: 'Start REAPER playback',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reaper_stop',
    description: 'Stop REAPER playback',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reaper_record',
    description: 'Toggle REAPER recording',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reaper_toggle_repeat',
    description: 'Toggle loop/repeat mode',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reaper_set_tempo',
    description: 'Set REAPER project tempo',
    inputSchema: {
      type: 'object',
      properties: {
        bpm: { type: 'number', description: 'Tempo in BPM' },
      },
      required: ['bpm'],
    },
  },
  {
    name: 'reaper_trigger_action',
    description: 'Trigger a REAPER action by ID',
    inputSchema: {
      type: 'object',
      properties: {
        actionId: { type: 'number', description: 'Action ID number' },
      },
      required: ['actionId'],
    },
  },
  // Super8 Looper Control
  {
    name: 'reaper_loop_track',
    description: 'Control Super8 looper track (record/play/overdub)',
    inputSchema: {
      type: 'object',
      properties: {
        track: { type: 'number', description: 'Track number 1-8' },
      },
      required: ['track'],
    },
  },
  {
    name: 'reaper_loop_stop_all',
    description: 'Stop all Super8 looper tracks',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reaper_loop_clear_all',
    description: 'Clear all Super8 looper tracks',
    inputSchema: { type: 'object', properties: {} },
  },
  // Project Management Tools
  {
    name: 'reaper_undo',
    description: 'Undo the last action in REAPER',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reaper_redo',
    description: 'Redo the last undone action in REAPER',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reaper_save_project',
    description: 'Save the current REAPER project',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reaper_insert_track',
    description: 'Insert a new track in REAPER',
    inputSchema: { type: 'object', properties: {} },
  },
  // Navigation Tools
  {
    name: 'reaper_add_marker',
    description: 'Add a marker at the current playback position',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reaper_goto_marker',
    description: 'Jump to a specific marker number (1-10)',
    inputSchema: {
      type: 'object',
      properties: {
        marker: { type: 'number', description: 'Marker number 1-10' },
      },
      required: ['marker'],
    },
  },
  {
    name: 'reaper_next_marker',
    description: 'Jump to the next marker',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reaper_prev_marker',
    description: 'Jump to the previous marker',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reaper_goto_start',
    description: 'Go to the beginning of the project',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reaper_goto_end',
    description: 'Go to the end of the project',
    inputSchema: { type: 'object', properties: {} },
  },
  // Track Tools
  {
    name: 'reaper_select_track',
    description: 'Select a track by number',
    inputSchema: {
      type: 'object',
      properties: {
        track: { type: 'number', description: 'Track number (1-based)' },
      },
      required: ['track'],
    },
  },
  {
    name: 'reaper_arm_track',
    description: 'Arm or disarm a track for recording',
    inputSchema: {
      type: 'object',
      properties: {
        track: { type: 'number', description: 'Track number (1-based)' },
        armed: { type: 'boolean', description: 'True to arm, false to disarm' },
      },
      required: ['track', 'armed'],
    },
  },
  {
    name: 'reaper_mute_track',
    description: 'Mute or unmute a track',
    inputSchema: {
      type: 'object',
      properties: {
        track: { type: 'number', description: 'Track number (1-based)' },
        muted: { type: 'boolean', description: 'True to mute, false to unmute' },
      },
      required: ['track', 'muted'],
    },
  },
  {
    name: 'reaper_solo_track',
    description: 'Solo or unsolo a track',
    inputSchema: {
      type: 'object',
      properties: {
        track: { type: 'number', description: 'Track number (1-based)' },
        soloed: { type: 'boolean', description: 'True to solo, false to unsolo' },
      },
      required: ['track', 'soloed'],
    },
  },
  // Zoom & View Tools
  {
    name: 'reaper_zoom_in',
    description: 'Zoom in on the timeline',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reaper_zoom_out',
    description: 'Zoom out on the timeline',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'reaper_zoom_fit',
    description: 'Zoom to fit all items in view',
    inputSchema: { type: 'object', properties: {} },
  },
];

export async function startMCPServer(): Promise<void> {
  const server = new Server(
    {
      name: 'reaper-assistant',
      version: '1.0.4',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    let result: any;

    try {
      switch (name) {
        // Knowledge tools
        case 'reaper_search':
          const searchResults = searchKnowledgeBase(args?.query as string || '');
          result = searchResults.length > 0
            ? searchResults.map(r => `${r.path}: ${r.content}`).join('\n\n')
            : 'No results found. Try different keywords.';
          break;

        case 'reaper_get_overview':
          result = knowledgeBase.overview;
          break;

        case 'reaper_get_pricing':
          result = knowledgeBase.pricing;
          break;

        case 'reaper_get_features':
          result = knowledgeBase.features;
          break;

        case 'reaper_get_plugin':
          if (args?.name) {
            result = findPlugin(args.name as string) || {
              error: 'Plugin not found',
              available: knowledgeBase.plugins.reaPlugs.plugins.map((p: any) => p.name)
            };
          } else {
            result = knowledgeBase.plugins;
          }
          break;

        case 'reaper_get_extension':
          if (args?.name) {
            const extName = (args.name as string).toLowerCase();
            result = knowledgeBase.extensions[extName] ||
              Object.entries(knowledgeBase.extensions).find(
                ([k]) => k.toLowerCase().includes(extName)
              )?.[1] ||
              { error: 'Extension not found', available: Object.keys(knowledgeBase.extensions) };
          } else {
            result = knowledgeBase.extensions;
          }
          break;

        case 'reaper_get_action':
          result = findAction(args?.search as string || '');
          break;

        case 'reaper_get_shortcuts':
          if (args?.category) {
            result = knowledgeBase.shortcuts.essential[args.category as string] ||
              { error: 'Category not found', available: Object.keys(knowledgeBase.shortcuts.essential) };
          } else {
            result = knowledgeBase.shortcuts;
          }
          break;

        case 'reaper_get_super8':
          result = knowledgeBase.super8Looper;
          break;

        case 'reaper_get_live_looping':
          result = knowledgeBase.liveLooping;
          break;

        case 'reaper_get_linux_setup':
          result = knowledgeBase.linuxSetup;
          break;

        case 'reaper_get_osc':
          result = knowledgeBase.osc;
          break;

        case 'reaper_get_workflow':
          if (args?.type) {
            result = knowledgeBase.workflows[args.type as string] ||
              { error: 'Workflow not found', available: Object.keys(knowledgeBase.workflows) };
          } else {
            result = knowledgeBase.workflows;
          }
          break;

        case 'reaper_get_troubleshooting':
          result = getTroubleshooting(args?.issue as string);
          break;

        // Control tools
        case 'reaper_play':
          oscClient.play();
          result = { success: true, action: 'play' };
          break;

        case 'reaper_stop':
          oscClient.stop();
          result = { success: true, action: 'stop' };
          break;

        case 'reaper_record':
          oscClient.record();
          result = { success: true, action: 'record toggled' };
          break;

        case 'reaper_toggle_repeat':
          oscClient.toggleRepeat();
          result = { success: true, action: 'repeat toggled' };
          break;

        case 'reaper_set_tempo':
          oscClient.setTempo(args?.bpm as number);
          result = { success: true, action: `tempo set to ${args?.bpm} BPM` };
          break;

        case 'reaper_trigger_action':
          oscClient.triggerAction(args?.actionId as number);
          result = { success: true, action: `triggered action ${args?.actionId}` };
          break;

        case 'reaper_loop_track':
          const track = args?.track as number;
          if (track >= 1 && track <= 8) {
            oscClient.loopTrack(track);
            result = { success: true, action: `Super8 track ${track} triggered` };
          } else {
            result = { error: 'Track must be 1-8' };
          }
          break;

        case 'reaper_loop_stop_all':
          oscClient.loopStopAll();
          result = { success: true, action: 'All Super8 tracks stopped' };
          break;

        case 'reaper_loop_clear_all':
          oscClient.loopClearAll();
          result = { success: true, action: 'All Super8 tracks cleared' };
          break;

        // Project Management
        case 'reaper_undo':
          oscClient.triggerAction(40029); // Edit: Undo
          result = { success: true, action: 'Undo executed' };
          break;

        case 'reaper_redo':
          oscClient.triggerAction(40030); // Edit: Redo
          result = { success: true, action: 'Redo executed' };
          break;

        case 'reaper_save_project':
          oscClient.triggerAction(40026); // File: Save project
          result = { success: true, action: 'Project saved' };
          break;

        case 'reaper_insert_track':
          oscClient.triggerAction(40001); // Track: Insert new track
          result = { success: true, action: 'New track inserted' };
          break;

        // Navigation
        case 'reaper_add_marker':
          oscClient.triggerAction(40157); // Markers: Insert marker at current position
          result = { success: true, action: 'Marker added at current position' };
          break;

        case 'reaper_goto_marker':
          const marker = args?.marker as number;
          if (marker >= 1 && marker <= 10) {
            // Action IDs 40161-40170 are "Go to marker 01-10"
            oscClient.triggerAction(40160 + marker);
            result = { success: true, action: `Jumped to marker ${marker}` };
          } else {
            result = { error: 'Marker must be between 1 and 10' };
          }
          break;

        case 'reaper_next_marker':
          oscClient.triggerAction(40173); // Markers: Go to next marker/project end
          result = { success: true, action: 'Jumped to next marker' };
          break;

        case 'reaper_prev_marker':
          oscClient.triggerAction(40172); // Markers: Go to previous marker/project start
          result = { success: true, action: 'Jumped to previous marker' };
          break;

        case 'reaper_goto_start':
          oscClient.goToStart();
          result = { success: true, action: 'Jumped to project start' };
          break;

        case 'reaper_goto_end':
          oscClient.triggerAction(40043); // Transport: Go to end of project
          result = { success: true, action: 'Jumped to project end' };
          break;

        // Track controls
        case 'reaper_select_track':
          const selectTrack = args?.track as number;
          oscClient.selectTrack(selectTrack);
          result = { success: true, action: `Selected track ${selectTrack}` };
          break;

        case 'reaper_arm_track':
          const armTrack = args?.track as number;
          const armed = args?.armed as boolean;
          oscClient.setTrackRecordArm(armTrack, armed);
          result = { success: true, action: `Track ${armTrack} ${armed ? 'armed' : 'disarmed'}` };
          break;

        case 'reaper_mute_track':
          const muteTrack = args?.track as number;
          const muted = args?.muted as boolean;
          oscClient.setTrackMute(muteTrack, muted);
          result = { success: true, action: `Track ${muteTrack} ${muted ? 'muted' : 'unmuted'}` };
          break;

        case 'reaper_solo_track':
          const soloTrack = args?.track as number;
          const soloed = args?.soloed as boolean;
          oscClient.setTrackSolo(soloTrack, soloed);
          result = { success: true, action: `Track ${soloTrack} ${soloed ? 'soloed' : 'unsoloed'}` };
          break;

        // Zoom & View
        case 'reaper_zoom_in':
          oscClient.triggerAction(1012); // View: Zoom in horizontal
          result = { success: true, action: 'Zoomed in' };
          break;

        case 'reaper_zoom_out':
          oscClient.triggerAction(1011); // View: Zoom out horizontal
          result = { success: true, action: 'Zoomed out' };
          break;

        case 'reaper_zoom_fit':
          oscClient.triggerAction(40295); // View: Zoom to fit all items in project
          result = { success: true, action: 'Zoomed to fit all items' };
          break;

        default:
          result = { error: `Unknown tool: ${name}` };
      }
    } catch (error) {
      result = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    return {
      content: [
        {
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
        },
      ],
    };
  });

  // Connect transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('REAPER Assistant MCP Server running on stdio');
}
