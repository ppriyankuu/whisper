'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import {
    PaperAirplaneIcon,
    PaperClipIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useRoom } from '../lib/roomContext';
import { FileMeta } from '../types';

export default function ChatInput({
    onSend,
}: {
    onSend: (payload: {
        content?: string;
        replyTo?: string;
        file?: FileMeta;
    }) => void;

}) {
    const { roomId, userId, repliedMessage, clearReply } = useRoom();

    const [input, setInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    const handleSend = async () => {
        if ((!input.trim() && !selectedFile) || !roomId || !userId) return;

        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) {
                toast.error('File too large (max 10MB)');
                return;
            }

            setUploading(true);
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload?roomId=${roomId}&userId=${userId}`,
                    {
                        method: 'POST',
                        body: selectedFile,
                        headers: {
                            'x-filename': selectedFile.name,
                        },
                    }
                );

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || 'Upload failed');
                }

                const meta: FileMeta = await res.json();

                onSend({
                    file: meta,
                    replyTo: repliedMessage?.id,
                });
            } catch (err: any) {
                toast.error(err.message || 'Upload failed');
                setUploading(false);
                return;
            }
        } else {
            onSend({
                content: input,
                replyTo: repliedMessage?.id,
            });
        }

        setInput('');
        setSelectedFile(null);
        clearReply();
        setUploading(false);

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Reply preview */}
            {repliedMessage && (
                <div className="flex items-start gap-2 bg-zinc-800 rounded-lg p-2 text-sm">
                    <div className="flex-1">
                        <div className="text-indigo-400">
                            Replying to {repliedMessage.username}
                        </div>
                        <div className="truncate max-w-xs">
                            {repliedMessage.file?.name ??
                                repliedMessage.content}
                        </div>
                    </div>
                    <button
                        onClick={clearReply}
                        className="text-zinc-500 hover:text-white"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* File preview */}
            {selectedFile && (
                <div className="flex items-center justify-between bg-zinc-800 rounded-lg px-3 py-2 text-sm">
                    <div className="truncate">
                        📎 {selectedFile.name}
                    </div>
                    <button
                        onClick={() => setSelectedFile(null)}
                        className="text-zinc-400 hover:text-white"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onFocus={(e) => {
                        e.currentTarget.scrollIntoView({
                            block: "nearest",
                            behavior: "smooth",
                        });
                    }}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 bg-zinc-800 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-600 max-h-24"
                    rows={1}
                />

                <div className="flex flex-col gap-1">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="p-2 text-zinc-400 hover:text-white disabled:opacity-50"
                    >
                        <PaperClipIcon className="w-5 h-5" />
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) =>
                            setSelectedFile(e.target.files?.[0] ?? null)
                        }
                    />

                    <button
                        onClick={handleSend}
                        disabled={
                            uploading ||
                            (!input.trim() && !selectedFile)
                        }
                        className="p-2 bg-indigo-600 rounded-lg disabled:opacity-50 hover:bg-indigo-700"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
