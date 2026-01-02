import { useEffect, useRef, useState } from "react";
import { ChatMessage, ClientEvent, FileMeta, ServerEvent } from "../types";

type MessageHandler = (msg: ChatMessage) => void;
type UserListHandler = (usernames: string[]) => void;
type ErrorHandler = (msg: string) => void;
type RoomJoinedHandler = (data: {
    roomId: string;
    userId: string;
    username: string;
    expiresAt: number;
}) => void;
type RoomClosedHandler = (reason: string) => void;
type RoomMessagesHandler = (messages: ChatMessage[]) => void;
type MessageDeletedHandler = (messageId: string) => void;

export function useWebSocket(
    roomId: string,
    handlers: {
        onMessage: MessageHandler;
        onRoomMessages: RoomMessagesHandler;
        onMessageDeleted: MessageDeletedHandler;
        onUserList: UserListHandler;
        onJoin: (username: string) => void;
        onLeave: (username: string) => void;
        onRoomJoined: RoomJoinedHandler;
        onRoomClosed: RoomClosedHandler;
        onError: ErrorHandler;
    }
) {
    const [connected, setConnected] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    const hasOpenedRef = useRef(false);

    useEffect(() => {
        if (!roomId) return;
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const wsUrl = `ws://localhost:8080`;
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
            hasOpenedRef.current = true;
            const joinRoomMsg: ClientEvent = {
                type: "JOIN_ROOM",
                roomId: roomId,
            };

            socket.send(JSON.stringify(joinRoomMsg));

            setConnected(true);
        }

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data) as ServerEvent;

            switch (data.type) {
                case "ROOM_JOINED":
                    setCurrentUser({ id: data.userId, username: data.username });
                    handlers.onRoomJoined({
                        roomId: data.roomId,
                        userId: data.userId,
                        username: data.username,
                        expiresAt: data.expiresAt,
                    });
                    break;

                case "ROOM_MESSAGES":
                    handlers.onRoomMessages(data.messages);
                    break;

                case "NEW_MESSAGE":
                    handlers.onMessage(data.message);
                    break;

                case "MESSAGE_DELETED":
                    handlers.onMessageDeleted(data.messageId);
                    break;

                case "USER_LIST":
                    handlers.onUserList(data.users);
                    break;

                case "USER_JOINED":
                    handlers.onJoin(data.username);
                    break;

                case "USER_LEFT":
                    handlers.onLeave(data.username);
                    break;

                case "ROOM_CLOSED":
                    handlers.onRoomClosed(data.reason);
                    break;

                case "ERROR":
                    handlers.onError(data.message);
                    break;
            }
        };

        socket.onerror = (event) => {
            console.log("WebSocket error", event);

            if (!hasOpenedRef.current) {
                handlers.onError("Connection error");
            }
        };

        socket.onclose = (event) => {
            setConnected(false);
            wsRef.current = null;

            if (!event.wasClean && !hasOpenedRef.current) {
                handlers.onError("Connection closed unexpectedly")
            }
        };

        return () => {
            socket.close();
            wsRef.current = null;
        };
    }, [roomId]);

    const sendMessage = ({ content, replyTo, file }: { content?: string, replyTo?: string, file?: FileMeta }) => {
        const ws = wsRef.current;

        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.warn("WebSocket not ready, message dropped");
            return;
        }

        let payload: ClientEvent;

        if (content) {
            payload = {
                type: "SEND_MESSAGE",
                content,
                replyTo,
            };

            ws.send(JSON.stringify(payload));
        } else if (file) {
            payload = {
                type: "UPLOAD_FILE",
                file,
                replyTo,
            }
            ws.send(JSON.stringify(payload));
        }
    };

    const deleteMessage = (messageId: string) => {
        const ws = wsRef.current;

        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.warn("WebSocket not ready, delete dropped");
            return;
        }

        const payload: ClientEvent = {
            type: "DELETE_MESSAGE",
            messageId,
        };

        ws.send(JSON.stringify(payload));
    }

    return {
        connected,
        currentUser,
        sendMessage,
        deleteMessage,
    };
}