import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { InbixClient } from "@inbix/sdk";
import { loadConfig } from "./config.js";
import { TOOLS, handleToolCall } from "./tools.js";

export async function runServer(): Promise<void> {
  const config = loadConfig();
  const client = new InbixClient({
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
  });

  const server = new Server(
    { name: "inbix", version: "0.1.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const content = await handleToolCall(
      request.params.name,
      request.params.arguments ?? {},
      client
    );
    return { content };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
