#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import os from "os";
import fetch from 'node-fetch';

const STATS_SERVER_URL = process.env.STATS_SERVER_URL || null;
const enableFileLogging = process.env.ENABLE_FILE_LOGGING === "true";
const USERNAME = process.env.USERNAME || "unknown";
const logDirectory = process.env.LOG_DIRECTORY || os.tmpdir();
const logFilePath = `${logDirectory}/ai-usage-stats.log`;


console.log("enableFileLogging:", enableFileLogging);

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
console.log("Iniciando plugin de estatísticas");

async function getGitRepositoryUrl(workspaceDir: string): Promise<string | null> {
  const gitConfigPath = `${workspaceDir}/.git/config`;

  if (!fs.existsSync(gitConfigPath)) {
    console.log(`[Git] Arquivo de configuração Git não encontrado em: ${workspaceDir}`);
    return null;
  }

  try {
    const configContent = fs.readFileSync(gitConfigPath, 'utf-8');
    const originRegex = /\[remote "origin"\]\s+url = (.*)/;
    const match = configContent.match(originRegex);

    if (match && match[1]) {
      return match[1].trim();
    } else {
      console.log(`[Git] Seção 'origin' não encontrada no arquivo de configuração Git.`);
      return null;
    }
  } catch (error) {
    console.error(`[Git] Erro ao ler o arquivo de configuração Git: ${error}`);
    return null;
  }
}

async function logToFile(logFilePath: string, logMessage: string) {
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    } else {
      console.log("Log file updated successfully!");
    }
  });
}

async function sendStats(stats: any) {
  if (!STATS_SERVER_URL) {
    console.log("[Stats] STATS_SERVER_URL is not defined, skipping sending stats");
    // logToFile(logFilePath, "ERRO env nao definida");
    return;
  }

  try {
    const response = await fetch(STATS_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stats),
    });

    if (!response.ok) {
      // logToFile(logFilePath, "ERRO chamar server");
      console.error(`[Stats] Failed to send stats to ${STATS_SERVER_URL}, status: ${response.status}`);
      return;
    }

    console.log("[Stats] Stats sent successfully");
  } catch (error) {
    console.error(`[Stats] Error sending stats: ${error}`);
  }
}

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
            workspace_dir: {
              type: "string",
              description: "nome do diretório do projeto",
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
          required: ["volume_bytes", "lines", "language", "code", "workspace_dir"],
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
      const username = USERNAME;
      const workspace_dir = String(request.params.arguments?.workspace_dir);
      const lines = Number(request.params.arguments?.lines);
      const language = String(request.params.arguments?.language).toLowerCase();

      if (!volume_bytes || volume_bytes <= 0 || !lines || lines <= 0 || !language || !code || !username || !workspace_dir) {
        throw new Error("Volume and lines must be positive values, and volume, lines, language, code, username, workspace_dir are required");
      }
      const timestamp = new Date().toISOString();
      const gitRepository = await getGitRepositoryUrl(workspace_dir);
      const logMessage = `[${timestamp}] [Stats] Volume: ${volume_bytes} bytes, Lines: ${lines}, Language: ${language}, Username: ${username}, Code: ${code}, Git Repository: ${gitRepository}, Workspace Dir: ${workspace_dir}\n`;
      console.log(logMessage);

      if (enableFileLogging) {
        logToFile(logFilePath, logMessage);
      }

      sendStats({
        username,
        lines,
        repository: gitRepository,
        volume_bytes,
        language
      });

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
