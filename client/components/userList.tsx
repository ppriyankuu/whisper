import { useRouter } from "next/navigation";

export default function UserList({ usernames }: { usernames: string[] }) {
    const router = useRouter();

    return (
        <aside className="h-full">
            <div className="h-full bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900">
                    <div>
                        <h3 className="text-sm sm:text-base font-semibold text-white">
                            Active Users
                        </h3>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider">
                            Live Session
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-emerald-900/40 px-2.5 py-1 rounded-full">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-400">
                            {usernames.length}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {usernames.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-neutral-600 text-sm">
                            Waiting for people…
                        </div>
                    ) : (
                        usernames.map((name, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between gap-3 p-3 rounded-md bg-neutral-800/60 hover:bg-neutral-800 transition sm:hover:-translate-y-px"
                            >
                                {/* User */}
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative shrink-0">
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-neutral-700 flex items-center justify-center font-bold text-sm text-white">
                                            {name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-neutral-900 rounded-full" />
                                    </div>

                                    <p className="text-sm font-medium text-white truncate">
                                        {name}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {/* Footer */}
                <div className="px-4 py-2 border-t border-neutral-800 text-[10px] text-neutral-500 flex justify-between items-center">
                    <span>Secure Room</span>
                    <span>{usernames.length} Online</span>

                    {/* Leave button — mobile only */}
                    <button
                        onClick={() => router.push('/')}
                        className="hidden sm:block text-black rounded-md bg-red-400 px-1 py-0.5 hover:bg-red-500 text-[10px] font-medium ml-2"
                    >
                        Leave
                    </button>
                </div>
            </div>
        </aside>
    );
}
