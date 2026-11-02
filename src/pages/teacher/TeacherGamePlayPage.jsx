import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Clock, Users, ArrowRight, Trophy, Eye, EyeOff } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState('');

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

        // Fetch current leaderboard
        const res = await getResults(id);
        if (res?.players) {
          setLeaderboard(res.players.slice(0, 5));
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
    await setQuestionStatus(id, 'feedback');
  };

  const handleNext = async () => {
    setAdvancing(true);
    setError('');
    try {
      const res = await nextQuestion(id);
      setShowAnswer(false);
      setTimerRunning(true);
      if (res?.status === 'finished') {
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
  const totalPlayers = game?.players?.length || 0;

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

        {/* Question Card */}
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
              {answerStats.totalAnswers} / {totalPlayers} Terjawab
            </span>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            {showAnswer ? 'Kunci ditampilkan ke murid' : 'Kuis sedang aktif'}
          </span>
        </div>

        {/* Options Breakdown Grid or Short Answer Display */}
        {question.type === 'short_answer' ? (
          <div className={`p-6 border-3 border-slate-900 rounded-block shadow-block transition-all ${
            showAnswer ? 'bg-emerald-100 ring-4 ring-emerald-500' : 'bg-white'
          }`}>
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
              {showAnswer ? `"${question.correctOptionId || question.correct_answer}"` : '•••••••••••• (Tersembunyi)'}
            </p>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              Siswa menjawab langsung dengan mengetikkan teks di gawai mereka dan dicocokkan secara case-insensitive.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(question.options || []).map((opt, idx) => {
              const isCorrect = String(opt.id) === String(question.correctOptionId);
              const count = answerStats.optionCounts[opt.id] || 0;
              const percentage = totalPlayers > 0 ? Math.round((count / totalPlayers) * 100) : 0;

              const symbols = ['▲ A', '◆ B', '● C', '■ D'];
              const symbol = question.type === 'true_false' ? (opt.id === 'true' ? '✓ TRUE' : '✕ FALSE') : symbols[idx];

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
                    <span className="font-display font-black text-sm px-2 py-1 bg-slate-900 text-white rounded">
                      {symbol}
                    </span>
                    {showAnswer && isCorrect && (
                      <Badge variant="success" size="sm">
                        KUNCI BENAR
                      </Badge>
                    )}
                  </div>

                  <p className="font-display font-bold text-base sm:text-lg text-slate-950 mb-3 break-words">
                    {opt.text}
                  </p>

                  {/* Response Bar */}
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>{count} Murid</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 border border-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isCorrect ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Interim Leaderboard */}
        {showAnswer && leaderboard.length > 0 && (
          <Card className="bg-white">
            <h3 className="font-display font-black text-lg text-slate-950 mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Klasemen Sementara</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {leaderboard.map((p) => (
                <div
                  key={p.playerId}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border-2 border-slate-900 rounded-block font-display text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-black text-amber-600">#{p.rank}</span>
                    <span className="font-bold text-slate-900 truncate max-w-[120px]">{p.nickname}</span>
                  </div>
                  <span className="font-black text-slate-900">{p.score} pt</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
