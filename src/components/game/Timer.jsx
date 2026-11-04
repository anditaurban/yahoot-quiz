import React, { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';

export const Timer = ({
  duration = 20,
  initialTimeLeft = null,
  isRunning = true,
  onTimeUp,
  resetKey = null,
  showSeconds = false,
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
}) => {
  const safeDuration = Math.max(5, Number(duration) || 20);
  const getInitialTime = () => {
    if (initialTimeLeft !== null && initialTimeLeft !== undefined) {
      return Math.max(0, Math.min(safeDuration, Number(initialTimeLeft)));
    }
    return safeDuration;
  };

  const [timeLeft, setTimeLeft] = useState(getInitialTime);
  const onTimeUpCalledRef = useRef(false);

  // Reset timer whenever duration, resetKey (new question), or initialTimeLeft changes
  useEffect(() => {
    setTimeLeft(getInitialTime());
    onTimeUpCalledRef.current = false;
  }, [safeDuration, resetKey, initialTimeLeft]);

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

  const percentage = Math.max(0, Math.min(100, (timeLeft / safeDuration) * 100));
  const isUrgent = timeLeft <= 5 && timeLeft > 0;
  const isZero = timeLeft === 0;

  // Neo-brutalist styling & urgency color transitions
  let barColor = 'bg-emerald-500';
  let badgeColor = 'bg-emerald-400 text-slate-950 border-slate-900';

  if (isUrgent) {
    barColor = 'bg-red-500';
    badgeColor = 'bg-red-500 text-white border-red-950 animate-pulse';
  } else if (timeLeft <= Math.ceil(safeDuration / 2)) {
    barColor = 'bg-amber-400';
    badgeColor = 'bg-amber-300 text-slate-950 border-slate-900';
  }

  return (
    <div className={`w-full flex items-center gap-2 ${className}`}>
      {/* Visual Clock Icon with Pulse/Urgency */}
      <Clock
        className={`w-4 h-4 shrink-0 transition-colors ${
          isUrgent ? 'text-red-600 animate-bounce' : 'text-slate-800'
        }`}
      />

      {/* Clean Running Progress Bar (No seconds digits to avoid pressure) */}
      <div
        className="flex-1 min-w-0 h-3 sm:h-3.5 bg-slate-200 border-2 border-slate-900 rounded-full p-0.5 overflow-hidden shadow-block-xs"
        role="progressbar"
        aria-valuenow={timeLeft}
        aria-valuemin={0}
        aria-valuemax={safeDuration}
        aria-label="Sisa Waktu Menjawab"
      >
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Optional seconds countdown only if explicitly requested */}
      {showSeconds && (
        <span
          className={`font-display font-black text-xs px-2 py-0.5 border-2 rounded-block shadow-block-xs shrink-0 ${badgeColor}`}
        >
          {isZero ? 'Habis!' : `${timeLeft}s`}
        </span>
      )}
    </div>
  );
};
