'use client'

import ChatInput from "@/components/chatInput";
import ChatMessages from "@/components/chatMessages";
import CountdownTimer from "@/components/countdown";
import UserList from "@/components/userList";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useRoom } from "@/lib/roomContext";
import { ChatMessage, FileMeta } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";


export default function RoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomId = params.code as string;
    const [showUsers, setShowUsers] = useState(false);
    const [copied, setCopied] = useState(false);

    const {
        setRoomInfo,
        username: currentUsername,
        clearReply,
        expiresAt
    } = useRoom();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [usernames, setUsernames] = useState<string[]>([]);
    const [roomClosed, setRoomClosed] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const onMessage = (msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg]);
    };

    const onUserList = (users: string[]) => setUsernames(users);
    const onJoin = (username: string) => toast.success(`${username} joined`);
    const onLeave = (username: string) => toast(`${username} left`, { icon: '👋' });

    const onRoomJoined = (data: {
        roomId: string;
        userId: string;
        username: string;
        expiresAt: number;
    }) => {
        setRoomInfo(data);
    };

    const onRoomMessages = (msgs: ChatMessage[]) => {
        setMessages(msgs);
    };

    const onMessageDeleted = (messageId: string) => {
        setMessages(prev => prev.filter(m => m.id !== messageId));
    };


    const onRoomClosed = (reason: string) => {
        setRoomClosed(true);
        toast.error(`Room closed: ${reason}`);
    };

    const onError = (msg: string) => {
        toast.error(msg);
        if (msg.includes('not found')) router.push('/');
    };

    const { sendMessage, deleteMessage } = useWebSocket(
        roomId,
        {
            onMessage,
            onUserList,
            onJoin,
            onLeave,
            onRoomJoined,
            onRoomClosed,
            onError,
            onRoomMessages,
            onMessageDeleted,
        }
    );

    const handleSend = (payload: { file?: FileMeta, content?: string, replyTo?: string }) => {
        if (payload.file) {
            sendMessage({ replyTo: payload.replyTo, file: payload.file });
        } else {
            if (!payload.content?.trim()) return;

            sendMessage({ content: payload.content, replyTo: payload.replyTo });
            clearReply();
        }
    };

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        toast.success('Room code copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    if (roomClosed) {
        return (
            <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold text-red-400 mb-2">Room Closed</h2>
                    <p>This chat room has expired or been closed.</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-4 px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-zinc-900 text-white flex flex-col overflow-hidden">

            <header className="p-4 border-b border-zinc-800">
                <div className="flex items-start justify-between gap-3 flex-nowrap">

                    {/* LEFT */}
                    <div className="flex flex-col shrink-0">
                        <h1 className="text-xl font-semibold leading-tight">Whisper🎭</h1>

                        {currentUsername && (
                            <p className="text-sm text-neutral-400 flex items-center gap-1.5 mt-1">
                                <span className="text-neutral-500 text-xs">You</span>
                                <span className="font-semibold text-white bg-neutral-800 px-2 py-0.5 rounded-md">
                                    {currentUsername}
                                </span>
                            </p>
                        )}
                    </div>

                    {/* MIDDLE */}
                    <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
                        <span className="text-xs text-zinc-600 whitespace-nowrap">Room</span>

                        <div
                            onClick={copyRoomCode}
                            className="cursor-pointer flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 rounded-md transition-colors"
                        >
                            <span className="font-mono text-sm truncate max-w-30">
                                {roomId}
                            </span>

                            {copied ? (
                                <span className="text-green-400 text-xs">✓</span>
                            ) : (
                                <span className="text-zinc-400 text-xs">📋</span>
                            )}
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                            onClick={() => setShowUsers(true)}
                            className="md:hidden px-3 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-sm"
                        >
                            👥
                        </button>

                        {expiresAt && (
                            <CountdownTimer
                                expiresAt={expiresAt}
                                onAlmostExpired={(msg) => toast(`⏳ ${msg}`)}
                            />
                        )}
                    </div>

                </div>
            </header>

            <div className="flex flex-1 min-h-0 overflow-hidden p-2 md:p-4 gap-4">
                <div className="flex-1 flex flex-col min-h-0 max-w-3xl mx-auto">

                    <div className="chat-scroll flex-1 overflow-y-auto rounded-lg bg-zinc-800 p-4 mb-3">
                        <ChatMessages func={deleteMessage} messages={messages} />
                        <div ref={messagesEndRef} />
                    </div>

                    <ChatInput onSend={handleSend} />
                </div>

                <div className="hidden md:block w-64 shrink-0">
                    <UserList usernames={usernames} />
                </div>
            </div>

            {showUsers && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setShowUsers(false)}
                    />

                    <div className="absolute right-0 top-0 h-full w-72 bg-neutral-900 border-l border-neutral-800 flex flex-col">
                        <div className="flex justify-between items-center pt-4 pb-3 px-5 border-b border-neutral-800">
                            <button
                                onClick={() => router.push('/')}
                                className="text-black rounded-sm text-sm px-2 py-0.5 bg-red-400"
                            >
                                Leave
                            </button>
                            <button
                                onClick={() => setShowUsers(false)}
                                className="text-zinc-400 px-2 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <UserList usernames={usernames} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}