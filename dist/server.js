"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts
const http_1 = require("http");
const next_1 = __importDefault(require("next"));
const url_1 = require("url");
const port = parseInt(process.env.PORT || "8080", 10);
const dev = process.env.NODE_ENV !== "production";
const app = (0, next_1.default)({ dev });
const handle = app.getRequestHandler();
app.prepare().then(() => {
    const server = (0, http_1.createServer)((req, res) => {
        const parsedUrl = (0, url_1.parse)(req.url || "", true);
        handle(req, res, parsedUrl);
    });
    // ⏱️ Extiende el timeout a 30s
    server.timeout = 30000;
    server.listen(port, () => {
        console.log(`🚀 Ready on http://localhost:${port}`);
    });
});
