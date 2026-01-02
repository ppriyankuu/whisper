import { ChatMessage } from "../types";
import ChatMessageItem from "./message";

export default function ChatMessages({ messages, func }: { messages: ChatMessage[], func: (value: string) => void }) {
    return (
        <div className="space-y-4">
            {messages.length === 0 ? (
                <p className="text-center text-zinc-500 py-8">No messages yet...</p>
            ) : (
                messages.map((message) => (
                    <ChatMessageItem
                        key={message.id}
                        message={message}
                        messages={messages}
                        deleteMessage={func}
                    />
                ))
            )}
        </div>
    );
}