/**
 * BruceOps Family Steward MCP Server
 * 
 * This is a simple MCP (Model Context Protocol) server that allows Claude Desktop
 * to interact with BruceOps family data.
 * 
 * Usage:
 * 1. Export family data from BruceOps to family-steward/input.json
 * 2. Run: npx ts-node family-steward/mcp-server.ts
 * 3. Configure Claude Desktop to connect to this server
 * 4. Ask Claude to analyze your family data
 */

import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const DATA_DIR = process.env.BRUCEOPS_DATA_DIR || "./family-steward";
const INPUT_FILE = path.join(DATA_DIR, "input.json");
const OUTPUT_FILE = path.join(DATA_DIR, "output.json");
const SUGGESTIONS_FILE = path.join(DATA_DIR, "suggestions.json");

interface MCPRequest {
  jsonrpc: "2.0";
  id: number | string;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: "2.0";
  id: number | string;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

function sendResponse(response: MCPResponse): void {
  const json = JSON.stringify(response);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(json)}\r\n\r\n${json}`);
}

function handleRequest(request: MCPRequest): void {
  const { id, method, params } = request;

  switch (method) {
    case "initialize":
      sendResponse({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {},
            resources: {},
            prompts: {}
          },
          serverInfo: {
            name: "bruceops-family-steward",
            version: "1.0.0"
          }
        }
      });
      break;

    case "tools/list":
      sendResponse({
        jsonrpc: "2.0",
        id,
        result: {
          tools: [
            {
              name: "read_family_export",
              description: "Read the latest family data export from BruceOps",
              inputSchema: {
                type: "object",
                properties: {},
                required: []
              }
            },
            {
              name: "analyze_family_drifts",
              description: "Analyze family data for patterns requiring attention",
              inputSchema: {
                type: "object",
                properties: {
                  focus: {
                    type: "string",
                    description: "Focus area: energy, connection, goals, or all",
                    enum: ["energy", "connection", "goals", "all"]
                  }
                }
              }
            },
            {
              name: "write_suggestions",
              description: "Write activity suggestions that BruceOps can import",
              inputSchema: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        activity: { type: "string" },
                        rationale: { type: "string" },
                        effort: { type: "string", enum: ["low", "medium", "high"] }
                      }
                    }
                  }
                },
                required: ["suggestions"]
              }
            }
          ]
        }
      });
      break;

    case "tools/call":
      handleToolCall(id, params?.name, params?.arguments);
      break;

    case "resources/list":
      sendResponse({
        jsonrpc: "2.0",
        id,
        result: {
          resources: [
            {
              uri: `file://${INPUT_FILE}`,
              name: "Family Export Data",
              description: "Latest exported family data",
              mimeType: "application/json"
            },
            {
              uri: `file://${OUTPUT_FILE}`,
              name: "Analysis Results",
              description: "Results from drift analysis",
              mimeType: "application/json"
            }
          ]
        }
      });
      break;

    case "resources/read":
      handleResourceRead(id, params?.uri);
      break;

    case "prompts/list":
      sendResponse({
        jsonrpc: "2.0",
        id,
        result: {
          prompts: [
            {
              name: "analyze_week",
              description: "Analyze the family's week",
              arguments: []
            },
            {
              name: "suggest_activities",
              description: "Suggest bond-strengthening activities",
              arguments: []
            }
          ]
        }
      });
      break;

    case "prompts/get":
      handlePromptGet(id, params?.name);
      break;

    default:
      sendResponse({
        jsonrpc: "2.0",
        id,
        error: {
          code: -32601,
          message: `Method not found: ${method}`
        }
      });
  }
}

function handleToolCall(id: number | string, toolName: string, args: any): void {
  switch (toolName) {
    case "read_family_export":
      try {
        if (!fs.existsSync(INPUT_FILE)) {
          sendResponse({
            jsonrpc: "2.0",
            id,
            result: {
              content: [{ type: "text", text: "No family data exported yet. Export data from BruceOps first." }]
            }
          });
          return;
        }
        const data = fs.readFileSync(INPUT_FILE, "utf-8");
        sendResponse({
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: data }]
          }
        });
      } catch (error: any) {
        sendResponse({
          jsonrpc: "2.0",
          id,
          error: { code: -32000, message: error.message }
        });
      }
      break;

    case "analyze_family_drifts":
      try {
        if (!fs.existsSync(INPUT_FILE)) {
          sendResponse({
            jsonrpc: "2.0",
            id,
            result: {
              content: [{ type: "text", text: "No family data to analyze. Export data first." }]
            }
          });
          return;
        }
        const data = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));
        const focus = args?.focus || "all";
        
        const analysis = {
          exportDate: data.exportDate,
          focus,
          memberCount: data.members?.length || 0,
          recentLogsCount: data.logs?.length || 0,
          activeDrifts: data.drifts?.filter((d: any) => !d.acknowledged)?.length || 0,
          weeklyStats: data.weeklyStats || {},
          analysisPrompt: `Analyze this family data with focus on ${focus}. Look for patterns requiring attention.`
        };

        sendResponse({
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ 
              type: "text", 
              text: JSON.stringify(analysis, null, 2) 
            }]
          }
        });
      } catch (error: any) {
        sendResponse({
          jsonrpc: "2.0",
          id,
          error: { code: -32000, message: error.message }
        });
      }
      break;

    case "write_suggestions":
      try {
        const suggestions = args?.suggestions || [];
        const output = {
          generatedAt: new Date().toISOString(),
          source: "claude-desktop",
          suggestions: suggestions.map((s: any) => ({
            activity: String(s.activity || "").slice(0, 200),
            rationale: String(s.rationale || "").slice(0, 500),
            effort: ["low", "medium", "high"].includes(s.effort) ? s.effort : "medium"
          }))
        };
        fs.writeFileSync(SUGGESTIONS_FILE, JSON.stringify(output, null, 2), "utf-8");
        sendResponse({
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ 
              type: "text", 
              text: `Wrote ${suggestions.length} suggestions to ${SUGGESTIONS_FILE}` 
            }]
          }
        });
      } catch (error: any) {
        sendResponse({
          jsonrpc: "2.0",
          id,
          error: { code: -32000, message: error.message }
        });
      }
      break;

    default:
      sendResponse({
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Unknown tool: ${toolName}` }
      });
  }
}

function handleResourceRead(id: number | string, uri: string): void {
  try {
    const filePath = uri.replace("file://", "");
    if (!fs.existsSync(filePath)) {
      sendResponse({
        jsonrpc: "2.0",
        id,
        error: { code: -32000, message: "Resource not found" }
      });
      return;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    sendResponse({
      jsonrpc: "2.0",
      id,
      result: {
        contents: [{ uri, mimeType: "application/json", text: content }]
      }
    });
  } catch (error: any) {
    sendResponse({
      jsonrpc: "2.0",
      id,
      error: { code: -32000, message: error.message }
    });
  }
}

function handlePromptGet(id: number | string, promptName: string): void {
  const prompts: Record<string, any> = {
    analyze_week: {
      description: "Analyze the family's week for drifts and patterns",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please analyze my family's week. First, read the family export data using read_family_export, then analyze it for drifts and patterns. Focus on:
1. Energy levels and trends
2. Connection patterns
3. Goal completion rates
4. Any drifts that need attention

Provide factual observations and practical suggestions.`
          }
        }
      ]
    },
    suggest_activities: {
      description: "Suggest bond-strengthening activities",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Based on my family's current patterns (read the export data first), suggest 3-5 bond-strengthening activities. Consider:
1. Current energy levels (suggest low-effort if energy is low)
2. Areas that need connection
3. Practical activities that fit our family size

Use write_suggestions to save your recommendations.`
          }
        }
      ]
    }
  };

  if (prompts[promptName]) {
    sendResponse({
      jsonrpc: "2.0",
      id,
      result: prompts[promptName]
    });
  } else {
    sendResponse({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Unknown prompt: ${promptName}` }
    });
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let buffer = "";

rl.on("line", (line) => {
  buffer += line;
  
  if (line.trim() === "") {
    return;
  }

  try {
    const contentLengthMatch = buffer.match(/Content-Length: (\d+)/);
    if (contentLengthMatch) {
      const jsonStart = buffer.indexOf("{");
      if (jsonStart !== -1) {
        const json = buffer.slice(jsonStart);
        const request = JSON.parse(json);
        handleRequest(request);
        buffer = "";
      }
    } else if (buffer.startsWith("{")) {
      const request = JSON.parse(buffer);
      handleRequest(request);
      buffer = "";
    }
  } catch {
  }
});

console.error("BruceOps Family Steward MCP Server started");
