"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const rateLimiter_1 = require("./rateLimiter");
const roomManager_1 = require("./roomManager");
const fileStore_1 = require("./fileStore");
const ws_1 = require("ws");
const ws_2 = require("./ws");
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
createServer(8080);
function createServer(port) {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.raw({ limit: "10mb", type: "*/*" }));
    app.post("/upload", (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { roomId, userId } = req.query;
        if (!roomId || !userId || typeof roomId !== "string" || typeof userId !== "string") {
            return res.status(400).send("Missing or invalid roomId/userId");
        }
        try {
            yield rateLimiter_1.uploadLimiter.consume(userId);
        }
        catch (_b) {
            return res.status(429).send("Rate limit exceeded");
        }
        const room = roomManager_1.roomManager.getRoom(roomId);
        if (!room) {
            return res.status(404).send("Room not found");
        }
        if (!Buffer.isBuffer(req.body)) {
            return res.status(400).send("Invalid file data");
        }
        const buffer = req.body;
        if (buffer.length > 10 * 1024 * 1024) {
            return res.status(413).send("File too large (max 10MB)");
        }
        const filename = req.get("x-filename") || "unnamed";
        const contentType = req.get("content-type") || "application/octet-stream";
        const file = (0, fileStore_1.storedFile)(roomId, filename, buffer, contentType);
        const baseUrl = (_a = process.env.RENDER_EXTERNAL_URL) !== null && _a !== void 0 ? _a : `http://localhost:${port}`;
        const meta = {
            id: file.id,
            name: file.name,
            size: file.size,
            mime: file.mime,
            url: `${baseUrl}/files/${roomId}/${file.id}`,
        };
        room.files.set(file.id, meta);
        return res.status(200).json(meta);
    }));
    app.get("/files/:roomId/:fileId", (req, res) => {
        const { roomId, fileId } = req.params;
        const room = roomManager_1.roomManager.getRoom(roomId);
        if (!room)
            return res.status(404).send("Room not found");
        const meta = room.files.get(fileId);
        if (!meta)
            return res.status(404).send("File not found");
        const filePath = path_1.default.join(process.cwd(), "temp", roomId, fileId);
        res.setHeader("Content-Type", meta.mime);
        res.setHeader("Content-Disposition", `attachment; filename="${meta.name}"`);
        (0, fs_1.createReadStream)(filePath).pipe(res);
    });
    app.use((_req, res) => {
        res.status(404).send("Not found");
    });
    const server = http_1.default.createServer(app);
    const wss = new ws_1.WebSocket.Server({ server });
    wss.on("connection", ws_2.handleConnection);
    server.listen(port, () => console.log("ws://localhost:8080"));
}
;
