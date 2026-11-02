import React from 'react';
import { Users, UserPlus } from 'lucide-react';
import { Button } from '../ui/Button';

// Diverse blocky color palettes for player avatars
const AVATAR_COLORS = [
  'bg-amber-400 text-slate-950',
  'bg-emerald-400 text-slate-950',
  'bg-sky-400 text-slate-950',
  'bg-indigo-500 text-white',
  'bg-rose-400 text-slate-950',
  'bg-teal-400 text-slate-950',
  'bg-orange-400 text-slate-950',
  'bg-purple-400 text-slate-950',
];

export const PlayerList = ({
  players = [],
  onAddBot,
  maxDisplay,
  showAddDemo = false
}) => {
  const displayPlayers = maxDisplay ? players.slice(0, maxDisplay) : players;

  return (
    <div className="w-full">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 text-white border-2 border-slate-900 rounded-block shadow-block-sm">
            <Users className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-display font-black text-lg sm:text-xl text-slate-950">
            Peserta Bergabung
          </span>
          <span className="px-2.5 py-0.5 font-display font-black text-sm bg-amber-400 text-slate-950 border-2 border-slate-900 rounded-block shadow-block-sm">
            {players.length}
          </span>
        </div>

        {showAddDemo && onAddBot && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onAddBot}
            className="flex items-center gap-1.5"
            title="Tambah peserta simulasi untuk pengujian"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Simulasi Murid</span>
          </Button>
        )}
      </div>

      {/* Players grid or empty state */}
      {players.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-400 rounded-block text-center">
          <div className="w-12 h-12 rounded-block bg-slate-200 border-2 border-slate-400 flex items-center justify-center text-slate-500 mb-2">
            <Users className="w-6 h-6" />
          </div>
          <p className="font-display font-bold text-slate-700 text-base">
            Belum ada murid yang bergabung
          </p>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
            Bagikan kode game atau minta murid membuka halaman join dan memasukkan kode.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {displayPlayers.map((player, idx) => {
            const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            return (
              <div
                key={player.id || idx}
                className="flex items-center gap-2.5 p-2.5 bg-white border-2 border-slate-900 rounded-block shadow-block animate-in fade-in duration-150"
              >
                <div
                  className={`w-9 h-9 shrink-0 border-2 border-slate-900 rounded-md flex items-center justify-center font-display font-black text-sm ${colorClass}`}
                >
                  {(player.nickname || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-bold text-sm text-slate-900 truncate">
                    {player.nickname}
                  </p>
                  {player.score !== undefined && (
                    <p className="text-[11px] font-semibold text-slate-500">
                      {player.score} poin
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
