import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load knowledge base
const knowledgeBasePath = path.join(__dirname, "..", "data", "reaper-knowledge-base.json");
let knowledgeBase: any;

try {
  knowledgeBase = JSON.parse(fs.readFileSync(knowledgeBasePath, "utf-8"));
} catch (error) {
  console.error("Failed to load knowledge base:", error);
  process.exit(1);
}

// Create server
const server = new Server(
  {
    name: "reaper-knowledge-server",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const tools = [
  {
    name: "reaper_search",
    description: "Search the REAPER knowledge base for any topic. Use natural language queries like 'how do I set up live looping' or 'what plugins come with REAPER'.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query - can be natural language",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "reaper_get_overview",
    description: "Get general information about REAPER (developer, platforms, philosophy, use cases)",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "reaper_get_pricing",
    description: "Get REAPER licensing and pricing information",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "reaper_get_features",
    description: "Get REAPER's core features and v7 highlights",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "reaper_get_plugin_info",
    description: "Get information about built-in plugins (ReaPlugs) and JSFX",
    inputSchema: {
      type: "object",
      properties: {
        pluginName: {
          type: "string",
          description: "Optional: specific plugin name (e.g., 'ReaComp', 'ReaEQ')",
        },
      },
    },
  },
  {
    name: "reaper_get_extension_info",
    description: "Get information about REAPER extensions (SWS, ReaPack, Playtime, ReaLearn)",
    inputSchema: {
      type: "object",
      properties: {
        extensionName: {
          type: "string",
          description: "Optional: specific extension name",
        },
      },
    },
  },
  {
    name: "reaper_get_scripting_info",
    description: "Get information about ReaScript and scripting capabilities",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "reaper_get_theme_info",
    description: "Get information about themes and customization",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "reaper_get_shortcuts",
    description: "Get keyboard shortcuts organized by category",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Optional: category (transport, editing, navigation, tracks, markers)",
        },
      },
    },
  },
  {
    name: "reaper_get_live_looping",
    description: "Get information about live looping setups, loopers, and performance tips",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "reaper_get_workflow_info",
    description: "Get workflow guides for specific use cases",
    inputSchema: {
      type: "object",
      properties: {
        workflow: {
          type: "string",
          description: "Workflow type: 'podcast', 'audiobook', or 'film'",
        },
      },
    },
  },
  {
    name: "reaper_get_learning_resources",
    description: "Get tutorials, documentation, and learning resources",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "reaper_get_system_requirements",
    description: "Get system requirements for all platforms",
    inputSchema: {
      type: "object",
      properties: {
        platform: {
          type: "string",
          description: "Optional: 'windows', 'macos', or 'linux'",
        },
      },
    },
  },
  {
    name: "reaper_get_troubleshooting",
    description: "Get troubleshooting help for common issues",
    inputSchema: {
      type: "object",
      properties: {
        issue: {
          type: "string",
          description: "Optional: specific issue (latency, dropouts, midi, looper)",
        },
      },
    },
  },
];

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Simple search function
function searchKnowledgeBase(query: string): string {
  const queryLower = query.toLowerCase();
  const results: string[] = [];
  
  // Search through all sections
  const searchObj = (obj: any, path: string = ""): void => {
    if (typeof obj === "string") {
      if (obj.toLowerCase().includes(queryLower)) {
        results.push(`${path}: ${obj}`);
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, i) => searchObj(item, `${path}[${i}]`));
    } else if (typeof obj === "object" && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        searchObj(value, path ? `${path}.${key}` : key);
      }
    }
  };
  
  searchObj(knowledgeBase);
  
  if (results.length === 0) {
    return `No results found for "${query}". Try different keywords or use a specific tool like reaper_get_features or reaper_get_live_looping.`;
  }
  
  return results.slice(0, 20).join("\n\n");
}

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    let result: any;
    
    switch (name) {
      case "reaper_search":
        result = searchKnowledgeBase(args?.query as string || "");
        break;
        
      case "reaper_get_overview":
        result = knowledgeBase.overview;
        break;
        
      case "reaper_get_pricing":
        result = knowledgeBase.pricing;
        break;
        
      case "reaper_get_features":
        result = knowledgeBase.features;
        break;
        
      case "reaper_get_plugin_info":
        if (args?.pluginName) {
          const pluginLower = (args.pluginName as string).toLowerCase();
          const plugin = knowledgeBase.plugins.reaPlugs.plugins.find(
            (p: any) => p.name.toLowerCase().includes(pluginLower)
          );
          result = plugin || { error: "Plugin not found", available: knowledgeBase.plugins.reaPlugs.plugins.map((p: any) => p.name) };
        } else {
          result = knowledgeBase.plugins;
        }
        break;
        
      case "reaper_get_extension_info":
        if (args?.extensionName) {
          const extLower = (args.extensionName as string).toLowerCase();
          const extensions = knowledgeBase.extensions;
          const ext = Object.entries(extensions).find(
            ([key]) => key.toLowerCase().includes(extLower)
          );
          result = ext ? ext[1] : { error: "Extension not found", available: Object.keys(extensions) };
        } else {
          result = knowledgeBase.extensions;
        }
        break;
        
      case "reaper_get_scripting_info":
        result = knowledgeBase.scripting;
        break;
        
      case "reaper_get_theme_info":
        result = knowledgeBase.themes;
        break;
        
      case "reaper_get_shortcuts":
        if (args?.category) {
          const catLower = (args.category as string).toLowerCase();
          result = knowledgeBase.shortcuts.essential[catLower] || 
            { error: "Category not found", available: Object.keys(knowledgeBase.shortcuts.essential) };
        } else {
          result = knowledgeBase.shortcuts;
        }
        break;
        
      case "reaper_get_live_looping":
        result = knowledgeBase.liveLooping;
        break;
        
      case "reaper_get_workflow_info":
        if (args?.workflow) {
          const wfLower = (args.workflow as string).toLowerCase();
          result = knowledgeBase.workflows[wfLower] || 
            { error: "Workflow not found", available: Object.keys(knowledgeBase.workflows) };
        } else {
          result = knowledgeBase.workflows;
        }
        break;
        
      case "reaper_get_learning_resources":
        result = knowledgeBase.learningResources;
        break;
        
      case "reaper_get_system_requirements":
        if (args?.platform) {
          const platLower = (args.platform as string).toLowerCase();
          result = knowledgeBase.systemRequirements[platLower] || 
            { error: "Platform not found", available: Object.keys(knowledgeBase.systemRequirements) };
        } else {
          result = knowledgeBase.systemRequirements;
        }
        break;
        
      case "reaper_get_troubleshooting":
        if (args?.issue) {
          const issueLower = (args.issue as string).toLowerCase();
          const issue = knowledgeBase.troubleshooting.commonIssues.find(
            (i: any) => i.issue.toLowerCase().includes(issueLower)
          );
          result = issue || { error: "Issue not found", available: knowledgeBase.troubleshooting.commonIssues.map((i: any) => i.issue) };
        } else {
          result = knowledgeBase.troubleshooting;
        }
        break;
        
      default:
        result = { error: `Unknown tool: ${name}` };
    }
    
    return {
      content: [
        {
          type: "text",
          text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("REAPER Knowledge MCP Server running on stdio");
}

main().catch(console.error);
