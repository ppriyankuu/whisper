import path from "path";
import fs from "fs";
import { generateId } from "./utils";

const TEMP_DIR = path.join(process.cwd(), "temp");

export interface StoredFile {
    id: string;
    name: string;
    size: number;
    mime: string;
    path: string;
}

export function ensureRoomDir(roomId: string) {
    const dir = path.join(TEMP_DIR, roomId);
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}

export function storedFile(
    roomId: string,
    originalName: string,
    buffer: Buffer,
    mime: string
): StoredFile {
    const dir = ensureRoomDir(roomId);
    const id = generateId();

    const filePath = path.join(dir, id);

    fs.writeFileSync(filePath, buffer);

    return {
        id,
        name: originalName,
        size: buffer.length,
        mime,
        path: filePath,
    };
}

export function deleteRoomFiles(roomId: string) {
    const dir = path.join(TEMP_DIR, roomId);
    if (!fs.existsSync(dir)) return;

    fs.rmSync(dir, { recursive: true, force: true });
}