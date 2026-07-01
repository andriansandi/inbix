export interface Config {
  apiKey: string;
  baseUrl: string;
}

export function loadConfig(): Config {
  const apiKey = process.env.INBIX_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing INBIX_API_KEY environment variable. " +
        "Set it to your Inbix API key before starting the MCP server."
    );
  }

  const baseUrl = (process.env.INBIX_BASE_URL ?? "https://inbix.xyz").replace(
    /\/$/,
    ""
  );

  return { apiKey, baseUrl };
}
