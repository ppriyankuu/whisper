'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ChatMessage } from '../types';

interface RoomContextType {
    roomId: string | null;
    userId: string | null;
    username: string | null;
    expiresAt: number | null;
    setRoomInfo: (info: { roomId: string; userId: string; username: string; expiresAt: number }) => void;
    repliedMessage: ChatMessage | null;
    setRepliedMessage: (msg: ChatMessage | null) => void;
    clearReply: () => void;
}

const RoomContext = createContext<RoomContextType | null>(null);

export function RoomProvider({ children }: { children: ReactNode }) {
    const [roomId, setRoomId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<number | null>(null);
    const [repliedMessage, setRepliedMessage] = useState<ChatMessage | null>(null);

    const setRoomInfo = ({
        roomId,
        userId,
        username,
        expiresAt,
    }: {
        roomId: string;
        userId: string;
        username: string;
        expiresAt: number;
    }) => {
        setRoomId(roomId);
        setUserId(userId);
        setUsername(username);
        setExpiresAt(expiresAt);

        // Persist for page reloads (optional)
        localStorage.setItem('whisper_roomId', roomId);
        localStorage.setItem('whisper_userId', userId);
        localStorage.setItem('whisper_username', username);
        localStorage.setItem('whisper_expiresAt', expiresAt.toString());
    };

    const clearReply = () => {
        setRepliedMessage(null);
    };

    // Optional: restore on reload (if room still valid)
    useEffect(() => {
        const savedRoomId = localStorage.getItem('whisper_roomId');
        const savedUserId = localStorage.getItem('whisper_userId');
        const savedUsername = localStorage.getItem('whisper_username');
        const savedExpiresAt = localStorage.getItem('whisper_expiresAt');

        if (
            savedRoomId &&
            savedUserId &&
            savedUsername &&
            savedExpiresAt &&
            Date.now() < parseInt(savedExpiresAt)
        ) {
            setRoomId(savedRoomId);
            setUserId(savedUserId);
            setUsername(savedUsername);
            setExpiresAt(parseInt(savedExpiresAt));
        }
    }, []);

    return (
        <RoomContext.Provider
            value={{
                roomId,
                userId,
                username,
                expiresAt,
                setRoomInfo,
                repliedMessage,
                setRepliedMessage,
                clearReply,
            }}
        >
            {children}
        </RoomContext.Provider>
    );
}

export function useRoom() {
    const context = useContext(RoomContext);
    if (!context) {
        throw new Error('useRoom must be used within a RoomProvider');
    }
    return context;
}