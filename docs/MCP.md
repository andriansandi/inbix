# MCP Server

Inbix ships with an official [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server. It lets AI agents and MCP-compatible clients create disposable inboxes, read messages, wait for OTPs, extract verification links, and more — all through a standardized interface.

## Supported clients

The MCP server uses the STDIO transport, which is supported by:

- [Claude Desktop](https://claude.ai/download)
- [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview)
- [Cursor](https://www.cursor.com/)
- [Windsurf](https://www.codeium.com/windsurf)
- [VS Code](https://code.visualstudio.com/) (with MCP extensions)
- Any other STDIO-based MCP host

HTTP/SSE transport is planned for a future release.

## Prerequisites

You need an Inbix API key. Create one from the Inbix dashboard under **Settings → API Keys**, or via the API at `POST /api/keys`.

## Installation

You do not need to install the package manually for most clients. They can run it directly with `npx`:

```bash
npx -y @inbix/mcp-server
```

To install globally:

```bash
npm install -g @inbix/mcp-server
```

## Configuration

The server reads two environment variables:

| Variable | Required | Default | Description |
|---|---|---|---|
| `INBIX_API_KEY` | Yes | — | Your Inbix API key (starts with `inbix_`) |
| `INBIX_BASE_URL` | No | `https://inbix.xyz` | Base URL of the Inbix API |

### Claude Desktop

Add this to your `claude_desktop_config.json`:

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

### Cursor

Add to your Cursor MCP config (usually `~/.cursor/mcp.json`):

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

### Windsurf

Add to your Windsurf config (usually `~/.codeium/windsurf/config.json`):

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

## Available tools

| Tool | Description |
|---|---|
| `create_inbox` | Create a new disposable inbox |
| `list_inboxes` | List existing inboxes |
| `read_inbox` | Get details for a specific inbox |
| `delete_inbox` | Delete an inbox and all its messages |
| `list_inbox_messages` | List messages inside an inbox |
| `read_message` | Read a specific message |
| `download_attachment` | Download a message attachment (text or base64) |
| `wait_for_email` | Poll an inbox until a new email arrives |
| `wait_for_otp` | Wait for an email and extract an OTP code |
| `extract_verification_link` | Extract verification/magic links from a message |
| `search_messages` | Search messages by subject, sender, or body |

## Example workflows

### Verify a sign-up email

```text
1. create_inbox
2. (give the email address to the service)
3. wait_for_email
4. extract_verification_link
5. delete_inbox
```

### Wait for an OTP

```text
1. create_inbox
2. (trigger OTP to be sent to the inbox address)
3. wait_for_otp
4. delete_inbox
```

### Automation / CI

```text
1. create_inbox
2. start a test that sends an email to the inbox
3. wait_for_email or search_messages
4. assert the email contains the expected content
5. delete_inbox
```

## Local development

When running Inbix locally, point the MCP server at the local API and use a local API key.

1. Start the local stack:

```bash
pnpm dev
```

2. Seed a test API key directly in the local D1 database (the dashboard sign-in requires Clerk, but MCP only needs an API key):

```bash
npx wrangler d1 execute inbix --local --config wrangler.jsonc \
  --command="INSERT OR REPLACE INTO api_keys (id, name, key_hash, prefix, user_id, created_at, last_used_at, is_active) VALUES ('key_local_test', 'Local Test Key', '7dff8481e8d2d24bdd50828893c621ebc1b342bbace3ea03854b0ec006e1f7f5', 'inbix_local', NULL, strftime('%s','now')*1000, NULL, 1)"
```

3. Configure the client to use the local server:

```json
{
  "mcpServers": {
    "inbix": {
      "command": "npx",
      "args": ["-y", "@inbix/mcp-server"],
      "env": {
        "INBIX_API_KEY": "inbix_local_test_key_001",
        "INBIX_BASE_URL": "http://localhost:8791"
      }
    }
  }
}
```

4. Run the built-in smoke test:

```bash
node packages/mcp-server/scripts/smoke-test.cjs
```

## License

MIT
