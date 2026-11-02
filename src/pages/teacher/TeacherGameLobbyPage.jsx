import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Users, Sparkles, Share2, Copy, Check } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { GameCode } from '../../components/game/GameCode';
import { PlayerList } from '../../components/game/PlayerList';
import { getGameById, startGame, addDemoPlayer } from '../../services/api/games';

export const TeacherGameLobbyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBaseLink, setCopiedBaseLink] = useState(false);
  const [error, setError] = useState('');

  // Fetch and poll lobby state
  useEffect(() => {
    let isMounted = true;

    const fetchLobby = async () => {
      try {
        const gameData = await getGameById(id);
        if (!isMounted) return;
        if (!gameData) {
          setError('Sesi game tidak ditemukan.');
          return;
        }
        setGame({ ...gameData });
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Gagal memuat lobi game.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLobby();
    const interval = setInterval(fetchLobby, 1500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [id]);

  const handleStartGame = async () => {
    setStarting(true);
    setError('');
    try {
      await startGame(id);
      navigate(`/teacher/games/${id}/play`);
    } catch (err) {
      setError(err.message || 'Gagal memulai kuis.');
      setStarting(false);
    }
  };

  const handleAddDemoStudent = () => {
    const demoNames = ['Budi Santoso', 'Siti Rahma', 'Dewi Lestari', 'Rian Pratama', 'Ahmad Fikri', 'Nadia Putri'];
    const currentCount = game?.players?.length || 0;
    const name = demoNames[currentCount % demoNames.length] + ` #${currentCount + 1}`;
    const newPlayer = addDemoPlayer(id, name);
    if (newPlayer && game) {
      setGame(prev => ({
        ...prev,
        players: [...(prev.players || []), newPlayer]
      }));
    }
  };

  const currentHost = typeof window !== 'undefined' && window.location.host 
    ? window.location.host 
    : 'yahoot-quiz.anditaurban.workers.dev';
  const joinUrl = typeof window !== 'undefined' && window.location.origin 
    ? `${window.location.origin}/join` 
    : 'https://yahoot-quiz.anditaurban.workers.dev/join';

  const handleCopyJoinLink = () => {
    if (!game?.code) return;
    const url = `${joinUrl}?pin=${game.code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-display font-bold text-slate-700">Membuka Lobi Game...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <p className="font-display font-black text-xl text-red-600 mb-2">Terjadi Kesalahan</p>
          <p className="text-sm text-slate-600 mb-4">{error || 'Game tidak ditemukan.'}</p>
          <Link
            to="/teacher"
            className="inline-block px-4 py-2 bg-indigo-600 text-white font-display font-bold rounded-block border-2 border-slate-900 shadow-block"
          >
            Kembali ke Dashboard
          </Link>
        </Card>
      </div>
    );
  }

  const playerCount = game.players?.length || 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] game-grid-pattern py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-slate-500">
              Lobi Kuis Interaktif
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-950">
              {game.quizTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Total {game.totalQuestions || game.questions?.length} Pertanyaan
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={handleCopyJoinLink}
              className="flex items-center gap-1.5"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Disalin!' : 'Bagikan Link'}</span>
            </Button>

            <Button
              variant="success"
              size="lg"
              loading={starting}
              onClick={handleStartGame}
              className="flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>Mulai Kuis ({playerCount} Murid)</span>
            </Button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 bg-red-100 border-2 border-red-500 rounded-block text-red-800 text-sm font-bold">
            {error}
          </div>
        )}

        {/* Big Game Code Banner Card */}
        <Card className="bg-amber-300 border-3 text-center shadow-block-xl py-6 sm:py-8 px-4">
          <div className="max-w-xl mx-auto space-y-4">
            <p className="font-display font-black text-xs sm:text-sm uppercase tracking-wider text-slate-800">
              Instruksi Bergabung untuk Murid
            </p>

            {/* Direct Join Link Box */}
            <div className="bg-white border-2 sm:border-3 border-slate-900 rounded-block px-4 py-3 shadow-block max-w-lg mx-auto">
              <span className="text-[11px] sm:text-xs font-display font-black uppercase tracking-wider text-slate-500 block mb-1">
                Buka Link di Browser HP / Laptop:
              </span>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <a
                  href={joinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono font-black text-sm sm:text-lg text-indigo-700 hover:text-indigo-900 underline underline-offset-4 break-all select-all"
                >
                  {joinUrl}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(joinUrl);
                    setCopiedBaseLink(true);
                    setTimeout(() => setCopiedBaseLink(false), 2000);
                  }}
                  title="Salin Link Halaman Join"
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 rounded font-display font-bold text-xs text-slate-800 transition-all flex items-center gap-1 shrink-0"
                >
                  {copiedBaseLink ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBaseLink ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-900">
              Lalu masukkan 5 digit Kode PIN di bawah ini:
            </p>

            <GameCode code={game.code} size="lg" />

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleCopyJoinLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border-2 border-slate-900 rounded-block font-display font-bold text-xs text-slate-900 shadow-block-sm transition-all"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Otomatis Masuk Disalin!' : 'Salin Link Otomatis PIN (?pin=...)'}</span>
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-700 mt-2">
              Murid akan otomatis tampil di daftar peserta begitu memasukkan nama panggilan.
            </p>
          </div>
        </Card>

        {/* Joined Players Grid */}
        <Card className="bg-white">
          <PlayerList
            players={game.players || []}
            onAddBot={handleAddDemoStudent}
            showAddDemo={true}
          />
        </Card>
      </div>
    </div>
  );
};
