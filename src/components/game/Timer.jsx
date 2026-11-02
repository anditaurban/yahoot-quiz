import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export const Timer = ({
  duration = 20,
  isRunning = true,
  onTimeUp,
  size = 'md', // 'sm' | 'md' | 'lg'
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft === 0 && onTimeUp) {
        onTimeUp();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onTimeUp]);

  const percentage = Math.max(0, Math.min(100, (timeLeft / duration) * 100));
  const isUrgent = timeLeft <= 5 && timeLeft > 0;
  const isZero = timeLeft === 0;

  // Color schemes
  let colorBadge = "bg-emerald-400 text-slate-950";
  let barColor = "bg-emerald-500";
  if (isUrgent) {
    colorBadge = "bg-red-500 text-white animate-pulse";
    barColor = "bg-red-500";
  } else if (timeLeft <= 10) {
    colorBadge = "bg-amber-400 text-slate-950";
    barColor = "bg-amber-400";
  }

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-1.5 font-display font-black text-sm">
        <Clock className="w-4 h-4" />
        <span className={`px-2 py-0.5 border-2 border-slate-900 rounded-md ${colorBadge}`}>
          {timeLeft}s
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5 w-full max-w-[200px]">
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center justify-center font-display font-black border-2 border-slate-900 rounded-block shadow-block transition-all ${
            size === 'lg' ? 'w-16 h-16 text-3xl' : 'w-12 h-12 text-2xl'
          } ${colorBadge}`}
        >
          {timeLeft}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-slate-200 border-2 border-slate-900 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {isZero && (
        <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
          Waktu Habis!
        </span>
      )}
    </div>
  );
};
