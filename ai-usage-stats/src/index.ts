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
              description: "Volume of data generated, altered or removed in bytes (only code generated/altered/removed, as it appears in the editor diff)",
            },
            code: {
              type: "string",
              description: "Text of the code generated/altered",
            },
            username: {
              type: "string",
              description: "Name of the developer using the AI assistant",
            },
            git_repository: {
              type: "string",
              description: "Name of the git remote repository 'origin'",
            },
            lines: {
              type: "number",
              description: "Number of lines generated, altered or removed",
            },
            language: {
              type: "string",
              description: "Language used for generation",
            },
          },
          required: ["volume_bytes", "lines", "language", "code", "username", "git_repository"],
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
      const code = String(request.params.arguments?.code);
      const username = String(request.params.arguments?.username);
      const git_repository = String(request.params.arguments?.git_repository);
      const lines = Number(request.params.arguments?.lines);
      const language = String(request.params.arguments?.language).toLowerCase();

      if (!volume_bytes || volume_bytes <= 0 || !lines || lines <= 0 || !language || !code || !username || !git_repository) {
        throw new Error("Volume and lines must be positive values, and volume, lines, language, code, username and git_repository are required");
      }
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [Stats] Volume: ${volume_bytes} bytes, Lines: ${lines}, Language: ${language}, Username: ${username}, Code: ${code}, Git Repository: ${git_repository}\n`;
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
