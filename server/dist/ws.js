"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleConnection = handleConnection;
const roomManager_1 = require("./roomManager");
const utils_1 = require("./utils");
function handleConnection(ws) {
    let currentRoomId = null;
    let currentUser = null;
    ws.on("message", data => {
        const msg = JSON.parse(data.toString());
        try {
            if (msg.type === 'JOIN_ROOM') {
                if (!msg.roomId) {
                    ws.send(JSON.stringify({
                        type: "ERROR",
                        message: "RoomID missing"
                    }));
                    return;
                }
                let room = roomManager_1.roomManager.getRoom(msg.roomId);
                if (!room) {
                    room = roomManager_1.roomManager.createRoom(msg.roomId);
                }
                const usernames = new Set(Array.from(room.users.values()).map(u => u.username));
                const user = {
                    id: (0, utils_1.generateId)(),
                    username: (0, utils_1.generateUsername)(usernames),
                    ws,
                };
                room.users.set(user.id, user);
                currentRoomId = room.id;
                currentUser = user;
                const roomJoinedMsg = {
                    type: "ROOM_JOINED",
                    roomId: room.id,
                    userId: user.id,
                    username: user.username,
                    expiresAt: room.expiresAt,
                };
                ws.send(JSON.stringify(roomJoinedMsg));
                broadcast(room.id, {
                    type: "USER_JOINED",
                    username: user.username,
                });
                sendUserList(room.id);
                sendMessages(ws, room.id);
            }
            if (msg.type === "SEND_MESSAGE" && currentRoomId && currentUser) {
                const room = roomManager_1.roomManager.getRoom(currentRoomId);
                if (!room)
                    return;
                const message = {
                    id: (0, utils_1.generateId)(),
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
                const room = roomManager_1.roomManager.getRoom(currentRoomId);
                if (!room)
                    return;
                const index = room.messages.findIndex(m => m.id === msg.messageId);
                if (index === -1)
                    return;
                const message = room.messages[index];
                if (message.userId !== currentUser.id) {
                    ws.send(JSON.stringify({
                        type: "ERROR",
                        message: "You can only delete your own messages"
                    }));
                    return;
                }
                room.messages.splice(index, 1);
                broadcast(currentRoomId, {
                    type: "MESSAGE_DELETED",
                    messageId: msg.messageId,
                });
            }
            if (msg.type === "UPLOAD_FILE" && currentRoomId && currentUser) {
                const room = roomManager_1.roomManager.getRoom(currentRoomId);
                if (!room)
                    return;
                const message = {
                    id: (0, utils_1.generateId)(),
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
        }
        catch (e) {
            ws.send(JSON.stringify({ type: "ERROR", message: e.message }));
        }
    });
    ws.on("close", () => {
        if (currentRoomId && currentUser) {
            const room = roomManager_1.roomManager.getRoom(currentRoomId);
            if (!room)
                return;
            roomManager_1.roomManager.removeUser(currentRoomId, currentUser.id);
            broadcast(currentRoomId, {
                type: "USER_LEFT",
                username: currentUser.username,
            });
            sendUserList(currentRoomId);
        }
    });
}
function broadcast(roomId, event) {
    const room = roomManager_1.roomManager.getRoom(roomId);
    if (!room)
        return;
    room.users.forEach(u => {
        u.ws.send(JSON.stringify(event));
    });
}
function sendUserList(roomId) {
    const room = roomManager_1.roomManager.getRoom(roomId);
    if (!room)
        return;
    broadcast(roomId, {
        type: "USER_LIST",
        users: Array.from(room.users.values()).map(u => u.username),
    });
}
function sendMessages(ws, roomId) {
    const room = roomManager_1.roomManager.getRoom(roomId);
    if (!room)
        return;
    ws.send(JSON.stringify({
        type: "ROOM_MESSAGES",
        messages: room.messages,
    }));
}
