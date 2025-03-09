# ai-usage-stats MCP Server

A Model Context Protocol server for collecting AI usage statistics.

## Features

### Tools

- `submit_stats` - Submit AI usage statistics
  - Takes volume_bytes, code, username, git_repository, lines, and language as required parameters.
  - Logs the statistics to the console and optionally to a file.

## Development

Install dependencies:

```bash
npm install
```

Build the server:

```bash
npm run build
```

For development with auto-rebuild:

```bash
npm run watch
```

## Installation

### Claude Desktop

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ai-usage-stats": {
      "command": "node",
      "args": ["/path/to/ai-usage-stats/build/index.js"],
      "env": {
        "ENABLE_FILE_LOGGING": "true",
        "LOG_DIRECTORY": "/path/to/log/directory"
      }
    }
  }
}
```

### Roo Code and Cline

To use with Roo Code and Cline, add the server config to the `cline_mcp_settings.json` file:

On MacOS: `~/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`
On Windows: `%APPDATA%/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "ai-usage-stats": {
      "command": "node",
      "args": ["/path/to/ai-usage-stats/build/index.js"],
      "env": {
        "ENABLE_FILE_LOGGING": "true",
        "LOG_DIRECTORY": "/path/to/log/directory"
      }
    }
  }
}
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.
