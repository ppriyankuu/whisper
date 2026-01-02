import express, { Request, Response } from "express";
import cors from "cors";
import http from "http";
import { uploadLimiter } from "./rateLimiter";
import { roomManager } from "./roomManager";
import { storedFile } from "./fileStore";
import { FileMeta } from "./types";
import { WebSocket } from "ws";
import { handleConnection } from "./ws";
import path from "path";
import { createReadStream } from "fs";

createServer(8080);


function createServer(port: number) {
    const app = express();
    app.use(cors());
    app.use(express.raw({ limit: "10mb", type: "*/*" }));

    app.post("/upload", async (req: Request, res: Response) => {
        const { roomId, userId } = req.query;

        if (!roomId || !userId || typeof roomId !== "string" || typeof userId !== "string") {
            return res.status(400).send("Missing or invalid roomId/userId");
        }

        try {
            await uploadLimiter.consume(userId);
        } catch {
            return res.status(429).send("Rate limit exceeded");
        }

        const room = roomManager.getRoom(roomId);
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

        const filename = (req.get("x-filename") as string) || "unnamed";
        const contentType = req.get("content-type") || "application/octet-stream";

        const file = storedFile(roomId, filename, buffer, contentType);

        const baseUrl = process.env.RENDER_EXTERNAL_URL
            ?? `http://localhost:${port}`;

        const meta: FileMeta = {
            id: file.id,
            name: file.name,
            size: file.size,
            mime: file.mime,
            url: `${baseUrl}/files/${roomId}/${file.id}`,
        };

        room.files.set(file.id, meta);

        return res.status(200).json(meta);
    });

    app.get("/files/:roomId/:fileId", (req: Request, res: Response) => {
        const { roomId, fileId } = req.params;

        const room = roomManager.getRoom(roomId);
        if (!room) return res.status(404).send("Room not found");

        const meta = room.files.get(fileId);
        if (!meta) return res.status(404).send("File not found");

        const filePath = path.join(process.cwd(), "temp", roomId, fileId);

        res.setHeader("Content-Type", meta.mime);
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${meta.name}"`
        );

        createReadStream(filePath).pipe(res);
    })

    app.use((_req: Request, res: Response) => {
        res.status(404).send("Not found");
    });

    const server = http.createServer(app);
    const wss = new WebSocket.Server({ server });
    wss.on("connection", handleConnection);

    server.listen(port, () => console.log("ws://localhost:8080"));
};
