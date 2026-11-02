import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Users, Sparkles, Share2, Copy, Check, Volume2, VolumeX, QrCode, Maximize2 } from 'lucide-react';
import QRCode from 'qrcode';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
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
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [showEnlargedQr, setShowEnlargedQr] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio('/audio/spongebob-theme.mp3');
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const toggleSound = () => {
    if (!audioRef.current) return;
    if (isPlayingSound) {
      audioRef.current.pause();
      setIsPlayingSound(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlayingSound(true))
        .catch(() => {});
    }
  };

  // Fetch and poll lobby state
  useEffect(() => {
    let isMounted = true;

    const fetchLobby = async () => {
      try {
        const gameData = await getGameById(id);
        if (!isMounted || !gameData) return;
        setGame(prev => ({ ...(prev || {}), ...gameData }));
      } catch (err) {
        if (!isMounted) return;
        // Don't overwrite existing game data on transient polling hiccups
        if (!game) {
          setError(err.message || 'Gagal memuat lobi game.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLobby();
    const interval = setInterval(fetchLobby, 1000);

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

  // Generate QR Code for scanning to join
  useEffect(() => {
    if (!game?.code) return;
    const directJoinUrl = `${joinUrl}?pin=${game.code}`;
    QRCode.toDataURL(directJoinUrl, {
      width: 360,
      margin: 2,
      color: {
        dark: '#020617',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => {});
  }, [game?.code, joinUrl]);

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
              variant={isPlayingSound ? 'warning' : 'secondary'}
              size="md"
              onClick={toggleSound}
              title={isPlayingSound ? 'Jeda Musik Lobi SpongeBob' : 'Putar Musik Lobi SpongeBob'}
              className="flex items-center gap-1.5"
            >
              {isPlayingSound ? (
                <>
                  <Volume2 className="w-4 h-4 text-slate-950 animate-pulse" />
                  <span>Musik On 🎵</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-600" />
                  <span>Musik Off</span>
                </>
              )}
            </Button>

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

        {/* Big Game Code & QR Code Banner Card */}
        <Card className="bg-amber-300 border-3 text-center shadow-block-xl py-6 sm:py-8 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex flex-col items-center gap-1">
              <span className="font-display font-black text-xs sm:text-sm uppercase tracking-wider text-slate-800">
                Cara Bergabung Murid (Scan QR atau Masukkan PIN)
              </span>
              <p className="text-xs text-slate-700 font-semibold">
                Siswa dapat langsung mengarahkan kamera HP ke QR Code, atau buka link di bawah.
              </p>
            </div>

            {/* Direct Join Link Box */}
            <div className="bg-white border-2 sm:border-3 border-slate-900 rounded-block px-4 py-2.5 shadow-block max-w-lg mx-auto">
              <span className="text-[11px] font-display font-black uppercase tracking-wider text-slate-500 block mb-0.5">
                Buka Link di Browser HP / Laptop:
              </span>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <a
                  href={joinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono font-black text-sm sm:text-base text-indigo-700 hover:text-indigo-900 underline underline-offset-4 break-all select-all"
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

            {/* Dual Join Options Grid: PIN on Left, QR Code on Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch pt-2">
              {/* Option 1: Masukkan PIN 5-Digit */}
              <div className="p-4 sm:p-5 bg-white border-2 sm:border-3 border-slate-900 rounded-block shadow-block flex flex-col justify-between items-center text-center">
                <span className="text-xs font-display font-black uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-900 px-2.5 py-0.5 rounded mb-2">
                  Opsi 1: Masukkan PIN
                </span>
                <p className="text-xs text-slate-600 mb-2 font-medium">
                  Ketik 5 digit kode ini di halaman join:
                </p>

                <GameCode code={game.code} size="md" />

                <div className="mt-4 pt-3 border-t-2 border-slate-100 w-full">
                  <button
                    type="button"
                    onClick={handleCopyJoinLink}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 border-2 border-slate-900 rounded font-display font-bold text-xs text-slate-900 transition-all shadow-block-xs"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Link Otomatis Masuk Disalin!' : 'Salin Link Otomatis PIN'}</span>
                  </button>
                </div>
              </div>

              {/* Option 2: Scan QR Code */}
              <div className="p-4 sm:p-5 bg-white border-2 sm:border-3 border-slate-900 rounded-block shadow-block flex flex-col justify-between items-center text-center">
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-display font-black uppercase tracking-wider text-indigo-900 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded">
                    Opsi 2: Scan Kamera HP
                  </span>
                  {qrDataUrl && (
                    <button
                      type="button"
                      onClick={() => setShowEnlargedQr(true)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-700 text-xs font-bold flex items-center gap-1"
                      title="Perbesar QR Code"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Perbesar</span>
                    </button>
                  )}
                </div>

                <div className="my-auto py-2">
                  {qrDataUrl ? (
                    <div
                      onClick={() => setShowEnlargedQr(true)}
                      className="cursor-pointer group relative inline-block p-1 bg-white border-2 border-slate-900 rounded-block shadow-block-xs hover:scale-105 transition-transform"
                      title="Klik untuk memperbesar QR Code"
                    >
                      <img
                        src={qrDataUrl}
                        alt={`QR Code PIN ${game.code}`}
                        className="w-36 h-36 sm:w-40 sm:h-40 mx-auto rounded"
                      />
                      <span className="absolute bottom-1 right-1 bg-slate-900 text-white p-1 rounded-sm opacity-80 group-hover:opacity-100">
                        <Maximize2 className="w-3 h-3" />
                      </span>
                    </div>
                  ) : (
                    <div className="w-36 h-36 sm:w-40 sm:h-40 border-2 border-dashed border-slate-400 rounded-block flex items-center justify-center text-xs text-slate-500">
                      Membuat QR...
                    </div>
                  )}
                </div>

                <p className="text-[11px] font-bold text-slate-600 mt-2">
                  Scan dengan kamera ponsel siswa untuk langsung masuk tanpa ketik PIN!
                </p>
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-700 mt-2">
              Murid akan otomatis tampil di daftar peserta begitu memasukkan nama panggilan.
            </p>
          </div>
        </Card>

        {/* Enlarged QR Code Modal for Classroom Projector */}
        {showEnlargedQr && (
          <Modal
            isOpen={showEnlargedQr}
            onClose={() => setShowEnlargedQr(false)}
            title="Scan QR Code untuk Gabung Kuis"
          >
            <div className="p-4 text-center space-y-4">
              <div className="inline-block p-3 bg-white border-3 border-slate-900 rounded-block shadow-block mx-auto">
                <img
                  src={qrDataUrl}
                  alt={`QR Code PIN ${game.code}`}
                  className="w-64 h-64 sm:w-80 sm:h-80 mx-auto"
                />
              </div>

              <div className="space-y-1">
                <h3 className="font-display font-black text-xl text-slate-950">
                  PIN: {game.code}
                </h3>
                <p className="text-xs text-slate-600">
                  Arahkan kamera di smartphone siswa ke layar proyeksi ini.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={() => setShowEnlargedQr(false)}
                className="w-full"
              >
                Tutup Tampilan Penuh
              </Button>
            </div>
          </Modal>
        )}

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
