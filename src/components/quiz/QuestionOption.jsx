import React from 'react';
import { Check, X } from 'lucide-react';

const OPTION_STYLES = [
  {
    symbol: '▲',
    label: 'A',
    bg: 'bg-red-500 text-white',
    hover: 'hover:bg-red-400',
    selectedRing: 'ring-4 ring-red-300',
  },
  {
    symbol: '◆',
    label: 'B',
    bg: 'bg-blue-600 text-white',
    hover: 'hover:bg-blue-500',
    selectedRing: 'ring-4 ring-blue-300',
  },
  {
    symbol: '●',
    label: 'C',
    bg: 'bg-amber-400 text-slate-950',
    hover: 'hover:bg-amber-300',
    selectedRing: 'ring-4 ring-amber-200',
  },
  {
    symbol: '■',
    label: 'D',
    bg: 'bg-emerald-500 text-slate-950',
    hover: 'hover:bg-emerald-400',
    selectedRing: 'ring-4 ring-emerald-300',
  },
];

export const QuestionOption = ({
  index = 0,
  option,
  isSelected = false,
  isLocked = false,
  isCorrect,
  showResult = false,
  onClick,
  keyboardShortcut,
  type = 'multiple_choice'
}) => {
  let style = OPTION_STYLES[index % OPTION_STYLES.length];

  // Specific True/False styling
  if (type === 'true_false') {
    if (String(option.id).toLowerCase() === 'true') {
      style = {
        symbol: '✓',
        label: 'TRUE',
        bg: 'bg-emerald-500 text-slate-950',
        hover: 'hover:bg-emerald-400',
        selectedRing: 'ring-4 ring-emerald-300',
      };
    } else {
      style = {
        symbol: '✕',
        label: 'FALSE',
        bg: 'bg-red-500 text-white',
        hover: 'hover:bg-red-400',
        selectedRing: 'ring-4 ring-red-300',
      };
    }
  }

  // Determine feedback visual state
  let feedbackClasses = "";
  if (showResult) {
    if (isCorrect === true) {
      feedbackClasses = "ring-4 ring-emerald-400 scale-[1.02] shadow-block-lg";
    } else if (isCorrect === false && isSelected) {
      feedbackClasses = "opacity-60 grayscale-[30%]";
    } else if (!isSelected) {
      feedbackClasses = "opacity-40";
    }
  } else if (isSelected) {
    feedbackClasses = "ring-4 ring-slate-950 -translate-y-1 shadow-block-lg";
  }

  return (
    <button
      type="button"
      disabled={isLocked}
      onClick={() => onClick && onClick(option.id)}
      className={`w-full min-h-[72px] sm:min-h-[84px] p-4 sm:p-5 flex items-center gap-3.5 border-3 border-slate-900 rounded-block shadow-block transition-all duration-100 select-none text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 ${
        style.bg
      } ${
        !isLocked ? `${style.hover} cursor-pointer active:translate-y-0.5 active:shadow-block-sm` : 'cursor-default'
      } ${feedbackClasses}`}
      aria-pressed={isSelected}
    >
      {/* Geometric Shape Icon */}
      <span className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 bg-black/20 border-2 border-slate-900/40 rounded-block flex items-center justify-center font-display font-black text-xl sm:text-2xl">
        {style.symbol}
      </span>

      {/* Option Text */}
      <span className="flex-1 min-w-0 font-display font-bold text-base sm:text-lg md:text-xl leading-snug break-words">
        {option.text}
      </span>

      {/* Selected Indicator / Result Indicator */}
      {showResult ? (
        isCorrect ? (
          <span className="w-8 h-8 rounded-full bg-emerald-400 text-slate-950 border-2 border-slate-900 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 stroke-[3]" />
          </span>
        ) : isSelected ? (
          <span className="w-8 h-8 rounded-full bg-red-400 text-white border-2 border-slate-900 flex items-center justify-center shrink-0">
            <X className="w-5 h-5 stroke-[3]" />
          </span>
        ) : null
      ) : isSelected ? (
        <span className="w-8 h-8 rounded-full bg-white text-slate-950 border-2 border-slate-900 flex items-center justify-center shrink-0 shadow-sm font-bold">
          ✓
        </span>
      ) : keyboardShortcut ? (
        <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono font-bold bg-black/15 rounded border border-black/20">
          [{keyboardShortcut}]
        </span>
      ) : null}
    </button>
  );
};
