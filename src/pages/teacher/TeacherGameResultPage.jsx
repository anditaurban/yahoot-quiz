import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Trophy, Medal, Award, Home, RotateCcw, Users } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getResults, getGameById } from '../../services/api/games';

export const TeacherGameResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const gameData = await getGameById(id);
        setGame(gameData);
        const resData = await getResults(id);
        setResults(resData);
      } catch (err) {
        setError(err.message || 'Gagal memuat hasil kuis.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-display font-bold text-slate-700">Mempersiapkan Podium Juara...</p>
        </div>
      </div>
    );
  }

  const players = results?.players || [];
  const p1 = players[0];
  const p2 = players[1];
  const p3 = players[2];

  return (
    <div className="min-h-[calc(100vh-4rem)] game-grid-pattern py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="text-center">
          <Badge variant="gold" size="lg" className="mb-2">
            HASIL FINAL KUIS
          </Badge>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-slate-950">
            {game?.quizTitle || 'Permainan Yahoot!'}
          </h1>
          <p className="text-slate-600 font-semibold text-sm mt-1">
            Total {players.length} Murid Berpartisipasi
          </p>
        </div>

        {/* 3D Sandbox Podium Display */}
        {players.length > 0 && (
          <div className="flex items-end justify-center gap-2 sm:gap-4 pt-8 pb-4">
            {/* 2nd Place */}
            {p2 ? (
              <div className="flex-1 max-w-[180px] flex flex-col items-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white border-2 border-slate-900 rounded-block flex items-center justify-center shadow-block-sm mb-2 font-display font-black text-slate-800">
                  🥈
                </div>
                <p className="font-display font-black text-xs sm:text-sm text-slate-900 truncate w-full text-center">
                  {p2.nickname}
                </p>
                <p className="font-bold text-xs text-slate-600 mb-2">{p2.score} pt</p>
                <div className="w-full h-32 sm:h-40 bg-slate-300 border-3 border-slate-900 rounded-t-block shadow-block flex items-center justify-center font-display font-black text-3xl text-slate-700">
                  2
                </div>
              </div>
            ) : (
              <div className="flex-1 max-w-[180px]" />
            )}

            {/* 1st Place (Center / Tallest) */}
            {p1 && (
              <div className="flex-1 max-w-[200px] flex flex-col items-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-300 border-3 border-slate-900 rounded-block flex items-center justify-center shadow-block mb-2 text-2xl sm:text-3xl">
                  👑
                </div>
                <p className="font-display font-black text-sm sm:text-base text-slate-950 truncate w-full text-center">
                  {p1.nickname}
                </p>
                <p className="font-display font-black text-xs sm:text-sm text-amber-700 mb-2">{p1.score} pt</p>
                <div className="w-full h-44 sm:h-56 bg-amber-400 border-3 border-slate-900 rounded-t-block shadow-block-lg flex items-center justify-center font-display font-black text-4xl sm:text-5xl text-slate-950">
                  1
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {p3 ? (
              <div className="flex-1 max-w-[180px] flex flex-col items-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white border-2 border-slate-900 rounded-block flex items-center justify-center shadow-block-sm mb-2 font-display font-black text-slate-800">
                  🥉
                </div>
                <p className="font-display font-black text-xs sm:text-sm text-slate-900 truncate w-full text-center">
                  {p3.nickname}
                </p>
                <p className="font-bold text-xs text-slate-600 mb-2">{p3.score} pt</p>
                <div className="w-full h-24 sm:h-28 bg-amber-700/30 border-3 border-slate-900 rounded-t-block shadow-block flex items-center justify-center font-display font-black text-2xl text-slate-700">
                  3
                </div>
              </div>
            ) : (
              <div className="flex-1 max-w-[180px]" />
            )}
          </div>
        )}

        {/* Full Leaderboard Table */}
        <Card className="bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-black text-lg text-slate-950 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Daftar Nilai Seluruh Peserta</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">
              {players.length} Pemain
            </span>
          </div>

          <div className="space-y-2">
            {players.map((p) => (
              <div
                key={p.playerId}
                className="flex items-center justify-between p-3 bg-slate-50 border-2 border-slate-900 rounded-block font-display text-sm hover:bg-amber-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-block bg-white border-2 border-slate-900 flex items-center justify-center font-black text-xs">
                    #{p.rank}
                  </span>
                  <span className="font-bold text-slate-900">{p.nickname}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-base text-slate-950">{p.score} pt</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/teacher')}
            className="w-full sm:w-auto"
          >
            <Home className="w-4 h-4 mr-2" />
            <span>Kembali ke Dashboard Guru</span>
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(`/teacher/games/${id}/lobby`)}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4 mr-2 stroke-[2.5]" />
            <span>Mainkan Lagi Kuis Ini</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
