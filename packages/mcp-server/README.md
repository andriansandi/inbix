# @inbix/mcp-server

Official [Model Context Protocol](https://modelcontextprotocol.io) server for [Inbix](https://inbix.xyz) — the open-source, Cloudflare-native email infrastructure platform.

Use this server to give AI agents and MCP clients access to disposable inboxes, messages, attachments, OTP extraction, and verification link discovery.

## Supported transports

- **STDIO** (ready) — works with Claude Desktop, Claude Code, Cursor, Windsurf, VS Code, and other STDIO-based MCP clients.
- **HTTP/SSE** — planned for a future release.

## Installation

### npx (recommended for MCP clients)

```bash
npx -y @inbix/mcp-server
```

### Local workspace

```bash
pnpm --filter @inbix/mcp-server build
```

## Configuration

The server reads two environment variables:

| Variable | Required | Default | Description |
|---|---|---|---|
| `INBIX_API_KEY` | Yes | — | Your Inbix API key (starts with `inbix_`) |
| `INBIX_BASE_URL` | No | `https://inbix.xyz` | Base URL of the Inbix API |

Create an API key from the Inbix dashboard or via the `/api/keys` endpoint.

## Claude Desktop configuration

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "inbix": {
      "command": "npx",
      "args": ["-y", "@inbix/mcp-server"],
      "env": {
        "INBIX_API_KEY": "inbix_your_api_key_here",
        "INBIX_BASE_URL": "https://inbix.xyz"
      }
    }
  }
}
```

Restart Claude Desktop after editing the config.

## Available tools

| Tool | Description |
|---|---|
| `create_inbox` | Create a disposable inbox (optionally with custom domain/TTL) |
| `list_inboxes` | List existing inboxes |
| `read_inbox` | Get details for a specific inbox |
| `delete_inbox` | Delete an inbox and all its messages |
| `list_inbox_messages` | List messages in an inbox |
| `read_message` | Read a specific message (subject, body, HTML) |
| `download_attachment` | Download a message attachment as text or base64 |
| `wait_for_email` | Poll an inbox until an email arrives |
| `wait_for_otp` | Wait for an email and extract an OTP code |
| `extract_verification_link` | Pull verification/magic links from a message |
| `search_messages` | Search messages by subject/sender/body across inboxes |

## Development

```bash
# Install dependencies
pnpm install

# Typecheck
pnpm --filter @inbix/mcp-server typecheck

# Build
pnpm --filter @inbix/mcp-server build

# Run locally (ensure INBIX_API_KEY is exported)
node packages/mcp-server/dist/index.cjs
```

## License

MIT
