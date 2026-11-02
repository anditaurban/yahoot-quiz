import React from 'react';
import { Badge } from '../ui/Badge';
import { Timer } from '../game/Timer';

export const QuestionCard = ({
  question,
  currentIndex = 0,
  totalQuestions = 1,
  timeLimit = 20,
  showTimer = true,
  timerRunning = true,
  onTimeUp,
  type = 'multiple_choice',
  className = ''
}) => {
  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="md">
            Soal {currentIndex + 1} dari {totalQuestions}
          </Badge>
          <Badge variant="neutral" size="sm">
            {type === 'true_false' ? 'Benar / Salah' : type === 'short_answer' ? 'Ketik Isian Singkat' : 'Pilihan Ganda'}
          </Badge>
        </div>

        {showTimer && (
          <Timer
            duration={timeLimit}
            isRunning={timerRunning}
            onTimeUp={onTimeUp}
            size="sm"
          />
        )}
      </div>

      {/* Main Question Display */}
      <div className="p-6 sm:p-8 bg-white border-3 border-slate-900 rounded-block shadow-block-lg text-center min-h-[140px] flex items-center justify-center">
        <h2 className="font-display font-black text-xl sm:text-2xl md:text-3xl text-slate-950 leading-snug">
          {question}
        </h2>
      </div>
    </div>
  );
};
