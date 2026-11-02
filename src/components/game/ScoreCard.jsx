import React from 'react';
import { Trophy, Flame, Award } from 'lucide-react';
import { Card } from '../ui/Card';

export const ScoreCard = ({
  score = 0,
  rank,
  streak = 0,
  pointsEarned = 0,
  isCorrect,
  nickname,
  className = ''
}) => {
  return (
    <Card className={`max-w-md w-full mx-auto ${className}`}>
      {/* Feedback banner if provided */}
      {isCorrect !== undefined && (
        <div
          className={`p-4 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 mb-5 border-b-2 border-slate-900 text-center font-display font-black text-xl sm:text-2xl ${
            isCorrect
              ? 'bg-emerald-400 text-slate-950'
              : 'bg-red-400 text-slate-950'
          }`}
        >
          {isCorrect ? 'Jawaban Benar!' : 'Kurang Tepat!'}
          {isCorrect && pointsEarned > 0 && (
            <div className="text-base font-bold text-slate-900 mt-1">
              +{pointsEarned} Poin
            </div>
          )}
        </div>
      )}

      {/* Nickname */}
      {nickname && (
        <div className="text-center mb-4">
          <p className="text-xs uppercase font-bold tracking-wider text-slate-500">
            Profil Pemain
          </p>
          <h3 className="font-display font-black text-xl text-slate-900">
            {nickname}
          </h3>
        </div>
      )}

      {/* Score Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Total Score */}
        <div className="p-3 bg-amber-100 border-2 border-slate-900 rounded-block text-center shadow-block-sm">
          <div className="flex items-center justify-center gap-1 text-amber-800 mb-1">
            <Trophy className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase">Skor</span>
          </div>
          <p className="font-display font-black text-2xl text-slate-950">
            {score}
          </p>
        </div>

        {/* Rank */}
        {rank !== undefined && (
          <div className="p-3 bg-indigo-100 border-2 border-slate-900 rounded-block text-center shadow-block-sm">
            <div className="flex items-center justify-center gap-1 text-indigo-800 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase">Peringkat</span>
            </div>
            <p className="font-display font-black text-2xl text-slate-950">
              #{rank}
            </p>
          </div>
        )}

        {/* Streak */}
        <div className="p-3 bg-rose-100 border-2 border-slate-900 rounded-block text-center shadow-block-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-center gap-1 text-rose-800 mb-1">
            <Flame className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase">Beruntun</span>
          </div>
          <p className="font-display font-black text-2xl text-slate-950">
            {streak} 🔥
          </p>
        </div>
      </div>
    </Card>
  );
};
