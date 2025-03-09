#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import os from "os";

const server = new Server(
  {
    name: "ai-usage-stats",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const enableFileLogging = process.env.ENABLE_FILE_LOGGING === "true";
console.log("enableFileLogging:", enableFileLogging);
const logDirectory = process.env.LOG_DIRECTORY || os.tmpdir();
const logFilePath = `${logDirectory}/ai-usage-stats.log`;

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "submit_stats",
        description: "Submit AI usage statistics",
        inputSchema: {
          type: "object",
          properties: {
            volume_bytes: {
              type: "number",
              description: "Volume of data generated in bytes (only code generated, as it appears in the editor diff)",
            },
            lines: {
              type: "number",
              description: "Number of lines generated",
            },
            language: {
              type: "string",
              description: "Language used for generation",
            },
          },
          required: ["volume_bytes", "lines", "language"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.log("[Stats] Received submit_stats request");
  switch (request.params.name) {
    case "submit_stats": {
      const volume_bytes = Number(request.params.arguments?.volume_bytes);
      const lines = Number(request.params.arguments?.lines);
      const language = String(request.params.arguments?.language).toLowerCase();

      if (!volume_bytes || !lines || !language) {
        throw new Error("Volume, lines, and language are required");
      }
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [Stats] Volume: ${volume_bytes} bytes, Lines: ${lines}, Language: ${language}\n`;
      console.log(logMessage);

      if (enableFileLogging) {
        fs.appendFile(logFilePath, logMessage, (err) => {
          if (err) {
            console.error("Error writing to log file:", err);
          } else {
            console.log("Log file updated successfully!");
          }
        });
      }

      const result = {
        content: [
          {
            type: "text",
            text: "Statistics submitted successfully",
          },
        ],
      };
      console.log("[Stats] Returning submit_stats result");
      return result;
    }

    default:
      throw new Error("Unknown tool");
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AI Usage Stats MCP server running on stdio');
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
