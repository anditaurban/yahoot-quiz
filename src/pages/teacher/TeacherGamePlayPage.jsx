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
  const leaderboardAudioRef = useRef(null);
  const isPlayingSoundRef = useRef(true);
  const currentQuestionIdRef = useRef(null);
  const currentQuestionIndexRef = useRef(-1);
  const roundPhaseRef = useRef('question');
  const justAdvancedRef = useRef(false);
  const hasLoadedGameRef = useRef(false);

  // Background Music & Sound Effects for Quiz Stages
  useEffect(() => {
    const audio = new Audio('/audio/spongebob-theme.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;

    const fanfare = new Audio('/audio/reveal-fanfare.wav');
    fanfare.volume = 0.6;
    fanfareRef.current = fanfare;

    const lbAudio = new Audio('/audio/leaderboard-jingle.wav');
    lbAudio.volume = 0.65;
    leaderboardAudioRef.current = lbAudio;

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
      lbAudio.pause();
      lbAudio.currentTime = 0;
    };
  }, []);

  const playFanfare = () => {
    try {
      if (fanfareRef.current && isPlayingSoundRef.current) {
        fanfareRef.current.currentTime = 0;
        fanfareRef.current.play().catch(() => {});
      }
    } catch {
      // Audio autoplay restrictions
    }
  };

  const playLeaderboardSound = () => {
    try {
      if (leaderboardAudioRef.current && isPlayingSoundRef.current) {
        leaderboardAudioRef.current.currentTime = 0;
        leaderboardAudioRef.current.play().catch(() => {});
      }
    } catch {
      // Audio autoplay restrictions
    }
  };

  const toggleSound = () => {
    if (!audioRef.current) return;
    if (isPlayingSound) {
      audioRef.current.pause();
      if (fanfareRef.current) fanfareRef.current.pause();
      if (leaderboardAudioRef.current) leaderboardAudioRef.current.pause();
      setIsPlayingSound(false);
      isPlayingSoundRef.current = false;
    } else {
      setIsPlayingSound(true);
      isPlayingSoundRef.current = true;
      if (roundPhaseRef.current === 'question') {
        audioRef.current.play().catch(() => {});
      } else if (roundPhaseRef.current === 'leaderboard' && leaderboardAudioRef.current) {
        leaderboardAudioRef.current.play().catch(() => {});
      }
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
          if (!hasLoadedGameRef.current) {
            setError('Sesi game tidak ditemukan.');
          }
          return;
        }
        hasLoadedGameRef.current = true;
        setError('');
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
        const isNewQuestion =
          (qData.index !== undefined && qData.index !== currentQuestionIndexRef.current) ||
          (qData.id !== undefined && qData.id !== currentQuestionIdRef.current);

        if (isNewQuestion) {
          currentQuestionIdRef.current = qData.id;
          currentQuestionIndexRef.current = qData.index;
          setQuestion(qData);
          roundPhaseRef.current = 'question';
          setRoundPhase('question');
          setTimerRunning(true);
          setAnswerStats({ totalAnswers: 0, optionCounts: {} });
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

        const totalP = (gameData?.players && gameData.players.length > 0) ? gameData.players.length : (res?.players?.length || 0);
        const totalAns = stats?.totalAnswers || 0;
        const isCurrentQuestion = qData.index !== undefined && qData.index === currentQuestionIndexRef.current;

        // Server authoritative auto-reveal or all players answered
        // Guarded: never trigger during cool-down after advancing or when no answers submitted yet
        if (!justAdvancedRef.current && roundPhaseRef.current === 'question' && isCurrentQuestion) {
          if (qData.gameStatus === 'feedback') {
            transitionToReveal();
          } else if (totalP > 0 && totalAns > 0 && totalAns >= totalP) {
            transitionToReveal();
          }
        }
      } catch (err) {
        if (!isMounted) return;
        if (!hasLoadedGameRef.current) {
          setError(err.message || 'Gagal memuat status permainan.');
        } else {
          console.warn('Transient poll error in teacher play:', err?.message || err);
        }
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

  // Enforce audio rules per stage:
  // - 'question': SpongeBob plays
  // - 'reveal': SpongeBob 100% OFF, Fanfare plays
  // - 'leaderboard': SpongeBob 100% OFF, Leaderboard Jingle plays
  useEffect(() => {
    if (roundPhase !== 'question') {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [roundPhase]);

  // Transition Step 1 -> Step 2: SOAL -> JAWABAN BENAR (Reveal)
  const transitionToReveal = async () => {
    if (roundPhaseRef.current === 'reveal') return;
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

    // SpongeBob MUST BE OFF during Klasemen Sementara
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Stop reveal fanfare if still playing
    if (fanfareRef.current) {
      fanfareRef.current.pause();
      fanfareRef.current.currentTime = 0;
    }

    // Play distinct Leaderboard Drumroll + Fanfare Jingle!
    playLeaderboardSound();
  };

  // Transition Step 3 -> Step 4: KLASEMEN SEMENTARA -> SOAL BERIKUTNYA
  const handleNext = async () => {
    setAdvancing(true);
    setError('');
    setShowAllLeaderboard(false);
    justAdvancedRef.current = true; // Guard immediately while advancing
    setTimeout(() => {
      justAdvancedRef.current = false;
    }, 3000);
    try {
      const res = await nextQuestion(id);

      // Stop any lingering leaderboard / fanfare sounds
      if (fanfareRef.current) {
        fanfareRef.current.pause();
        fanfareRef.current.currentTime = 0;
      }
      if (leaderboardAudioRef.current) {
        leaderboardAudioRef.current.pause();
        leaderboardAudioRef.current.currentTime = 0;
      }

      if (res?.status === 'finished' || res?.finished) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        if (leaderboardAudioRef.current) {
          leaderboardAudioRef.current.pause();
        }
        navigate(`/teacher/games/${id}/result`);
        return;
      }

      // If backend returned the next question directly, update immediately!
      if (res?.question) {
        currentQuestionIdRef.current = res.question.id;
        currentQuestionIndexRef.current = res.question.index;
        setQuestion(res.question);
      } else if (res?.questionIndex !== undefined) {
        currentQuestionIndexRef.current = res.questionIndex;
      }

      // Set advance guard cooldown to prevent stale poll race condition
      justAdvancedRef.current = true;
      setTimeout(() => {
        justAdvancedRef.current = false;
      }, 2500);

      setAnswerStats({ totalAnswers: 0, optionCounts: {} });
      roundPhaseRef.current = 'question';
      setRoundPhase('question');
      setTimerRunning(true);

      // START SPONGEBOB AGAIN from the beginning for the new question!
      if (audioRef.current && isPlayingSoundRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
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
  const overallPercent = totalPlayers > 0 ? Math.min(100, Math.round(((answerStats.totalAnswers || 0) / totalPlayers) * 100)) : 0;
  const top3 = leaderboard.slice(0, 3);
  const restPlayers = leaderboard.slice(3);

  return (
    <div className="h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] overflow-hidden game-grid-pattern p-2 sm:p-4 flex flex-col justify-between max-w-5xl mx-auto">
      <div className="flex-1 flex flex-col justify-between min-h-0 space-y-2">
        {/* Top Header / Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="font-display font-black text-xs sm:text-sm bg-white border-2 border-slate-900 px-3 py-0.5 rounded-block shadow-block-xs">
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
              size="sm"
              onClick={toggleSound}
              title={isPlayingSound ? 'Jeda Musik SpongeBob' : 'Putar Musik SpongeBob'}
              className="flex items-center gap-1.5"
            >
              {isPlayingSound ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
                  <span>Musik On 🎵</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-600" />
                  <span>Musik Off</span>
                </>
              )}
            </Button>

            {/* Step Sequence Actions */}
            {roundPhase === 'question' && (
              <Button
                variant="warning"
                size="sm"
                onClick={transitionToReveal}
                className="flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Kunci Jawaban</span>
              </Button>
            )}

            {roundPhase === 'reveal' && (
              <Button
                variant="primary"
                size="sm"
                onClick={transitionToLeaderboard}
                className="flex items-center gap-1.5 bg-indigo-600 text-white border-2 border-slate-900 shadow-block-xs"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                <span>Lihat Klasemen</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </Button>
            )}

            {roundPhase === 'leaderboard' && (
              <Button
                variant="primary"
                size="sm"
                loading={advancing}
                onClick={handleNext}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black border-2 border-slate-900 shadow-block-xs"
              >
                <span>{isLastQuestion ? 'Lihat Hasil Akhir' : 'Soal Berikutnya'}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </Button>
            )}
          </div>
        </div>

        {/* Global Error */}
        {error && (
          <div className="p-2 bg-red-100 border-2 border-red-500 rounded-block text-red-800 text-xs font-bold shrink-0">
            {error}
          </div>
        )}

        {/* ========================================================
            TAHAP 1 & 2: SOAL & PEMBAHASAN JAWABAN BENAR
           ======================================================== */}
        {(roundPhase === 'question' || roundPhase === 'reveal') && (
          <div className="flex-1 flex flex-col justify-between min-h-0 space-y-2 animate-in fade-in duration-200">
            {/* Question Card with Timer */}
            <QuestionCard
              key={`q_${question.index}_${question.id}`}
              question={question.question}
              currentIndex={question.index}
              totalQuestions={game?.totalQuestions || 1}
              timeLimit={question.timeLimit}
              remainingSeconds={question.remainingSeconds}
              type={question.type}
              timerRunning={timerRunning}
              onTimeUp={() => {
                if (roundPhase === 'question') {
                  transitionToReveal();
                }
              }}
              showTimer={roundPhase === 'question'}
              className="shrink-0"
            />

            {/* Overall Class Participation Progress Bar Underneath Question */}
            <div className="p-2 sm:p-2.5 bg-white border-2 border-slate-900 rounded-block shadow-block-xs shrink-0">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                <div className="flex items-center gap-1.5 font-display font-black">
                  <Users className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
                  <span>Progres Murid Menjawab:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-slate-950">
                    {answerStats.totalAnswers || 0} / {totalPlayers} Murid
                  </span>
                  <span className="font-mono text-[11px] font-bold text-slate-500">
                    ({overallPercent}%)
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-200 border border-slate-900 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500 ease-out"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
            </div>

            {/* Options Breakdown Grid with Matching Student Colors */}
            {question.type === 'short_answer' ? (
              <div
                className={`flex-1 min-h-0 p-4 border-3 border-slate-900 rounded-block shadow-block transition-all flex flex-col justify-center ${
                  roundPhase === 'reveal' ? 'bg-emerald-100 ring-4 ring-emerald-500' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
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
                <p className="font-display font-black text-xl sm:text-2xl text-slate-950 break-words">
                  {roundPhase === 'reveal'
                    ? `"${question.correctOptionId || question.correct_answer}"`
                    : '•••••••••••• (Tersembunyi)'}
                </p>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Siswa menjawab langsung dengan mengetik teks di gawai mereka dan dicocokkan secara case-insensitive.
                </p>
              </div>
            ) : (
              <div className="flex-1 min-h-0 flex flex-col justify-between">
                {/* Check if question is True / False (2 options: A = True, B = False) */}
                {question.type === 'true_false' || (question.options && question.options.length === 2) ? (
                  /* Dedicated 2-Option True / False Layout for Teacher / Projector */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 flex-1 min-h-[140px] content-stretch py-1">
                    {(question.options || []).map((opt, idx) => {
                      const isOptionTrue =
                        String(opt.id).toLowerCase() === 'a' ||
                        String(opt.id).toLowerCase() === 'true' ||
                        idx === 0 ||
                        /^(true|benar)$/i.test(opt.text);

                      const isCorrect =
                        String(opt.id).toLowerCase() === String(question.correctOptionId).toLowerCase() ||
                        (isOptionTrue && /^(a|true|benar)$/i.test(String(question.correctOptionId || question.correct_answer))) ||
                        (!isOptionTrue && /^(b|false|salah)$/i.test(String(question.correctOptionId || question.correct_answer)));

                      const optTheme = isOptionTrue
                        ? {
                            symbol: '✓ BENAR (A)',
                            tag: 'TRUE',
                            bg: 'bg-emerald-500 text-slate-950',
                            ring: 'ring-4 sm:ring-6 ring-white ring-offset-2',
                          }
                        : {
                            symbol: '✕ SALAH (B)',
                            tag: 'FALSE',
                            bg: 'bg-red-500 text-white',
                            ring: 'ring-4 sm:ring-6 ring-white ring-offset-2',
                          };

                      const isDimmed = roundPhase === 'reveal' && !isCorrect;

                      return (
                        <div
                          key={opt.id}
                          className={`h-full min-h-[120px] sm:min-h-[160px] p-4 sm:p-6 border-3 sm:border-4 border-slate-900 rounded-block transition-all shadow-block flex flex-col justify-between ${
                            optTheme.bg
                          } ${
                            roundPhase === 'reveal' && isCorrect
                              ? `${optTheme.ring} scale-[1.02] shadow-block-lg`
                              : ''
                          } ${isDimmed ? 'opacity-40 grayscale-[35%]' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-display font-black text-xs sm:text-base px-2.5 py-1 bg-black/25 border border-black/30 rounded-block shadow-sm">
                              {optTheme.symbol}
                            </span>

                            {roundPhase === 'reveal' && isCorrect && (
                              <Badge
                                variant="success"
                                size="md"
                                className="font-black bg-white text-emerald-900 border-2 border-slate-900 shadow-block-xs text-xs sm:text-sm"
                              >
                                KUNCI BENAR ✓
                              </Badge>
                            )}
                          </div>

                          <p className="font-display font-black text-xl sm:text-2xl md:text-3xl break-words leading-tight my-auto text-center py-2">
                            {opt.text || (isOptionTrue ? 'Benar / True' : 'Salah / False')}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Standard 2x2 Grid of Colored Options */
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 flex-1 min-h-0 content-stretch">
                    {(question.options || []).map((opt, idx) => {
                      const isCorrect = String(opt.id).toLowerCase() === String(question.correctOptionId).toLowerCase();
                      const optTheme = TEACHER_OPTION_STYLES[idx % TEACHER_OPTION_STYLES.length];
                      const isDimmed = roundPhase === 'reveal' && !isCorrect;

                      return (
                        <div
                          key={opt.id}
                          className={`h-full min-h-0 p-2.5 sm:p-3.5 border-3 border-slate-900 rounded-block transition-all shadow-block flex flex-col justify-between ${
                            optTheme.bg
                          } ${
                            roundPhase === 'reveal' && isCorrect
                              ? `${optTheme.ring} scale-[1.01] shadow-block-lg`
                              : ''
                          } ${isDimmed ? 'opacity-50 grayscale-[25%]' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-display font-black text-xs sm:text-sm px-2 py-0.5 bg-black/25 border border-black/30 rounded shadow-sm">
                              {optTheme.symbol}
                            </span>

                            {roundPhase === 'reveal' && isCorrect && (
                              <Badge variant="success" size="sm" className="font-black bg-white text-emerald-800 border-2 border-slate-900 shadow-block-xs">
                                KUNCI BENAR ✓
                              </Badge>
                            )}
                          </div>

                          <p className="font-display font-bold text-sm sm:text-base md:text-lg break-words leading-snug my-auto">
                            {opt.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Action to proceed to Leaderboard */}
            {roundPhase === 'reveal' && (
              <div className="text-center pt-1 shrink-0">
                <Button
                  variant="primary"
                  size="md"
                  onClick={transitionToLeaderboard}
                  className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-display font-black text-sm sm:text-base border-3 border-slate-900 shadow-block flex items-center justify-center gap-2 mx-auto"
                >
                  <Trophy className="w-4 h-4 text-amber-300" />
                  <span>Lanjutkan ke Klasemen Sementara</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAHAP 3: KLASEMEN SEMENTARA (FULL FOCUS LEADERBOARD)
           ======================================================== */}
        {roundPhase === 'leaderboard' && (
          <Card className="flex-1 min-h-0 bg-white border-3 border-slate-900 shadow-block-xl p-4 sm:p-6 space-y-4 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
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
