import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, X, Clock, AlertCircle, Sparkles } from 'lucide-react';
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
  const [answerFeedback, setAnswerFeedback] = useState(null); // { correct, points, alreadyAnswered }
  const [playerStats, setPlayerStats] = useState({ score: 0, rank: 1, streak: 0 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const startTimeRef = useRef(Date.now());
  const currentQuestionIdRef = useRef(null);

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

        // Check if question changed
        if (qData.id !== currentQuestionIdRef.current) {
          currentQuestionIdRef.current = qData.id;
          setQuestion(qData);
          startTimeRef.current = Date.now();
          setSelectedOptionId(null);
          setTypedAnswer('');
          setAnswerFeedback(null);
          setGameState('answering');
        } else if (qData.gameStatus === 'feedback') {
          // If teacher opened feedback / results for this question
          setGameState('result');
        }

        // Update player score from results endpoint
        const resData = await getResults(playerSession.gameId);
        if (resData?.players) {
          const me = resData.players.find(p => p.playerId === playerSession.playerId);
          if (me) {
            setPlayerStats({
              score: me.score || 0,
              rank: me.rank || 1,
              streak: me.streak || 0
            });
          }
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Gagal memuat pertanyaan kuis.');
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

    try {
      const response = await submitAnswer(playerSession.gameId, {
        playerId: playerSession.playerId,
        questionId: question.id,
        optionId,
        responseTimeSeconds: elapsedSeconds
      });

      setAnswerFeedback({
        correct: response.correct,
        points: response.points
      });

      // Update local score preview
      if (response.correct) {
        setPlayerStats(prev => ({
          ...prev,
          score: prev.score + response.points,
          streak: prev.streak + 1
        }));
      } else {
        setPlayerStats(prev => ({
          ...prev,
          streak: 0
        }));
      }
    } catch (err) {
      setError(err.message || 'Gagal mengirim jawaban.');
    }
  };

  const handleTimeUp = () => {
    if (gameState === 'answering') {
      setGameState('time-expired');
    }
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

  return (
    <div className="min-h-[calc(100vh-4rem)] game-grid-pattern py-4 sm:py-6 px-3 sm:px-6 flex flex-col justify-between max-w-4xl mx-auto">
      {/* Top Header info */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="font-display font-black text-xs sm:text-sm bg-white border-2 border-slate-900 px-2.5 py-1 rounded-block shadow-block-sm truncate max-w-[120px] sm:max-w-[200px]">
            {playerSession?.nickname}
          </span>
          <span className="font-display font-bold text-xs text-amber-700 bg-amber-100 border-2 border-slate-900 px-2.5 py-1 rounded-block shadow-block-sm shrink-0 whitespace-nowrap">
            {playerStats.score} Poin
          </span>
        </div>

        <Badge variant="purple" size="sm" className="shrink-0">
          PIN: {code}
        </Badge>
      </div>

      {/* Main Question Card */}
      {question && (
        <QuestionCard
          question={question.question}
          currentIndex={question.index}
          totalQuestions={question.totalQuestions}
          timeLimit={question.timeLimit}
          type={question.type}
          timerRunning={gameState === 'answering'}
          onTimeUp={handleTimeUp}
          showTimer={gameState === 'answering'}
          className="mb-4 sm:mb-6"
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
            className="my-auto max-w-lg mx-auto w-full space-y-4"
          >
            <Card className="bg-white border-3 shadow-block-lg p-5">
              <label className="block font-display font-black text-base text-slate-950 mb-2">
                Ketik Jawaban Kamu:
              </label>
              <input
                type="text"
                autoFocus
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Tulis jawaban di sini..."
                className="w-full min-h-[50px] px-4 py-2.5 text-base sm:text-lg font-bold border-2 border-slate-900 rounded-block focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="text-xs text-slate-500 font-semibold mt-2">
                Tekan Enter atau klik tombol di bawah untuk mengirim.
              </p>
            </Card>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!typedAnswer.trim()}
              className="flex items-center justify-center gap-2"
            >
              <span>Kirim Jawaban</span>
              <Check className="w-5 h-5 stroke-[3]" />
            </Button>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 my-auto">
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

      {/* STATE 3: ANSWERED (WAITING FOR ROUND END) */}
      {gameState === 'answered' && (
        <div className="my-auto text-center animate-in fade-in py-6">
          <Card className="max-w-md mx-auto bg-amber-300 border-3 shadow-block-lg p-6 sm:p-8">
            <div className="w-16 h-16 bg-white border-2 border-slate-900 rounded-block mx-auto flex items-center justify-center text-slate-950 mb-4 shadow-block-sm">
              <Check className="w-8 h-8 stroke-[3] text-emerald-600" />
            </div>
            <h3 className="font-display font-black text-2xl text-slate-950 mb-1">
              Jawaban Terkirim!
            </h3>
            <p className="text-sm font-semibold text-slate-800">
              Menunggu waktu kuis berakhir atau giliran guru melanjutkan...
            </p>

            <div className="mt-6 pt-4 border-t-2 border-slate-900/10 flex items-center justify-center gap-2">
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

      {/* STATE 5: RESULT / FEEDBACK */}
      {gameState === 'result' && (
        <div className="my-auto animate-in fade-in zoom-in-95 py-6">
          <ScoreCard
            isCorrect={answerFeedback?.correct}
            pointsEarned={answerFeedback?.points || 0}
            score={playerStats.score}
            rank={playerStats.rank}
            streak={playerStats.streak}
            nickname={playerSession?.nickname}
          />
          <p className="text-center text-xs font-bold text-slate-500 mt-4">
            Menunggu guru membuka soal berikutnya...
          </p>
        </div>
      )}

      {/* Bottom spacer / status */}
      <div className="mt-4 text-center">
        <span className="text-[11px] font-bold text-slate-500">
          Yahoot! Mobile Student Experience
        </span>
      </div>
    </div>
  );
};
