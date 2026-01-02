'use client';

import { useEffect, useState } from 'react';
import { formatTime } from '../lib/utils';

const WARN_TIMES = [
    { ms: 30 * 60 * 1000, label: '30 minutes left' },
    { ms: 15 * 60 * 1000, label: '15 minutes left' },
    { ms: 5 * 60 * 1000, label: '5 minutes left' },
];

export default function CountdownTimer({
    expiresAt,
    onAlmostExpired,
}: {
    expiresAt: number;
    onAlmostExpired: (label: string) => void;
}) {
    const [timeLeft, setTimeLeft] = useState(expiresAt - Date.now());
    const [firedWarnings, setFiredWarnings] = useState<Set<number>>(new Set());

    useEffect(() => {
        const timer = setInterval(() => {
            const remaining = expiresAt - Date.now();
            setTimeLeft(remaining);

            WARN_TIMES.forEach(({ ms, label }) => {
                if (
                    remaining <= ms &&
                    remaining > ms - 1000 &&
                    !firedWarnings.has(ms)
                ) {
                    onAlmostExpired(label);
                    setFiredWarnings(prev => new Set(prev).add(ms));
                }
            });

            if (remaining <= 0) clearInterval(timer);
        }, 1000);

        return () => clearInterval(timer);
    }, [expiresAt, firedWarnings, onAlmostExpired]);

    if (timeLeft <= 0) {
        return <span className="text-red-400 text-sm">Expired</span>;
    }

    return (
        <div className="flex flex-col leading-tight">
            <span
                className={`font-mono text-sm ${timeLeft <= 5 * 60 * 1000
                    ? 'text-red-400'
                    : timeLeft <= 10 * 60 * 1000
                        ? 'text-orange-400'
                        : 'text-zinc-300'
                    }`}
            >
                {formatTime(timeLeft)}
            </span>
            <span className="text-xs text-zinc-600">
                Time left
            </span>
        </div>
    );
}
