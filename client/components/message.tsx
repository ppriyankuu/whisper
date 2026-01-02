
import { useRoom } from "../lib/roomContext";
import { ChatMessage } from "../types";

export default function ChatMessageItem({
    message,
    messages,
    deleteMessage
}: {
    message: ChatMessage;
    messages: ChatMessage[];
    deleteMessage: (messageId: string) => void;
}) {
    const { userId, setRepliedMessage, repliedMessage } = useRoom();
    const isOwner = message.userId === userId;

    const repliedToMessage = message.replyTo
        ? messages.find((m) => m.id === message.replyTo)
        : null;

    const handleReply = () => {
        setRepliedMessage(message);
    };

    const isCurrentlyReplied = repliedMessage?.id === message.id;

    const fixedUrl = message.file?.url
        ? message.file.url.replace(/^https:\/\/https\/\//, 'https://')
        : undefined;

    return (
        <div
            className={`flex ${isOwner ? "justify-end" : "justify-start"} px-2 py-1`}
            onDoubleClick={handleReply}
        >
            <div
                className={`max-w-[80%] relative rounded-lg px-3 ${isOwner ? "pt-6" : "pt-1.5"} pb-1 cursor-pointer transition-all duration-150 flex flex-col justify-between min-h-9 ${isCurrentlyReplied
                    ? "ring-1 ring-indigo-400 bg-opacity-90"
                    : isOwner
                        ? "bg-indigo-600 rounded-tr-none"
                        : "bg-zinc-700 rounded-tl-none"
                    }`}
                onClick={handleReply}
            >
                {/* Delete button — top right */}
                {isOwner && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteMessage(message.id);
                        }}
                        className="absolute top-1 right-1 text-xs text-zinc-300 z-10 underline"
                        aria-label="Delete message"
                    >
                        delete
                    </button>
                )}

                {/* 🔁 Reply preview */}
                {repliedToMessage && (
                    <div className="mb-1 border-l border-indigo-300/80 rounded-r-md pt-0.5 pr-1 bg-zinc-800/60 pl-2 text-[0.68rem] text-zinc-300">
                        <div className="font-semibold text-indigo-300 italic leading-tight truncate">
                            {repliedToMessage.userId === userId ? "You" : repliedToMessage.username}
                        </div>
                        <div className="truncate opacity-90">
                            {repliedToMessage.content || "📎 Attachment"}
                        </div>
                    </div>
                )}

                {/* Username for others */}
                {!isOwner && (
                    <div className="text-[0.72rem] font-semibold text-blue-500 italic mb-0.5 leading-tight">
                        {message.username}
                    </div>
                )}

                {/* Message content */}
                <div className="flex-1">
                    {message.file ? (
                        <div className="border border-indigo-500/60 bg-indigo-500/5 rounded px-2 py-1.5">
                            <div className="flex items-center gap-1.5 text-indigo-200 text-[0.82rem] font-medium">
                                📎 <span className="truncate">{message.file.name}</span>
                            </div>
                            <a
                                href={fixedUrl}
                                download={message.file.name}
                                className="block text-[0.72rem] text-indigo-300 hover:underline mt-0.5"
                            >
                                Download
                            </a>
                        </div>
                    ) : (
                        <p className="text-sm whitespace-pre-wrap text-white leading-[1.3]">
                            {message.content}
                        </p>
                    )}
                </div>

                {/* Timestamp — bottom right */}
                <div className="text-xs text-right mt-0.5 text-zinc-400 whitespace-nowrap">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </div>
            </div>
        </div>
    );
}

