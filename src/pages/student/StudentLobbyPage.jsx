import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sparkles, Gamepad2, ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PlayerList } from '../../components/game/PlayerList';
import { getGame } from '../../services/api/games';

export const StudentLobbyPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [playerSession, setPlayerSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Read student session from sessionStorage
  useEffect(() => {
    const rawSession = sessionStorage.getItem('yahoot_player');
    if (!rawSession) {
      // If no session found, redirect to join
      navigate(`/join?pin=${code}`);
      return;
    }
    try {
      const parsed = JSON.parse(rawSession);
      if (parsed.gameCode !== code) {
        navigate(`/join?pin=${code}`);
        return;
      }
      setPlayerSession(parsed);
    } catch {
      navigate(`/join?pin=${code}`);
    }
  }, [code, navigate]);

  // Fetch and poll game status
  useEffect(() => {
    let isMounted = true;

    const fetchGame = async () => {
      try {
        const data = await getGame(code);
        if (!isMounted || !data) return;
        setGame(prev => ({ ...(prev || {}), ...data }));
        setError('');

        // If host has already started question, immediately transition
        if (data.status === 'question' || data.status === 'feedback') {
          navigate(`/game/${code}/play`);
        }
      } catch (err) {
        if (!isMounted) return;
        if (!game) {
          setError(err.message || 'Gagal memuat sesi kuis.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchGame();
    // Poll every 1 second for game start
    const interval = setInterval(fetchGame, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [code, navigate]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-display font-bold text-slate-700">Menghubungkan ke Lobi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <p className="font-display font-black text-xl text-red-600 mb-2">Terjadi Kesalahan</p>
          <p className="text-sm text-slate-600 mb-5">{error}</p>
          <Link
            to="/join"
            className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-display font-bold rounded-block border-2 border-slate-900 shadow-block"
          >
            Kembali ke Join
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] game-grid-pattern py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <Card className="bg-amber-300 border-3 text-center shadow-block-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-slate-900 rounded-block font-display font-black text-xs text-slate-950 mb-3 shadow-block-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Kamu Sudah Masuk!</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-950 mb-1">
            {playerSession?.nickname || 'Murid'}
          </h1>
          <p className="text-sm font-semibold text-slate-800">
            Kuis: {game?.quizTitle}
          </p>

          <div className="mt-5 p-3 bg-white/80 border-2 border-slate-900 rounded-block inline-flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs sm:text-sm font-display font-bold text-slate-900">
              Menunggu guru memulai permainan...
            </span>
          </div>
        </Card>

        {/* Players in Lobby */}
        <Card className="bg-white">
          <PlayerList players={game?.players || []} />
        </Card>
      </div>
    </div>
  );
};
