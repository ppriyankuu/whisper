// import { useRoomContext } from '@/app/room/[roomId]/page'; // We'll avoid context; instead pass messages

// Instead, we'll search messages in parent
// So let's refactor: pass full messages map to ChatMessageItem

// But for simplicity here, we’ll just show "↩️ Replying..." 
// In real app: pass a `findMessage` function

export default function ReplyPreview({ replyToId }: { replyToId: string }) {
    return (
        <div className="text-xs text-zinc-400 mb-1 italic">
            ↩️ Replying...
        </div>
    );
}