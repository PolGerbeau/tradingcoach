// server.ts
import { createServer, IncomingMessage, ServerResponse } from "http";
import next from "next";
import { parse } from "url";

const port = parseInt(process.env.PORT || "8080", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const parsedUrl = parse(req.url || "", true);
    handle(req, res, parsedUrl);
  });

  // ⏱️ Extiende el timeout a 60s
  server.timeout = 60000;

  server.listen(port, () => {
    console.log(`🚀 Ready on http://localhost:${port}`);
  });
});
