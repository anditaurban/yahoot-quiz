import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, X, Clock, AlertCircle, Sparkles, Flame, Trophy } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { QuestionCard } from '../../components/quiz/QuestionCard';
import { QuestionOption } from '../../components/quiz/QuestionOption';
import { ScoreCard } from '../../components/game/ScoreCard';
import { getGame, getCurrentQuestion, submitAnswer, getResults } from '../../services/api/games';

export const StudentPlayPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const [playerSession, setPlayerSession] = useState(null);
  const [question, setQuestion] = useState(null);

  // Student Game States: 'waiting' | 'answering' | 'answered' | 'time-expired' | 'result'
  const [gameState, setGameState] = useState('waiting');
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [answerFeedback, setAnswerFeedback] = useState(null); // { correct, points, totalScore, streak, selectedText }
  const [playerStats, setPlayerStats] = useState({ score: 0, rank: 1, streak: 0 });
  const [leaderboard, setLeaderboard] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const startTimeRef = useRef(Date.now());
  const currentQuestionIdRef = useRef(null);
  const currentQuestionIndexRef = useRef(-1);
  const hasLoadedGameRef = useRef(false);

  // Load player session
  useEffect(() => {
    const rawSession = sessionStorage.getItem('yahoot_player');
    if (!rawSession) {
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

  // Sync and poll question state from server
  useEffect(() => {
    if (!playerSession?.gameId) return;

    let isMounted = true;

    const fetchCurrentQuestion = async () => {
      try {
        const game = await getGame(code);
        if (!isMounted) return;
        hasLoadedGameRef.current = true;
        setError('');

        // If game is finished, navigate to result
        if (game.status === 'finished') {
          navigate(`/game/${code}/result`);
          return;
        }

        const qData = await getCurrentQuestion(playerSession.gameId, false);
        if (!isMounted) return;

        if (qData.finished) {
          navigate(`/game/${code}/result`);
          return;
        }

        // Check if question changed to next question
        const isNewQuestion =
          (qData.index !== undefined && qData.index !== currentQuestionIndexRef.current) ||
          (qData.id !== undefined && qData.id !== null && qData.id !== currentQuestionIdRef.current);

        if (isNewQuestion) {
          currentQuestionIdRef.current = qData.id;
          currentQuestionIndexRef.current = qData.index;
          setQuestion(qData);
          startTimeRef.current = Date.now();
          setSelectedOptionId(null);
          setTypedAnswer('');
          setAnswerFeedback(null);
          if (qData.gameStatus === 'feedback') {
            setGameState('result');
          } else {
            setGameState('answering');
          }
        } else if (qData.gameStatus === 'feedback') {
          // If teacher opened feedback / results for this question
          setGameState('result');
        }

        // Update player score from results endpoint
        const resData = await getResults(playerSession.gameId);
        if (resData?.players) {
          setLeaderboard(resData.players);
          const me = resData.players.find(
            (p) => (p.playerId || p.id) === playerSession.playerId
          );
          if (me) {
            setPlayerStats((prev) => ({
              score: me.score !== undefined ? me.score : prev.score,
              rank: me.rank || prev.rank,
              streak: me.streak !== undefined ? me.streak : prev.streak,
            }));
          }
        }
      } catch (err) {
        if (!isMounted) return;
        if (!hasLoadedGameRef.current) {
          setError(err.message || 'Gagal memuat pertanyaan kuis.');
        } else {
          console.warn('Transient poll error in student play:', err?.message || err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCurrentQuestion();
    const interval = setInterval(fetchCurrentQuestion, 1500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [code, playerSession, navigate]);

  // Handle student selecting and submitting an option
  const handleSelectOption = async (optionId) => {
    if (gameState !== 'answering' || !question || !playerSession) return;

    setSelectedOptionId(optionId);
    setGameState('answered');

    const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;

    // Find readable text of selected option
    let selectedText = String(optionId);
    if (question.options) {
      const foundOpt = question.options.find((o) => String(o.id) === String(optionId));
      if (foundOpt) selectedText = foundOpt.text;
    }

    try {
      const response = await submitAnswer(playerSession.gameId, {
        playerId: playerSession.playerId,
        questionId: question.id,
        optionId,
        responseTimeSeconds: elapsedSeconds,
      });

      const isCorrect = response.correct !== undefined ? response.correct : response.isCorrect;
      const pts = response.points !== undefined ? response.points : (response.pointsEarned || 0);
      const totalScore = response.totalScore !== undefined ? response.totalScore : (playerStats.score + pts);
      const streak = response.streak !== undefined ? response.streak : (isCorrect ? playerStats.streak + 1 : 0);

      setAnswerFeedback({
        correct: isCorrect,
        points: pts,
        totalScore,
        streak,
        selectedText,
      });

      // Update local score preview
      setPlayerStats((prev) => ({
        ...prev,
        score: totalScore,
        streak: streak,
      }));
    } catch (err) {
      setError(err.message || 'Gagal mengirim jawaban.');
    }
  };

  // Handle timer running out
  const handleTimeUp = () => {
    // Wall-clock check: prevent premature expiration if not enough time has elapsed
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const currentLimit = Number(question?.timeLimit) || 20;
    if (elapsed < currentLimit - 1.5) {
      return;
    }
    setGameState((prev) => (prev === 'answering' ? 'time-expired' : prev));
  };

  if (loading && !question) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-display font-bold text-slate-700">Menyiapkan Pertanyaan...</p>
        </div>
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="font-display font-black text-xl text-slate-900 mb-2">Terjadi Gangguan</h2>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        </Card>
      </div>
    );
  }

  // Filter valid non-empty options for consistent True/False detection
  const validOptions = (question?.options || []).filter(
    (o) => o && o.text !== null && o.text !== undefined && String(o.text).trim() !== ''
  );

  const isTrueFalseQuestion =
    question?.type === 'true_false' ||
    validOptions.length === 2 ||
    validOptions.some((o) => /^(true|benar)$/i.test(o.text)) ||
    validOptions.some((o) => /^(false|salah)$/i.test(o.text)) ||
    (question?.options && question.options.length === 2);

  return (
    <div className="min-h-[100dvh] game-grid-pattern py-2 sm:py-3 px-3 sm:px-6 flex flex-col justify-between max-w-2xl mx-auto overflow-y-auto">
      {/* Top Header info */}
      <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="font-display font-black text-xs sm:text-sm bg-white border-2 border-slate-900 px-2.5 py-0.5 rounded-block shadow-block-xs truncate max-w-[120px] sm:max-w-[180px]">
            {playerSession?.nickname}
          </span>
          <span className="font-display font-bold text-xs text-amber-900 bg-amber-100 border-2 border-slate-900 px-2.5 py-0.5 rounded-block shadow-block-xs shrink-0 whitespace-nowrap">
            {playerStats.score} Poin
          </span>
          <span className="font-display font-bold text-xs text-rose-900 bg-rose-100 border-2 border-slate-900 px-2.5 py-0.5 rounded-block shadow-block-xs shrink-0 whitespace-nowrap hidden sm:inline-flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-500" />
            {playerStats.streak}x Beruntun
          </span>
        </div>

        <Badge variant="purple" size="sm" className="shrink-0 font-mono">
          PIN: {code}
        </Badge>
      </div>

      {/* Main Question Card */}
      {question && (
        <QuestionCard
          key={`q_${question.index}_${question.id}`}
          question={question.question}
          currentIndex={question.index}
          totalQuestions={question.totalQuestions}
          timeLimit={question.timeLimit}
          remainingSeconds={question.remainingSeconds}
          type={question.type}
          timerRunning={gameState === 'answering'}
          onTimeUp={handleTimeUp}
          showTimer={gameState === 'answering'}
          className="mb-1.5 sm:mb-2 shrink-0"
        />
      )}

      {/* STATE 1 & 2: ANSWERING */}
      {gameState === 'answering' && question && (
        question.type === 'short_answer' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (typedAnswer.trim()) {
                handleSelectOption(typedAnswer.trim());
              }
            }}
            className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full space-y-3 min-h-0 py-2"
          >
            <Card className="bg-white border-3 shadow-block-md p-4">
              <label className="block font-display font-black text-sm sm:text-base text-slate-950 mb-1.5">
                Ketik Jawaban Kamu:
              </label>
              <input
                type="text"
                autoFocus
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Tulis jawaban di sini..."
                className="w-full min-h-[44px] px-3.5 py-2 text-base sm:text-lg font-bold border-2 border-slate-900 rounded-block focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="text-[11px] text-slate-500 font-semibold mt-1.5">
                Tekan Enter atau klik tombol di bawah untuk mengirim.
              </p>
            </Card>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={!typedAnswer.trim()}
              className="flex items-center justify-center gap-2"
            >
              <span>Kirim Jawaban</span>
              <Check className="w-5 h-5 stroke-[3]" />
            </Button>
          </form>
        ) : isTrueFalseQuestion ? (
          /* Dedicated 2-Card True / False Layout for Student - 100% Identik dengan Tampilan Guru */
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 py-2 min-h-0 content-stretch">
            {validOptions.slice(0, 2).map((opt, idx) => {
              const isOptionTrue =
                String(opt.id).toLowerCase() === 'a' ||
                String(opt.id).toLowerCase() === 'true' ||
                idx === 0 ||
                /^(true|benar)$/i.test(opt.text);

              const optTheme = isOptionTrue
                ? {
                    symbol: '✓ BENAR (A)',
                    tag: 'TRUE',
                    bg: 'bg-emerald-500 text-slate-950',
                    hover: 'hover:bg-emerald-400 active:bg-emerald-600',
                    ring: 'ring-4 sm:ring-6 ring-emerald-300 ring-offset-2',
                  }
                : {
                    symbol: '✕ SALAH (B)',
                    tag: 'FALSE',
                    bg: 'bg-red-500 text-white',
                    hover: 'hover:bg-red-400 active:bg-red-600',
                    ring: 'ring-4 sm:ring-6 ring-red-300 ring-offset-2',
                  };

              const isSelected = String(selectedOptionId).toLowerCase() === String(opt.id).toLowerCase();

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={gameState !== 'answering'}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full h-full min-h-[120px] sm:min-h-[160px] p-4 sm:p-6 border-3 sm:border-4 border-slate-900 rounded-block shadow-block transition-all flex flex-col justify-between text-left select-none cursor-pointer active:translate-y-1 active:shadow-block-sm ${
                    optTheme.bg
                  } ${optTheme.hover} ${
                    isSelected ? `${optTheme.ring} scale-[1.02] shadow-block-lg` : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 w-full">
                    <span className="font-display font-black text-xs sm:text-base px-2.5 py-1 bg-black/25 border border-black/30 rounded-block shadow-sm">
                      {optTheme.symbol}
                    </span>
                    <span className="font-mono font-bold text-xs px-2 py-0.5 bg-black/15 rounded border border-black/20">
                      [{idx + 1}]
                    </span>
                  </div>

                  <p className="font-display font-black text-2xl sm:text-3xl md:text-4xl break-words leading-tight my-auto text-center py-2 w-full">
                    {opt.text || (isOptionTrue ? 'Benar / True' : 'Salah / False')}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 py-1 sm:py-2 min-h-0 content-stretch">
            {question.options.map((opt, idx) => (
              <QuestionOption
                key={opt.id}
                index={idx}
                option={opt}
                type={question.type}
                onClick={handleSelectOption}
                keyboardShortcut={String(idx + 1)}
              />
            ))}
          </div>
        )
      )}

      {/* STATE 3: ANSWERED (ALUR KOMPETITIF: MENUNGGU SEMUA SELESAI / WAKTU HABIS) */}
      {gameState === 'answered' && (
        <div className="my-auto text-center animate-in fade-in zoom-in-95 py-6">
          <Card className="max-w-md mx-auto bg-amber-300 border-3 border-slate-900 shadow-block-lg p-6 sm:p-8">
            <div className="w-16 h-16 bg-white border-3 border-slate-900 rounded-block mx-auto flex items-center justify-center text-slate-950 mb-4 shadow-block-sm">
              <Check className="w-9 h-9 stroke-[3.5] text-emerald-600" />
            </div>

            <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-950 mb-1">
              Jawaban Terkirim!
            </h3>

            <div className="p-3 bg-white/95 border-2 border-slate-900 rounded-block text-left text-xs text-slate-800 my-4 shadow-block-xs">
              <span className="font-bold text-slate-600 block mb-0.5">Pilihan kamu:</span>
              <span className="font-display font-black text-sm sm:text-base text-slate-950 break-words">
                "{answerFeedback?.selectedText || typedAnswer || selectedOptionId}"
              </span>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
              ⏳ Menunggu semua peserta selesai menjawab atau waktu habis untuk melihat hasilnya...
            </p>

            <div className="mt-6 pt-4 border-t-2 border-slate-900/15 flex items-center justify-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 animate-bounce" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 animate-bounce delay-100" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 animate-bounce delay-200" />
            </div>
          </Card>
        </div>
      )}

      {/* STATE 4: TIME EXPIRED */}
      {gameState === 'time-expired' && (
        <div className="my-auto text-center animate-in fade-in py-6">
          <Card className="max-w-md mx-auto bg-red-100 border-3 border-red-500 shadow-block-lg p-6 sm:p-8">
            <div className="w-16 h-16 bg-white border-2 border-red-500 rounded-block mx-auto flex items-center justify-center text-red-600 mb-4 shadow-block-sm">
              <Clock className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="font-display font-black text-2xl text-red-950 mb-1">
              Waktu Habis!
            </h3>
            <p className="text-sm text-red-800 font-medium">
              Kamu belum sempat memilih jawaban pada soal ini.
            </p>
          </Card>
        </div>
      )}

      {/* STATE 5: RESULT / FEEDBACK (HASIL JAWABAN & KLASEMEN SEMENTARA) */}
      {gameState === 'result' && (
        <div className="py-2 space-y-3 max-w-md mx-auto w-full animate-in fade-in zoom-in-95">
          {answerFeedback?.correct ? (
            <Card className="bg-emerald-400 border-3 border-slate-900 shadow-block p-4 sm:p-5 text-center">
              <div className="w-12 h-12 bg-white border-2 border-slate-900 rounded-block mx-auto flex items-center justify-center text-emerald-600 mb-1.5 shadow-block-xs">
                <Check className="w-8 h-8 stroke-[3.5]" />
              </div>
              <h3 className="font-display font-black text-xl sm:text-2xl text-slate-950">
                JAWABAN KAMU BENAR! 🎉
              </h3>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="font-display font-black text-sm sm:text-base bg-white border-2 border-slate-900 px-3 py-0.5 rounded shadow-block-xs text-emerald-800">
                  +{answerFeedback.points} Poin
                </span>
                {answerFeedback.streak > 1 && (
                  <span className="font-display font-black text-xs bg-rose-100 border-2 border-slate-900 px-2.5 py-0.5 rounded text-rose-800 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-600" />
                    {answerFeedback.streak}x Beruntun
                  </span>
                )}
              </div>
            </Card>
          ) : answerFeedback ? (
            <Card className="bg-rose-200 border-3 border-slate-900 shadow-block p-4 sm:p-5 text-center">
              <div className="w-12 h-12 bg-white border-2 border-slate-900 rounded-block mx-auto flex items-center justify-center text-rose-600 mb-1.5 shadow-block-xs">
                <X className="w-8 h-8 stroke-[3.5]" />
              </div>
              <h3 className="font-display font-black text-xl sm:text-2xl text-rose-950">
                JAWABAN KURANG TEPAT ❌
              </h3>
              <p className="text-xs font-bold text-rose-950 mt-1">
                +0 Poin &bull; Streak beruntun kembali ke 0
              </p>
            </Card>
          ) : (
            <Card className="bg-amber-100 border-3 border-slate-900 shadow-block p-4 sm:p-5 text-center">
              <div className="w-12 h-12 bg-white border-2 border-slate-900 rounded-block mx-auto flex items-center justify-center text-amber-600 mb-1.5 shadow-block-xs">
                <Clock className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h3 className="font-display font-black text-xl sm:text-2xl text-slate-950">
                BELUM SEMPAT MENJAWAB ⏱️
              </h3>
              <p className="text-xs font-bold text-slate-700 mt-1">
                Kamu belum sempat memilih jawaban pada soal ini.
              </p>
            </Card>
          )}

          {/* Klasemen Sementara & Skor Pemain (Tanpa Banner Duplikat) */}
          <ScoreCard
            score={playerStats.score}
            rank={playerStats.rank}
            streak={playerStats.streak}
            nickname={playerSession?.nickname}
          />

          {/* Mini Klasemen Top 3 Pemain */}
          {leaderboard.length > 0 && (
            <Card className="bg-white border-3 border-slate-900 shadow-block-sm p-3 text-left">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b-2 border-slate-100">
                <span className="font-display font-black text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Klasemen Sementara
                </span>
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                  {leaderboard.length} Murid
                </span>
              </div>
              <div className="space-y-1.5">
                {leaderboard.slice(0, 3).map((p, pIdx) => {
                  const isMe = (p.playerId || p.id) === playerSession.playerId;
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div
                      key={p.playerId || p.id || pIdx}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-block text-xs transition-all ${
                        isMe
                          ? 'bg-amber-200 border-2 border-slate-900 font-black shadow-block-xs'
                          : 'bg-slate-50 border border-slate-200 font-bold text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate min-w-0">
                        <span className="text-sm shrink-0">{medals[pIdx] || `#${pIdx + 1}`}</span>
                        <span className="truncate">{p.nickname} {isMe && '(Kamu)'}</span>
                      </div>
                      <span className="shrink-0 font-display font-black text-slate-950">{p.score} pt</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <p className="text-center text-xs font-bold text-slate-500 py-1">
            Guru sedang menampilkan pembahasan & klasemen sementara...
          </p>
        </div>
      )}

      {/* Bottom spacer / status */}
      <div className="mt-1 text-center shrink-0">
        <span className="text-[10px] font-bold text-slate-400">
          Yahoot! Mobile Student Experience
        </span>
      </div>
    </div>
  );
};
