import React, { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';

export const Timer = ({
  duration = 20,
  isRunning = true,
  onTimeUp,
  resetKey = null,
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
}) => {
  const safeDuration = Math.max(5, Number(duration) || 20);
  const [timeLeft, setTimeLeft] = useState(safeDuration);
  const onTimeUpCalledRef = useRef(false);

  // Reset timer whenever duration or resetKey (new question) changes
  useEffect(() => {
    setTimeLeft(safeDuration);
    onTimeUpCalledRef.current = false;
  }, [safeDuration, resetKey]);

  useEffect(() => {
    if (!isRunning) return;

    // Never trigger onTimeUp immediately on initial render if safeDuration is valid
    if (timeLeft <= 0) {
      if (!onTimeUpCalledRef.current) {
        onTimeUpCalledRef.current = true;
        if (onTimeUp) onTimeUp();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!onTimeUpCalledRef.current) {
            onTimeUpCalledRef.current = true;
            if (onTimeUp) onTimeUp();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onTimeUp, safeDuration]);

  const percentage = Math.max(0, Math.min(100, (timeLeft / duration) * 100));
  const isUrgent = timeLeft <= 5 && timeLeft > 0;
  const isZero = timeLeft === 0;

  // Neo-brutalist styling & urgency color transitions
  let badgeColor = 'bg-emerald-400 text-slate-950 border-slate-900';
  let barColor = 'bg-emerald-500';

  if (isUrgent) {
    badgeColor = 'bg-red-500 text-white border-red-950 animate-pulse';
    barColor = 'bg-red-500';
  } else if (timeLeft <= Math.ceil(duration / 2)) {
    badgeColor = 'bg-amber-300 text-slate-950 border-slate-900';
    barColor = 'bg-amber-400';
  }

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {/* Top Countdown Label and Number Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-display font-black text-xs sm:text-sm text-slate-900">
          <Clock className={`w-4 h-4 shrink-0 ${isUrgent ? 'text-red-600 animate-bounce' : 'text-slate-800'}`} />
          <span>Sisa Waktu:</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`font-display font-black text-xs sm:text-sm px-2.5 py-0.5 border-2 rounded-block shadow-block-xs transition-colors shrink-0 ${badgeColor}`}
          >
            {isZero ? 'Waktu Habis!' : `${timeLeft} detik`}
          </span>
          <span className="text-[11px] font-bold text-slate-500 shrink-0 hidden sm:inline">
            / {duration}s
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="w-full h-3 sm:h-3.5 bg-slate-200 border-2 border-slate-900 rounded-full p-0.5 overflow-hidden shadow-block-xs"
        role="progressbar"
        aria-valuenow={timeLeft}
        aria-valuemin={0}
        aria-valuemax={duration}
      >
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
