import { useEffect, useState, useRef } from "react";
import { Play, Pause, X, RotateCcw, BellRing } from "lucide-react";

export default function RestTimer({
    isActive,
    onClose,
    defaultSeconds = 90
}: {
    isActive: boolean;
    onClose: () => void;
    defaultSeconds?: number;
}) {
    const [timeLeft, setTimeLeft] = useState(defaultSeconds);
    const [isPaused, setIsPaused] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Reset when activated
    useEffect(() => {
        if (isActive) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTimeLeft(defaultSeconds);
            setIsPaused(false);
        }
    }, [isActive, defaultSeconds]);

    // Timer countdown logic
    useEffect(() => {
        if (!isActive || isPaused || timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                const next = prev - 1;
                if (next === 0) {
                    audioRef.current?.play().catch(console.error);
                }
                return next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, isPaused, timeLeft]);

    if (!isActive) return null;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const isDone = timeLeft === 0;

    return (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
            <div className={`flex items-center gap-4 px-6 py-3 rounded-full shadow-2xl border transition-colors
                ${isDone ? "bg-brand-600 border-brand-400" : "bg-surface border-surface-border"}`}>
                
                {/* Audio element for the ding */}
                <audio ref={audioRef} src="/assets/ding.mp3" preload="auto" />

                <div className="flex items-center gap-2">
                    <BellRing className={`w-5 h-5 ${isDone ? "text-white animate-bounce" : "text-brand-400"}`} />
                    <span className={`text-2xl font-mono font-bold font-variant-numeric:tabular-nums
                        ${isDone ? "text-white" : "text-text"}`}>
                        {formatTime(timeLeft)}
                    </span>
                </div>

                <div className="flex items-center gap-2 border-l border-white/20 pl-4">
                    {!isDone && (
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
                        >
                            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                        </button>
                    )}
                    <button
                        onClick={() => { setTimeLeft(defaultSeconds); setIsPaused(false); }}
                        className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors ml-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
