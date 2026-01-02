import { WebSocket } from "ws";
import { ChatMessage, ClientEvent, ServerEvent, User } from "./types";
import { roomManager } from "./roomManager";
import { generateId, generateUsername } from "./utils";

export function handleConnection(ws: WebSocket) {
    let currentRoomId: string | null = null;
    let currentUser: User | null = null;

    ws.on("message", data => {
        const msg = JSON.parse(data.toString()) as ClientEvent;

        try {
            if (msg.type === 'JOIN_ROOM') {

                if (!msg.roomId) {
                    ws.send(JSON.stringify({
                        type: "ERROR",
                        message: "RoomID missing"
                    } as ServerEvent));
                    return;
                }

                let room = roomManager.getRoom(msg.roomId);

                if (!room) {
                    room = roomManager.createRoom(msg.roomId);
                }

                const usernames = new Set(
                    Array.from(room.users.values()).map(u => u.username)
                );

                const user: User = {
                    id: generateId(),
                    username: generateUsername(usernames),
                    ws,
                };

                room.users.set(user.id, user);

                currentRoomId = room.id;
                currentUser = user;

                const roomJoinedMsg: ServerEvent =
                {
                    type: "ROOM_JOINED",
                    roomId: room.id,
                    userId: user.id,
                    username: user.username,
                    expiresAt: room.expiresAt,
                }

                ws.send(JSON.stringify(roomJoinedMsg));

                broadcast(room.id, {
                    type: "USER_JOINED",
                    username: user.username,
                });

                sendUserList(room.id);
                sendMessages(ws, room.id);
            }

            if (msg.type === "SEND_MESSAGE" && currentRoomId && currentUser) {
                const room = roomManager.getRoom(currentRoomId);
                if (!room) return;

                const message: ChatMessage = {
                    id: generateId(),
                    userId: currentUser.id,
                    username: currentUser.username,
                    content: msg.content,
                    timestamp: Date.now(),
                    replyTo: msg.replyTo,
                };

                room.messages.push(message);

                broadcast(currentRoomId, {
                    type: "NEW_MESSAGE",
                    message
                });
            }

            if (msg.type === 'DELETE_MESSAGE' && currentRoomId && currentUser) {
                const room = roomManager.getRoom(currentRoomId);
                if (!room) return;

                const index = room.messages.findIndex(
                    m => m.id === msg.messageId
                );

                if (index === -1) return;

                const message = room.messages[index];

                if (message.userId !== currentUser.id) {
                    ws.send(JSON.stringify({
                        type: "ERROR",
                        message: "You can only delete your own messages"
                    } as ServerEvent));
                    return;
                }

                room.messages.splice(index, 1);

                broadcast(currentRoomId, {
                    type: "MESSAGE_DELETED",
                    messageId: msg.messageId,
                });
            }

            if (msg.type === "UPLOAD_FILE" && currentRoomId && currentUser) {
                const room = roomManager.getRoom(currentRoomId);
                if (!room) return;

                const message: ChatMessage = {
                    id: generateId(),
                    userId: currentUser.id,
                    username: currentUser.username,
                    content: "",
                    file: msg.file,
                    timestamp: Date.now(),
                    replyTo: msg.replyTo,
                };

                room.messages.push(message);

                broadcast(currentRoomId, {
                    type: "NEW_MESSAGE",
                    message
                });
            }

        } catch (e: any) {
            ws.send(JSON.stringify({ type: "ERROR", message: e.message } as ServerEvent));
        }
    });

    ws.on("close", () => {
        if (currentRoomId && currentUser) {
            const room = roomManager.getRoom(currentRoomId);
            if (!room) return;

            roomManager.removeUser(currentRoomId, currentUser.id);

            broadcast(currentRoomId, {
                type: "USER_LEFT",
                username: currentUser.username,
            });

            sendUserList(currentRoomId);
        }
    });
}

function broadcast(roomId: string, event: ServerEvent) {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    room.users.forEach(u => {
        u.ws.send(JSON.stringify(event));
    });
}

function sendUserList(roomId: string) {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    broadcast(roomId, {
        type: "USER_LIST",
        users: Array.from(room.users.values()).map(u => u.username),
    });
}

function sendMessages(ws: WebSocket, roomId: string) {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    ws.send(JSON.stringify({
        type: "ROOM_MESSAGES",
        messages: room.messages,
    } satisfies ServerEvent));
}