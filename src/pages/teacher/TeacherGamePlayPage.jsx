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
  Medal,
  Award,
  Volume2,
  VolumeX,
  Music
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

export const TeacherGamePlayPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answerStats, setAnswerStats] = useState({ totalAnswers: 0, optionCounts: {} });
  const [showAnswer, setShowAnswer] = useState(false);
  const [timerRunning, setTimerRunning] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState('');
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const audioRef = useRef(null);

  // Background Music (SpongeBob Closing Theme) on teacher side during quiz
  useEffect(() => {
    const audio = new Audio('/audio/spongebob-theme.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;

    audio.onerror = () => {
      // Fallback to original full name if needed
      audio.src = encodeURI('/SpongeBob SquarePants Closing Theme Song (INCOMPLETE).mp3');
    };

    const tryAutoPlay = () => {
      audio
        .play()
        .then(() => setIsPlayingSound(true))
        .catch(() => {
          // In case browser autoplay policy blocks unmuted audio before user interaction
          const onFirstInteraction = () => {
            audio
              .play()
              .then(() => setIsPlayingSound(true))
              .catch(() => {});
            window.removeEventListener('click', onFirstInteraction);
          };
          window.addEventListener('click', onFirstInteraction, { once: true });
        });
    };

    tryAutoPlay();

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

        setQuestion(qData);

        // Fetch answer statistics for this question
        const stats = await getAnswersStats(id, qData.index);
        setAnswerStats(stats || { totalAnswers: 0, optionCounts: {} });

        // Fetch current leaderboard (all players)
        const res = await getResults(id);
        if (res?.players) {
          setLeaderboard(res.players);
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

  const handleRevealAnswer = async () => {
    setShowAnswer(true);
    setTimerRunning(false);
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
    }
    await setQuestionStatus(id, 'feedback');
  };

  const handleNext = async () => {
    setAdvancing(true);
    setError('');
    setShowAllLeaderboard(false);
    try {
      const res = await nextQuestion(id);
      setShowAnswer(false);
      setTimerRunning(true);
      if (audioRef.current && isPlayingSound) {
        audioRef.current.volume = 0.4;
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

  if (loading || !question) {
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

            {!showAnswer ? (
              <Button
                variant="warning"
                size="md"
                onClick={handleRevealAnswer}
                className="flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>Kunci Jawaban</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                loading={advancing}
                onClick={handleNext}
                className="flex items-center gap-1.5"
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

        {/* Question Card with Timer */}
        <QuestionCard
          question={question.question}
          currentIndex={question.index}
          totalQuestions={game?.totalQuestions || 1}
          timeLimit={question.timeLimit}
          type={question.type}
          timerRunning={timerRunning}
          onTimeUp={() => {
            setTimerRunning(false);
            setShowAnswer(true);
            setQuestionStatus(id, 'feedback');
          }}
          showTimer={!showAnswer}
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

          <span className="text-xs font-bold text-slate-600">
            {showAnswer ? 'Kunci & Persentase Ditampilkan' : 'Kuis Sedang Berjalan'}
          </span>
        </div>

        {/* Options Breakdown Grid with Real-Time Percentage */}
        {question.type === 'short_answer' ? (
          <div
            className={`p-6 border-3 border-slate-900 rounded-block shadow-block transition-all ${
              showAnswer ? 'bg-emerald-100 ring-4 ring-emerald-500' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <Badge variant="warning" size="md">
                TIPE KETIK (Isian Singkat)
              </Badge>
              {showAnswer && (
                <Badge variant="success" size="md">
                  KUNCI JAWABAN TEPAT
                </Badge>
              )}
            </div>

            <p className="text-xs uppercase font-bold text-slate-500 tracking-wide mb-1">
              Kunci Jawaban yang Diharapkan:
            </p>
            <p className="font-display font-black text-2xl sm:text-3xl text-slate-950 break-words">
              {showAnswer
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
                Distribusi Jawaban Murid:
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {showAnswer ? 'Hasil Akhir Ronde Ini' : 'Real-time'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(question.options || []).map((opt, idx) => {
                const isCorrect = String(opt.id).toLowerCase() === String(question.correctOptionId).toLowerCase();
                const counts = answerStats?.optionCounts || {};
                const count = counts[opt.id] ?? counts[String(opt.id).toLowerCase()] ?? 0;
                const percentage = totalPlayers > 0 ? Math.round((count / totalPlayers) * 100) : 0;

                const symbols = ['▲ A', '◆ B', '● C', '■ D'];
                const symbol =
                  question.type === 'true_false'
                    ? opt.id === 'true'
                      ? '✓ TRUE'
                      : '✕ FALSE'
                    : symbols[idx % symbols.length];

                return (
                  <div
                    key={opt.id}
                    className={`p-4 border-3 border-slate-900 rounded-block transition-all shadow-block flex flex-col justify-between ${
                      showAnswer && isCorrect
                        ? 'bg-emerald-300 ring-4 ring-emerald-500'
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="font-display font-black text-sm px-2.5 py-1 bg-slate-900 text-white rounded shadow-sm">
                        {symbol}
                      </span>
                      {showAnswer && isCorrect ? (
                        <Badge variant="success" size="sm" className="font-black">
                          KUNCI BENAR ✓
                        </Badge>
                      ) : (
                        <span className="font-display font-black text-sm text-slate-900 bg-slate-100 border border-slate-900 px-2 py-0.5 rounded">
                          {percentage}%
                        </span>
                      )}
                    </div>

                    <p className="font-display font-bold text-base sm:text-lg text-slate-950 mb-3 break-words">
                      {opt.text}
                    </p>

                    {/* Response Bar & Percent Indicator */}
                    <div className="pt-2 border-t-2 border-slate-900/10 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>{count} / {totalPlayers} Murid</span>
                        <span className="font-display font-black text-sm text-slate-950">{percentage}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 border-2 border-slate-900 rounded-full overflow-hidden p-0.5 shadow-block-xs">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCorrect && showAnswer
                              ? 'bg-emerald-600'
                              : 'bg-indigo-600'
                          }`}
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

        {/* Interim Leaderboard: Top 3 & Expandable List */}
        {showAnswer && leaderboard.length > 0 && (
          <Card className="bg-white border-3 border-slate-900 shadow-block-lg p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-400 border-2 border-slate-900 rounded-block shadow-block-xs">
                  <Trophy className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg sm:text-xl text-slate-950">
                    Klasemen Sementara
                  </h3>
                  <p className="text-xs font-semibold text-slate-600">
                    Peringkat teratas setelah Soal {question.index + 1}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-900 px-2.5 py-1 rounded-block self-start sm:self-auto">
                Total {leaderboard.length} Murid
              </span>
            </div>

            {/* TOP 3 PODIUM CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {top3.map((p, idx) => {
                const isFirst = idx === 0;
                const isSecond = idx === 1;
                const isThird = idx === 2;

                const bgStyle = isFirst
                  ? 'bg-amber-300 border-3 border-slate-900 shadow-block'
                  : isSecond
                  ? 'bg-slate-200 border-3 border-slate-900 shadow-block-sm'
                  : 'bg-amber-100 border-3 border-slate-900 shadow-block-sm';

                const badgeText = isFirst ? '🥇 JUARA 1' : isSecond ? '🥈 JUARA 2' : '🥉 JUARA 3';

                return (
                  <div
                    key={p.playerId || p.id}
                    className={`p-4 rounded-block font-display flex flex-col justify-between ${bgStyle}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display font-black text-xs px-2 py-0.5 bg-slate-900 text-white rounded">
                        {badgeText}
                      </span>
                      {p.streak > 1 && (
                        <span className="flex items-center gap-1 text-[11px] font-black text-rose-700 bg-white/80 border border-slate-900 px-1.5 py-0.5 rounded">
                          <Flame className="w-3 h-3 fill-rose-500 text-rose-600" />
                          {p.streak}x
                        </span>
                      )}
                    </div>

                    <h4 className="font-display font-black text-lg sm:text-xl text-slate-950 truncate my-1">
                      {p.nickname}
                    </h4>

                    <div className="mt-2 pt-2 border-t-2 border-slate-900/20 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Skor:</span>
                      <span className="font-display font-black text-lg text-slate-950">
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
                  size="sm"
                  onClick={() => setShowAllLeaderboard((prev) => !prev)}
                  className="w-full flex items-center justify-center gap-2 border-2 border-slate-900"
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
                        className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-slate-200 border-2 border-slate-900 flex items-center justify-center font-display font-black text-xs text-slate-800">
                            #{idx + 4}
                          </span>
                          <span className="font-display font-bold text-sm text-slate-900 truncate max-w-[180px] sm:max-w-xs">
                            {p.nickname}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {p.streak > 1 && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                              <Flame className="w-3 h-3 fill-rose-500 text-rose-600" />
                              {p.streak}x
                            </span>
                          )}
                          <span className="font-display font-black text-sm text-slate-950 bg-amber-100 border border-slate-900 px-2.5 py-0.5 rounded shadow-block-xs">
                            {p.score} pt
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};
