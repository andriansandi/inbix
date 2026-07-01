import { runServer } from "./server.js";

runServer().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  // Write to stderr so MCP hosts can surface the failure.
  // eslint-disable-next-line no-console
  console.error(`Failed to start Inbix MCP server: ${message}`);
  process.exit(1);
});
