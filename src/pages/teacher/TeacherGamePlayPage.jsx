import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Check,
  Clock,
  Users,
  ArrowRight,
  Trophy,
  Eye,
  Flame,
  ChevronDown,
  ChevronUp,
  Award,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { QuestionCard } from '../../components/quiz/QuestionCard';
import {
  getGameById,
  getCurrentQuestion,
  nextQuestion,
  getAnswersStats,
  setQuestionStatus,
  getResults
} from '../../services/api/games';

// Matching Student Color Palette (Kahoot-Style)
const TEACHER_OPTION_STYLES = [
  {
    symbol: '▲ A',
    label: 'A',
    bg: 'bg-red-500 text-white',
    badge: 'bg-red-700 text-white',
    ring: 'ring-4 ring-emerald-300 ring-offset-2',
    progressBg: 'bg-white',
  },
  {
    symbol: '◆ B',
    label: 'B',
    bg: 'bg-blue-600 text-white',
    badge: 'bg-blue-800 text-white',
    ring: 'ring-4 ring-emerald-300 ring-offset-2',
    progressBg: 'bg-white',
  },
  {
    symbol: '● C',
    label: 'C',
    bg: 'bg-amber-400 text-slate-950',
    badge: 'bg-amber-600 text-slate-950',
    ring: 'ring-4 ring-emerald-400 ring-offset-2',
    progressBg: 'bg-slate-900',
  },
  {
    symbol: '■ D',
    label: 'D',
    bg: 'bg-emerald-500 text-slate-950',
    badge: 'bg-emerald-700 text-white',
    ring: 'ring-4 ring-white ring-offset-2',
    progressBg: 'bg-slate-900',
  },
];

export const TeacherGamePlayPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answerStats, setAnswerStats] = useState({ totalAnswers: 0, optionCounts: {} });
  
  // Game Flow Phases: 'question' (Soal) -> 'reveal' (Jawaban Benar) -> 'leaderboard' (Klasemen) -> next
  const [roundPhase, setRoundPhase] = useState('question');
  
  const [timerRunning, setTimerRunning] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState('');
  
  const [isPlayingSound, setIsPlayingSound] = useState(true);
  const audioRef = useRef(null);
  const fanfareRef = useRef(null);
  const isPlayingSoundRef = useRef(true);
  const currentQuestionIdRef = useRef(null);
  const roundPhaseRef = useRef('question');

  // Background Music (SpongeBob Closing Theme) during Question Answering
  useEffect(() => {
    const audio = new Audio('/audio/spongebob-theme.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;

    const fanfare = new Audio('/audio/reveal-fanfare.wav');
    fanfare.volume = 0.6;
    fanfareRef.current = fanfare;

    const startAudio = () => {
      audio
        .play()
        .then(() => {
          setIsPlayingSound(true);
          isPlayingSoundRef.current = true;
        })
        .catch(() => {
          const onFirstClick = () => {
            audio.play().then(() => {
              setIsPlayingSound(true);
              isPlayingSoundRef.current = true;
            }).catch(() => {});
            window.removeEventListener('click', onFirstClick);
          };
          window.addEventListener('click', onFirstClick, { once: true });
        });
    };

    startAudio();

    return () => {
      audio.pause();
      audio.currentTime = 0;
      fanfare.pause();
      fanfare.currentTime = 0;
    };
  }, []);

  const playFanfare = () => {
    try {
      if (fanfareRef.current) {
        fanfareRef.current.currentTime = 0;
        fanfareRef.current.play().catch(() => {});
      }
    } catch {
      // Audio autoplay restrictions
    }
  };

  const toggleSound = () => {
    if (!audioRef.current) return;
    if (isPlayingSound) {
      audioRef.current.pause();
      setIsPlayingSound(false);
      isPlayingSoundRef.current = false;
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlayingSound(true);
          isPlayingSoundRef.current = true;
        })
        .catch(() => {});
    }
  };

  // Fetch and poll game and question state
  useEffect(() => {
    let isMounted = true;

    const fetchCurrentState = async () => {
      try {
        const gameData = await getGameById(id);
        if (!isMounted) return;
        if (!gameData) {
          setError('Sesi game tidak ditemukan.');
          return;
        }
        setGame(gameData);

        if (gameData.status === 'finished') {
          navigate(`/teacher/games/${id}/result`);
          return;
        }

        const qData = await getCurrentQuestion(id, true);
        if (!isMounted) return;

        if (qData.finished) {
          navigate(`/teacher/games/${id}/result`);
          return;
        }

        // Detect if question advanced to a new one
        if (qData.id !== currentQuestionIdRef.current) {
          currentQuestionIdRef.current = qData.id;
          setQuestion(qData);
          roundPhaseRef.current = 'question';
          setRoundPhase('question');
          setTimerRunning(true);
          // Restart SpongeBob sound for new question
          if (audioRef.current && isPlayingSoundRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
        } else {
          setQuestion((prev) => (prev ? { ...prev, ...qData } : qData));
        }

        // Fetch answer statistics for this question
        const stats = await getAnswersStats(id, qData.index);
        if (!isMounted) return;
        setAnswerStats(stats || { totalAnswers: 0, optionCounts: {} });

        // Fetch current leaderboard (all players)
        const res = await getResults(id);
        if (!isMounted) return;
        if (res?.players) {
          setLeaderboard(res.players);
        }

        // Competitive flow: Auto-transition to 'reveal' when all players have answered
        const totalP = (gameData.players && gameData.players.length > 0) ? gameData.players.length : 0;
        const totalAns = stats?.totalAnswers || 0;
        if (roundPhaseRef.current === 'question' && totalP > 0 && totalAns >= totalP) {
          transitionToReveal();
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Gagal memuat status permainan.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCurrentState();
    const interval = setInterval(fetchCurrentState, 1500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [id, navigate]);

  // Transition Step 1 -> Step 2: SOAL -> JAWABAN BENAR (Reveal)
  const transitionToReveal = async () => {
    roundPhaseRef.current = 'reveal';
    setRoundPhase('reveal');
    setTimerRunning(false);

    // Stop SpongeBob sound
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Play reveal fanfare SFX!
    playFanfare();

    // Notify backend & student devices to reveal their results
    await setQuestionStatus(id, 'feedback');
  };

  // Transition Step 2 -> Step 3: JAWABAN BENAR -> KLASEMEN SEMENTARA
  const transitionToLeaderboard = () => {
    roundPhaseRef.current = 'leaderboard';
    setRoundPhase('leaderboard');
  };

  // Transition Step 3 -> Step 4: KLASEMEN SEMENTARA -> SOAL BERIKUTNYA
  const handleNext = async () => {
    setAdvancing(true);
    setError('');
    setShowAllLeaderboard(false);
    try {
      const res = await nextQuestion(id);
      roundPhaseRef.current = 'question';
      setRoundPhase('question');
      setTimerRunning(true);

      // Stop any lingering fanfare and START SPONGEBOB AGAIN from the beginning!
      if (fanfareRef.current) {
        fanfareRef.current.pause();
        fanfareRef.current.currentTime = 0;
      }
      if (audioRef.current && isPlayingSoundRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      if (res?.status === 'finished') {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        navigate(`/teacher/games/${id}/result`);
      }
    } catch (err) {
      setError(err.message || 'Gagal melanjutkan ke soal berikutnya.');
    } finally {
      setAdvancing(false);
    }
  };

  if (loading && !question) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-display font-bold text-slate-700">Menyiapkan Soal Kuis...</p>
        </div>
      </div>
    );
  }

  const isLastQuestion = question.index + 1 >= (game?.totalQuestions || 1);
  const totalPlayers = (game?.players && game.players.length > 0) ? game.players.length : (leaderboard.length || 0);
  const top3 = leaderboard.slice(0, 3);
  const restPlayers = leaderboard.slice(3);

  return (
    <div className="min-h-[calc(100vh-4rem)] game-grid-pattern py-6 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header / Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="font-display font-black text-xs sm:text-sm bg-white border-2 border-slate-900 px-3 py-1 rounded-block shadow-block-sm">
              PIN: {game?.code}
            </span>
            <span className="font-mono text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded hidden sm:inline">
              {typeof window !== 'undefined' && window.location.host ? window.location.host : 'yahoot-quiz.anditaurban.workers.dev'}/join
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-700 truncate max-w-xs sm:max-w-md">
              {game?.quizTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Sound Toggle Button */}
            <Button
              variant={isPlayingSound ? 'warning' : 'secondary'}
              size="md"
              onClick={toggleSound}
              title={isPlayingSound ? 'Jeda Musik SpongeBob' : 'Putar Musik SpongeBob'}
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

            {/* Step Sequence Actions */}
            {roundPhase === 'question' && (
              <Button
                variant="warning"
                size="md"
                onClick={transitionToReveal}
                className="flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>Kunci Jawaban</span>
              </Button>
            )}

            {roundPhase === 'reveal' && (
              <Button
                variant="primary"
                size="md"
                onClick={transitionToLeaderboard}
                className="flex items-center gap-1.5 bg-indigo-600 text-white border-2 border-slate-900 shadow-block"
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>Lihat Klasemen</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </Button>
            )}

            {roundPhase === 'leaderboard' && (
              <Button
                variant="primary"
                size="md"
                loading={advancing}
                onClick={handleNext}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black border-2 border-slate-900 shadow-block"
              >
                <span>{isLastQuestion ? 'Lihat Hasil Akhir' : 'Soal Berikutnya'}</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </Button>
            )}
          </div>
        </div>

        {/* Global Error */}
        {error && (
          <div className="p-3 bg-red-100 border-2 border-red-500 rounded-block text-red-800 text-xs font-bold">
            {error}
          </div>
        )}

        {/* ========================================================
            TAHAP 1 & 2: SOAL & PEMBAHASAN JAWABAN BENAR
           ======================================================== */}
        {(roundPhase === 'question' || roundPhase === 'reveal') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Question Card with Timer */}
            <QuestionCard
              question={question.question}
              currentIndex={question.index}
              totalQuestions={game?.totalQuestions || 1}
              timeLimit={question.timeLimit}
              type={question.type}
              timerRunning={timerRunning}
              onTimeUp={() => {
                if (roundPhase === 'question') {
                  transitionToReveal();
                }
              }}
              showTimer={roundPhase === 'question'}
            />

            {/* Live Answer Status Tracker */}
            <div className="flex items-center justify-between p-3.5 bg-white border-2 border-slate-900 rounded-block shadow-block">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 text-indigo-900 border border-slate-900 rounded-md">
                  <Users className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="font-display font-bold text-sm text-slate-900">
                  Respons Murid:
                </span>
                <span className="font-display font-black text-sm bg-amber-300 border border-slate-900 px-2 py-0.5 rounded">
                  {answerStats.totalAnswers || 0} / {totalPlayers} Terjawab
                </span>
              </div>

              <span className="text-xs font-bold text-slate-700">
                {roundPhase === 'reveal'
                  ? '🎉 Kunci Jawaban Ditampilkan'
                  : '⏳ Kuis Sedang Berjalan (Alur Kompetitif)'}
              </span>
            </div>

            {/* Options Breakdown Grid with Matching Student Colors */}
            {question.type === 'short_answer' ? (
              <div
                className={`p-6 border-3 border-slate-900 rounded-block shadow-block transition-all ${
                  roundPhase === 'reveal' ? 'bg-emerald-100 ring-4 ring-emerald-500' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="warning" size="md">
                    TIPE KETIK (Isian Singkat)
                  </Badge>
                  {roundPhase === 'reveal' && (
                    <Badge variant="success" size="md">
                      KUNCI JAWABAN TEPAT
                    </Badge>
                  )}
                </div>

                <p className="text-xs uppercase font-bold text-slate-500 tracking-wide mb-1">
                  Kunci Jawaban yang Diharapkan:
                </p>
                <p className="font-display font-black text-2xl sm:text-3xl text-slate-950 break-words">
                  {roundPhase === 'reveal'
                    ? `"${question.correctOptionId || question.correct_answer}"`
                    : '•••••••••••• (Tersembunyi)'}
                </p>
                <p className="text-xs text-slate-600 mt-2 font-medium">
                  Siswa menjawab langsung dengan mengetik teks di gawai mereka dan dicocokkan secara case-insensitive.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-black text-sm sm:text-base text-slate-900">
                    {roundPhase === 'reveal' ? 'Distribusi Jawaban & Kunci:' : 'Pilihan Jawaban:'}
                  </h3>
                  <span className="text-xs font-bold text-slate-600">
                    {roundPhase === 'reveal' ? 'Hasil Akhir Ronde Ini' : 'Warna Seragam Murid'}
                  </span>
                </div>

                {/* 2x2 Grid of Colored Options Matching Student UI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(question.options || []).map((opt, idx) => {
                    const isCorrect = String(opt.id).toLowerCase() === String(question.correctOptionId).toLowerCase();
                    const counts = answerStats?.optionCounts || {};
                    const count = counts[opt.id] ?? counts[String(opt.id).toLowerCase()] ?? 0;
                    const percentage = totalPlayers > 0 ? Math.round((count / totalPlayers) * 100) : 0;

                    let optTheme = TEACHER_OPTION_STYLES[idx % TEACHER_OPTION_STYLES.length];
                    if (question.type === 'true_false') {
                      if (String(opt.id).toLowerCase() === 'true') {
                        optTheme = {
                          symbol: '✓ TRUE',
                          bg: 'bg-emerald-500 text-slate-950',
                          badge: 'bg-emerald-700 text-white',
                          ring: 'ring-4 ring-white ring-offset-2',
                          progressBg: 'bg-slate-900',
                        };
                      } else {
                        optTheme = {
                          symbol: '✕ FALSE',
                          bg: 'bg-red-500 text-white',
                          badge: 'bg-red-700 text-white',
                          ring: 'ring-4 ring-emerald-300 ring-offset-2',
                          progressBg: 'bg-white',
                        };
                      }
                    }

                    const isDimmed = roundPhase === 'reveal' && !isCorrect;

                    return (
                      <div
                        key={opt.id}
                        className={`p-4 sm:p-5 border-3 border-slate-900 rounded-block transition-all shadow-block flex flex-col justify-between ${
                          optTheme.bg
                        } ${
                          roundPhase === 'reveal' && isCorrect
                            ? `${optTheme.ring} scale-[1.02] shadow-block-lg`
                            : ''
                        } ${isDimmed ? 'opacity-50 grayscale-[25%]' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className="font-display font-black text-sm px-2.5 py-1 bg-black/25 border-2 border-black/30 rounded-block shadow-sm">
                            {optTheme.symbol}
                          </span>

                          {roundPhase === 'reveal' && isCorrect ? (
                            <Badge variant="success" size="sm" className="font-black bg-white text-emerald-800 border-2 border-slate-900 shadow-block-xs">
                              KUNCI BENAR ✓
                            </Badge>
                          ) : (
                            <span className="font-display font-black text-xs px-2 py-0.5 bg-black/20 rounded">
                              {percentage}%
                            </span>
                          )}
                        </div>

                        <p className="font-display font-bold text-base sm:text-xl mb-4 break-words leading-snug">
                          {opt.text}
                        </p>

                        {/* Response Percentage Bar */}
                        <div className="pt-2 border-t-2 border-black/15 space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span>{count} / {totalPlayers} Murid</span>
                            <span className="font-display font-black text-sm">{percentage}%</span>
                          </div>
                          <div className="w-full h-3 bg-black/20 border-2 border-black/30 rounded-full overflow-hidden p-0.5">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${optTheme.progressBg}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action to proceed to Leaderboard */}
            {roundPhase === 'reveal' && (
              <div className="text-center pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={transitionToLeaderboard}
                  className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-display font-black text-base border-3 border-slate-900 shadow-block flex items-center justify-center gap-2 mx-auto"
                >
                  <Trophy className="w-5 h-5 text-amber-300" />
                  <span>Lanjutkan ke Klasemen Sementara</span>
                  <ArrowRight className="w-5 h-5 stroke-[3]" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAHAP 3: KLASEMEN SEMENTARA (FULL FOCUS LEADERBOARD)
           ======================================================== */}
        {roundPhase === 'leaderboard' && (
          <Card className="bg-white border-3 border-slate-900 shadow-block-xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-3 border-slate-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-400 border-2 border-slate-900 rounded-block shadow-block-xs">
                  <Trophy className="w-7 h-7 text-slate-950" />
                </div>
                <div>
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950">
                    Klasemen Sementara
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600">
                    Peringkat perolehan skor setelah Soal {question.index + 1}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 bg-slate-100 border-2 border-slate-900 px-3 py-1 rounded-block">
                  {leaderboard.length} Murid
                </span>

                <Button
                  variant="primary"
                  size="md"
                  loading={advancing}
                  onClick={handleNext}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black border-2 border-slate-900 shadow-block flex items-center gap-1.5"
                >
                  <span>{isLastQuestion ? 'Lihat Hasil Akhir' : 'Soal Berikutnya'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </Button>
              </div>
            </div>

            {/* TOP 3 PODIUM */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {top3.map((p, idx) => {
                const isFirst = idx === 0;
                const isSecond = idx === 1;

                const bgStyle = isFirst
                  ? 'bg-amber-300 border-3 border-slate-900 shadow-block-lg sm:-translate-y-2'
                  : isSecond
                  ? 'bg-slate-200 border-3 border-slate-900 shadow-block'
                  : 'bg-amber-100 border-3 border-slate-900 shadow-block';

                const badgeText = isFirst ? '🥇 JUARA 1' : isSecond ? '🥈 JUARA 2' : '🥉 JUARA 3';

                return (
                  <div
                    key={p.playerId || p.id}
                    className={`p-5 rounded-block font-display flex flex-col justify-between ${bgStyle} transition-transform`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-display font-black text-xs px-2.5 py-1 bg-slate-900 text-white rounded shadow-sm">
                        {badgeText}
                      </span>
                      {p.streak > 1 && (
                        <span className="flex items-center gap-1 text-xs font-black text-rose-700 bg-white/90 border border-slate-900 px-2 py-0.5 rounded shadow-xs">
                          <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-600" />
                          {p.streak}x
                        </span>
                      )}
                    </div>

                    <h4 className="font-display font-black text-xl sm:text-2xl text-slate-950 truncate my-2">
                      {p.nickname}
                    </h4>

                    <div className="mt-3 pt-3 border-t-2 border-slate-900/20 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Skor Total:</span>
                      <span className="font-display font-black text-xl text-slate-950">
                        {p.score} pt
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* EXPANDABLE LEADERBOARD (RANKS 4+) */}
            {restPlayers.length > 0 && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowAllLeaderboard((prev) => !prev)}
                  className="w-full flex items-center justify-center gap-2 border-2 border-slate-900 font-bold"
                >
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>
                    {showAllLeaderboard
                      ? 'Tampilkan Top 3 Saja'
                      : `Muat Lebih Banyak (${restPlayers.length} Murid Lainnya)`}
                  </span>
                  {showAllLeaderboard ? (
                    <ChevronUp className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 stroke-[3]" />
                  )}
                </Button>

                {showAllLeaderboard && (
                  <div className="mt-3 divide-y-2 divide-slate-100 border-2 border-slate-900 rounded-block overflow-hidden bg-slate-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {restPlayers.map((p, idx) => (
                      <div
                        key={p.playerId || p.id}
                        className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-slate-200 border-2 border-slate-900 flex items-center justify-center font-display font-black text-xs text-slate-800">
                            #{idx + 4}
                          </span>
                          <span className="font-display font-bold text-sm sm:text-base text-slate-900 truncate max-w-[180px] sm:max-w-xs">
                            {p.nickname}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {p.streak > 1 && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                              <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-600" />
                              {p.streak}x
                            </span>
                          )}
                          <span className="font-display font-black text-sm sm:text-base text-slate-950 bg-amber-100 border border-slate-900 px-2.5 py-0.5 rounded shadow-block-xs">
                            {p.score} pt
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Proceed Button */}
            <div className="pt-4 border-t-2 border-slate-100 text-center">
              <Button
                variant="primary"
                size="lg"
                loading={advancing}
                onClick={handleNext}
                className="w-full sm:w-auto px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-black text-base border-3 border-slate-900 shadow-block flex items-center justify-center gap-2 mx-auto"
              >
                <span>{isLastQuestion ? 'Lihat Hasil Akhir Kuis' : 'Lanjutkan ke Soal Berikutnya'}</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
