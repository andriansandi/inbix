const { spawn } = require("node:child_process");
const path = require("node:path");

const apiKey = process.env.INBIX_API_KEY || "inbix_local_test_key_001";
const baseUrl = process.env.INBIX_BASE_URL || "http://localhost:8791";
const serverPath = path.resolve(__dirname, "../dist/index.cjs");

const child = spawn("node", [serverPath], {
  env: { ...process.env, INBIX_API_KEY: apiKey, INBIX_BASE_URL: baseUrl },
  stdio: ["pipe", "pipe", "inherit"],
});

const requests = [
  {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "smoke-test", version: "0.1.0" },
    },
  },
  {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: { name: "create_inbox", arguments: {} },
  },
];

let buffer = "";

child.stdout.on("data", (data) => {
  buffer += data.toString();
  const lines = buffer.split("\n");
  buffer = lines.pop() ?? "";
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const response = JSON.parse(line);
      handleResponse(response);
    } catch (err) {
      console.error("Failed to parse response line:", line);
    }
  }
});

function handleResponse(response) {
  if (response.id === 1) {
    console.log("✅ initialize ok", response.result.serverInfo);
    return;
  }

  if (response.id === 2) {
    if (response.error) {
      console.error("❌ create_inbox failed:", response.error);
      child.stdin.end();
      process.exit(1);
    }
    console.log("✅ create_inbox ok");
    console.log(response.result.content[0].text);
    child.stdin.end();
    process.exit(0);
  }
}

child.on("error", (err) => {
  console.error("Failed to start MCP server:", err);
  process.exit(1);
});

requests.forEach((req) => child.stdin.write(JSON.stringify(req) + "\n"));
