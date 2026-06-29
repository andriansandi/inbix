interface RealtimeMessage {
  type: "message" | "inbox_expired" | "heartbeat";
  data: unknown;
}

export class RealtimeRoom implements DurableObject {
  constructor(
    private ctx: DurableObjectState,
    _env: unknown,
  ) {}

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair();
      const server = pair[1];
      this.ctx.acceptWebSocket(server);
      return new Response(null, { status: 101, webSocket: pair[0] });
    }

    if (request.method === "POST") {
      const body = (await request.json()) as RealtimeMessage;
      const payload = JSON.stringify(body);
      const clients = this.ctx.getWebSockets();
      for (const client of clients) {
        try {
          client.send(payload);
        } catch {
          // client may have disconnected
        }
      }
      return new Response(null, { status: 200 });
    }

    return new Response("Not Found", { status: 404 });
  }

  webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
    if (message === "ping") {
      ws.send("pong");
    }
  }

  webSocketClose(_ws: WebSocket, _code: number, _reason: string, _wasClean: boolean) {
    // Hibernatable WebSockets handle cleanup automatically
  }

  webSocketError(_ws: WebSocket, error: unknown) {
    console.error("[realtime] WebSocket error:", error);
  }
}
