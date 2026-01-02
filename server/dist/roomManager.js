"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomManager = exports.RoomManager = void 0;
const fileStore_1 = require("./fileStore");
const ROOM_LIFETIME_MS = 45 * 60 * 1000;
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(id) {
        // const id = generateId().slice(0, 6);
        const now = Date.now();
        const room = {
            id,
            users: new Map(),
            messages: [],
            files: new Map(),
            createdAt: now,
            expiresAt: now + ROOM_LIFETIME_MS,
            timeout: setTimeout(() => {
                this.closeRoom(id, "Room expired");
            }, ROOM_LIFETIME_MS),
        };
        this.rooms.set(id, room);
        return room;
    }
    getRoom(id) {
        return this.rooms.get(id);
    }
    closeRoom(id, reason) {
        const room = this.rooms.get(id);
        if (!room)
            return;
        const roomCloseMsg = { type: "ROOM_CLOSED", reason };
        room.users.forEach(user => {
            user.ws.send(JSON.stringify(roomCloseMsg));
            user.ws.close();
        });
        clearTimeout(room.timeout);
        (0, fileStore_1.deleteRoomFiles)(id);
        this.rooms.delete(id);
    }
    removeUser(roomId, userId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        room.users.delete(userId);
        if (room.users.size === 0) {
            this.closeRoom(roomId, "Room empty");
        }
    }
}
exports.RoomManager = RoomManager;
exports.roomManager = new RoomManager();
