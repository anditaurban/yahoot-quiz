import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const GameCode = ({ code, size = 'lg', showCopy = true }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const digits = String(code || '-----').split('');

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <span className="text-xs uppercase tracking-widest font-display font-black text-slate-600 bg-slate-200/80 px-3 py-0.5 rounded border border-slate-400">
        PIN GAME
      </span>
      
      <div className="flex items-center gap-1.5 sm:gap-2">
        {digits.map((digit, index) => (
          <div
            key={index}
            className={`flex items-center justify-center font-display font-black bg-white border-2 sm:border-3 border-slate-900 shadow-block text-slate-950 rounded-block ${
              size === 'lg'
                ? 'w-11 h-14 sm:w-16 sm:h-20 text-2xl sm:text-4xl'
                : 'w-8 h-10 sm:w-10 sm:h-12 text-lg sm:text-2xl'
            }`}
          >
            {digit}
          </div>
        ))}

        {showCopy && (
          <button
            onClick={handleCopy}
            title="Salin PIN Game"
            className="ml-2 p-2.5 sm:p-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-slate-900 rounded-block shadow-block transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-block-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label="Salin PIN Game"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-950 stroke-[3]" /> : <Copy className="w-5 h-5 stroke-[2.5]" />}
          </button>
        )}
      </div>

      {copied && (
        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
          PIN berhasil disalin!
        </span>
      )}
    </div>
  );
};
