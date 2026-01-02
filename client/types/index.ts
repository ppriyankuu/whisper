export type RoomID = string;
export type UserID = string;
export type MessageID = string;

export interface User {
    id: UserID;
    username: string;
}

export interface FileMeta {
    id: string;
    name: string;
    size: number;
    mime: string;
    url: string;
}

export interface ChatMessage {
    id: MessageID;
    userId: UserID;
    username: string;
    content: string;
    timestamp: number;
    replyTo?: MessageID;
    file?: FileMeta;
}

export type ClientEvent =
    | { type: "JOIN_ROOM"; roomId: string }
    | { type: "SEND_MESSAGE"; content: string; replyTo?: MessageID }
    | { type: "UPLOAD_FILE"; file: FileMeta; replyTo?: MessageID }
    | { type: "DELETE_MESSAGE"; messageId: string };

export type ServerEvent =
    | { type: "ROOM_JOINED"; roomId: RoomID; userId: UserID; username: string; expiresAt: number }
    | { type: "USER_JOINED"; username: string }
    | { type: "USER_LEFT"; username: string }
    | { type: "USER_LIST"; users: string[] }
    | { type: "ROOM_MESSAGES"; messages: ChatMessage[] }
    | { type: "NEW_MESSAGE"; message: ChatMessage }
    | { type: "MESSAGE_DELETED"; messageId: string }
    | { type: "ROOM_CLOSED"; reason: string }
    | { type: "ERROR"; message: string };

