"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureRoomDir = ensureRoomDir;
exports.storedFile = storedFile;
exports.deleteRoomFiles = deleteRoomFiles;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("./utils");
const TEMP_DIR = path_1.default.join(process.cwd(), "temp");
function ensureRoomDir(roomId) {
    const dir = path_1.default.join(TEMP_DIR, roomId);
    fs_1.default.mkdirSync(dir, { recursive: true });
    return dir;
}
function storedFile(roomId, originalName, buffer, mime) {
    const dir = ensureRoomDir(roomId);
    const id = (0, utils_1.generateId)();
    const filePath = path_1.default.join(dir, id);
    fs_1.default.writeFileSync(filePath, buffer);
    return {
        id,
        name: originalName,
        size: buffer.length,
        mime,
        path: filePath,
    };
}
function deleteRoomFiles(roomId) {
    const dir = path_1.default.join(TEMP_DIR, roomId);
    if (!fs_1.default.existsSync(dir))
        return;
    fs_1.default.rmSync(dir, { recursive: true, force: true });
}
