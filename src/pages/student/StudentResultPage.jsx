import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Trophy, Award, Medal, Home, RotateCcw } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getResults } from '../../services/api/games';

export const StudentResultPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const [playerSession, setPlayerSession] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const rawSession = sessionStorage.getItem('yahoot_player');
    if (rawSession) {
      try {
        setPlayerSession(JSON.parse(rawSession));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (!playerSession?.gameId) return;

    const fetchFinalResults = async () => {
      try {
        const data = await getResults(playerSession.gameId);
        setResults(data);
      } catch (err) {
        setError(err.message || 'Gagal memuat hasil kuis.');
      } finally {
        setLoading(false);
      }
    };

    fetchFinalResults();
  }, [playerSession]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-display font-bold text-slate-700">Menghitung Peringkat Akhir...</p>
        </div>
      </div>
    );
  }

  const myResult = results?.players?.find(p => p.playerId === playerSession?.playerId);
  const rank = myResult?.rank || 1;
  const isPodium = rank <= 3;

  return (
    <div className="min-h-[calc(100vh-4rem)] game-grid-pattern py-8 px-4 sm:px-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Celebration Podium Card */}
        <Card className={`text-center border-3 shadow-block-xl ${isPodium ? 'bg-amber-300' : 'bg-white'}`}>
          <div className="w-20 h-20 bg-white border-3 border-slate-900 rounded-block mx-auto flex items-center justify-center shadow-block mb-4">
            {rank === 1 ? (
              <Trophy className="w-10 h-10 text-amber-500 fill-amber-500" />
            ) : rank <= 3 ? (
              <Medal className="w-10 h-10 text-indigo-600" />
            ) : (
              <Award className="w-10 h-10 text-slate-700" />
            )}
          </div>

          <Badge variant={isPodium ? 'primary' : 'neutral'} size="lg" className="mb-2">
            Peringkat #{rank}
          </Badge>

          <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-950 mb-1">
            {playerSession?.nickname || 'Murid Hebat'}
          </h1>
          <p className="text-sm font-semibold text-slate-700">
            {rank === 1
              ? 'Luar Biasa! Kamu Juara 1 Kuis Ini!'
              : rank <= 3
              ? 'Kerja Bagus! Kamu Berhasil Masuk 3 Besar!'
              : 'Permainan yang Seru! Tetap Semangat!'}
          </p>

          <div className="mt-6 p-4 bg-white border-2 border-slate-900 rounded-block shadow-block-sm flex items-center justify-around">
            <div>
              <p className="text-xs uppercase font-bold text-slate-500">Total Skor</p>
              <p className="font-display font-black text-2xl text-slate-950">{myResult?.score || 0}</p>
            </div>
            <div className="h-8 w-px bg-slate-300" />
            <div>
              <p className="text-xs uppercase font-bold text-slate-500">Peringkat</p>
              <p className="font-display font-black text-2xl text-slate-950">#{rank}</p>
            </div>
          </div>
        </Card>

        {/* Mini Leaderboard */}
        <Card className="bg-white">
          <h3 className="font-display font-black text-lg text-slate-950 mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Peringkat Teratas</span>
          </h3>

          <div className="space-y-2">
            {(results?.players || []).slice(0, 5).map((p) => {
              const isMe = p.playerId === playerSession?.playerId;
              return (
                <div
                  key={p.playerId}
                  className={`flex items-center justify-between p-2.5 rounded-block border-2 ${
                    isMe
                      ? 'bg-amber-100 border-slate-900 font-bold shadow-block-sm'
                      : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center font-display font-black text-sm">
                      {p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : `#${p.rank}`}
                    </span>
                    <span className="font-display text-sm truncate max-w-[150px]">
                      {p.nickname} {isMe && '(Kamu)'}
                    </span>
                  </div>
                  <span className="font-display font-black text-sm text-slate-900">
                    {p.score} pt
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Navigation Action Buttons */}
        <div className="space-y-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              sessionStorage.removeItem('yahoot_player');
              navigate('/join');
            }}
          >
            <RotateCcw className="w-5 h-5 mr-2 stroke-[2.5]" />
            <span>Gabung Kuis Lainnya</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => navigate('/')}
          >
            <Home className="w-4 h-4 mr-2" />
            <span>Kembali ke Beranda</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
