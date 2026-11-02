import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Clock, Award, Play, CheckCircle2, Search, ArrowRight, Sparkles, Trophy } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getYahootStudentQuizzes, getQuiz } from '../../services/api/quizzes';
import { createGame } from '../../services/api/games';

export const StudentQuizListPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startingQuizId, setStartingQuizId] = useState(null);

  // Student Customer ID for fetching attempt records (saved in localStorage or default)
  const [customerId, setCustomerId] = useState(() => {
    return localStorage.getItem('yahoot_customer_id') || '';
  });

  const fetchQuizzes = async (cid = customerId) => {
    setLoading(true);
    setError('');
    try {
      const data = await getYahootStudentQuizzes(cid ? Number(cid) : null);
      setQuizzes(data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat katalog kuis siswa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes(customerId);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleStartSoloPlay = async (quizId) => {
    setStartingQuizId(quizId);
    setError('');
    try {
      const fullQuiz = await getQuiz(quizId);
      if (!fullQuiz.questions || fullQuiz.questions.length === 0) {
        throw new Error('Kuis ini belum memiliki soal pertanyaan.');
      }

      // Create a game session for self-paced or live play
      const game = await createGame(quizId);

      // Auto join as solo player
      const nickname = 'Murid ' + Math.floor(Math.random() * 900 + 100);
      const joinRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}`, {
        // mock store or api
      }).catch(() => null);

      // Save player session directly
      sessionStorage.setItem('yahoot_player', JSON.stringify({
        playerId: `solo_${Date.now()}`,
        nickname,
        gameCode: game.code,
        gameId: game.id,
      }));

      // Start game immediately
      navigate(`/game/${game.code}`);
    } catch (err) {
      setError(err.message || 'Gagal membuka kuis.');
      setStartingQuizId(null);
    }
  };

  const filteredQuizzes = quizzes.filter(q => {
    if (!search) return true;
    const matchTitle = q.title?.toLowerCase().includes(search.toLowerCase());
    const matchCourse = q.course_title?.toLowerCase().includes(search.toLowerCase());
    const matchDesc = q.description?.toLowerCase().includes(search.toLowerCase());
    return matchTitle || matchCourse || matchDesc;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-300 border-2 border-slate-900 rounded-block font-display font-black text-xs text-slate-950 mb-2 shadow-block-sm">
              <Sparkles className="w-4 h-4 fill-amber-500" />
              <span>Katalog Kuis Mandiri Yahoot!</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-950">
              Kuis Publik & Mandiri
            </h1>
            <p className="text-sm font-medium text-slate-600 mt-1">
              Pilih kuis interaktif yang telah dipublikasikan guru untuk belajar atau berlatih mandiri.
            </p>
          </div>

          <Link
            to="/join"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-display font-bold text-sm border-2 border-slate-900 rounded-block shadow-block hover:bg-indigo-700 transition-all self-start sm:self-auto"
          >
            <span>Punya PIN Kelas?</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari materi, topik, atau judul kuis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-[46px] pl-10 pr-4 py-2 bg-white text-sm border-2 border-slate-900 rounded-block shadow-block-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Global Error */}
        {error && (
          <div className="p-4 bg-red-100 border-2 border-red-500 rounded-block text-red-800 text-sm font-bold flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="underline text-xs">
              Tutup
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center bg-white border-2 border-slate-900 rounded-block shadow-block">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-display font-bold text-slate-700">Mengambil daftar kuis publik...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredQuizzes.length === 0 && (
          <div className="p-12 text-center bg-white border-2 border-dashed border-slate-400 rounded-block shadow-block">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="font-display font-black text-lg text-slate-950 mb-1">
              {search ? 'Tidak ada kuis yang cocok' : 'Belum Ada Kuis Publik'}
            </h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              {search
                ? `Tidak ditemukan materi kuis dengan kata kunci "${search}".`
                : 'Kuis yang dipublikasikan oleh guru akan tampil di sini.'}
            </p>
          </div>
        )}

        {/* Quizzes Grid */}
        {!loading && filteredQuizzes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="bg-white flex flex-col justify-between hover:-translate-y-0.5 transition-transform"
                padding="md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block truncate">
                      {quiz.course_title ? `Topik: ${quiz.course_title}` : quiz.course_id ? `Course #${quiz.course_id}` : 'Kuis Umum'}
                    </span>
                    {quiz.is_passed ? (
                      <Badge variant="success" size="sm">
                        Lulus (Skor: {quiz.highest_score})
                      </Badge>
                    ) : quiz.attempts > 0 ? (
                      <Badge variant="warning" size="sm">
                        {quiz.attempts}x Percobaan
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        Belum Dikerjakan
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-display font-black text-lg sm:text-xl text-slate-950 leading-tight mb-1.5">
                    {quiz.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-3">
                    {quiz.description || 'Tidak ada deskripsi tambahan.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-semibold mb-2">
                    <span className="flex items-center gap-1 font-bold text-slate-700">
                      <BookOpen className="w-3.5 h-3.5" />
                      {quiz.total_questions || quiz.questionCount || 0} Soal
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {quiz.time_limit} Menit
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      KKM: {quiz.passing_score}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    ID #{quiz.id}
                  </span>

                  <Button
                    variant="primary"
                    size="sm"
                    loading={startingQuizId === quiz.id}
                    disabled={startingQuizId === quiz.id}
                    onClick={() => handleStartSoloPlay(quiz.id)}
                    className="flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Mulai Kuis</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
