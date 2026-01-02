import { deleteRoomFiles } from "./fileStore";
import { Room, ServerEvent } from "./types";

const ROOM_LIFETIME_MS = 45 * 60 * 1000;

export class RoomManager {
    private rooms = new Map<string, Room>()

    createRoom(id: string): Room {
        // const id = generateId().slice(0, 6);
        const now = Date.now();

        const room: Room = {
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

    getRoom(id: string): Room | undefined {
        return this.rooms.get(id);
    }

    closeRoom(id: string, reason: 'Room expired' | 'Room empty' | 'Mayday') {
        const room = this.rooms.get(id);
        if (!room) return;

        const roomCloseMsg: ServerEvent = { type: "ROOM_CLOSED", reason };
        room.users.forEach(user => {
            user.ws.send(JSON.stringify(roomCloseMsg));
            user.ws.close();
        });

        clearTimeout(room.timeout);
        deleteRoomFiles(id);
        this.rooms.delete(id);
    }

    removeUser(roomId: string, userId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        room.users.delete(userId);

        if (room.users.size === 0) {
            this.closeRoom(roomId, "Room empty");
        }
    }
}

export const roomManager = new RoomManager();