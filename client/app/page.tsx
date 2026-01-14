'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function generateId(): string {
  return crypto.randomUUID().slice(0, 6);
}

export default function Home() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState('')

  const handleJoinRoom = () => {
    const trimmed = roomCode.trim();
    if (!trimmed) return;
    router.push(`/room/${trimmed}`)
  }

  const handleCreateRoom = () => {
    const id = generateId()
    router.push(`/room/${id}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-linear-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Whisper🎗️
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Free, anonymous chat rooms.<br /> No sign-up needed—just create, share the code, and start chatting.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleCreateRoom}
            className="w-full py-3 bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg"
          >
            Create Room
          </button>

          <div className="flex gap-2">
            <input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && handleJoinRoom()}
              placeholder="Enter room code"
              className="flex-1 py-3 text-center rounded-lg bg-zinc-800"
            />
            <button
              onClick={handleJoinRoom}
              disabled={!roomCode.trim()}
              className="px-5 bg-zinc-700 rounded-lg disabled:opacity-50"
            >
              Join
            </button>
          </div>

          <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-xs text-zinc-400">
            <span className="font-medium bg-zinc-700 text-zinc-400 px-1 rounded">Note:</span>{" "}
            The backend runs on a free tier. If no one’s using it, it goes to sleep 😴
            <br />
            So when you open this, it’s probably waking up.
            <br />
            Give it a bit of time — sometimes it takes a minute or two.
          </div>
        </div>
      </div>
    </div>
  )
}

