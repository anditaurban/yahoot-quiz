import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Plus,
  Play,
  BookOpen,
  Layers,
  ArrowRight,
  Clock,
  Award,
  HelpCircle,
  History,
  Download,
  Users,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { HowToPlayModal } from '../../components/common/HowToPlayModal';
import { getQuizzes, getQuiz, DEFAULT_COURSE_ID } from '../../services/api/quizzes';
import { createGame, getGameHistory, getResults, getGameById } from '../../services/api/games';
import { exportQuizResultsToCsv } from '../../utils/exportQuizReport';

export const TeacherDashboardPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingGameId, setStartingGameId] = useState(null);
  const [error, setError] = useState('');
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Game History State
  const [gameHistory, setGameHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [downloadingSessionId, setDownloadingSessionId] = useState(null);
  const [historyNotice, setHistoryNotice] = useState('');

  const fetchQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getQuizzes();
      setQuizzes(data);
    } catch (err) {
      setError(err.message || 'Gagal mengambil daftar kuis.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const historyData = await getGameHistory();
      setGameHistory(historyData || []);
    } catch (err) {
      console.warn('Game history fetch error:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    fetchHistory();
  }, []);

  const handleDownloadHistoryExcel = async (session) => {
    const sid = session.id || session.gameId;
    setDownloadingSessionId(sid);
    setHistoryNotice('');
    try {
      const [gameData, resData] = await Promise.all([
        getGameById(sid).catch(() => session),
        getResults(sid),
      ]);
      const fileName = exportQuizResultsToCsv({
        game: gameData || session,
        results: resData,
      });
      setHistoryNotice(`Rekap Excel untuk PIN ${session.pinCode || session.code || sid} berhasil diunduh (${fileName})!`);
      setTimeout(() => setHistoryNotice(''), 5000);
    } catch (err) {
      alert(err.message || 'Gagal mengunduh file rekap kuis.');
    } finally {
      setDownloadingSessionId(null);
    }
  };

  const handleStartGame = async (quizId) => {
    setStartingGameId(quizId);
    setError('');
    try {
      // Ensure full quiz detail & questions are loaded from LMS API
      const fullQuiz = await getQuiz(quizId);
      if (!fullQuiz.questions || fullQuiz.questions.length === 0) {
        throw new Error('Kuis belum memiliki soal. Tambahkan minimal 1 soal sebelum memulai.');
      }
      const newGame = await createGame(quizId, fullQuiz);
      navigate(`/teacher/games/${newGame.id}/lobby`);
    } catch (err) {
      setError(err.message || 'Gagal membuka sesi game.');
      setStartingGameId(null);
    }
  };

  const totalQuestions = quizzes.reduce((sum, q) => sum + (q.questionCount || 0), 0);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 border-2 border-slate-900 rounded-block font-display font-black text-xs text-indigo-950 mb-2 shadow-block-sm">
              <GraduationCap className="w-4 h-4 stroke-[2.5]" />
              <span>Ruang Kerja Guru</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-950">
              Dashboard Guru
            </h1>
            <p className="text-sm font-medium text-slate-600 mt-1">
              Kelola koleksi materi kuis dan selenggarakan permainan interaktif di kelas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowGuideModal(true)}
              className="flex items-center gap-1.5 bg-amber-300 hover:bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-block-sm"
            >
              <HelpCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Panduan Guru</span>
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/teacher/quizzes/new')}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Buat Kuis Baru</span>
            </Button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 bg-red-100 border-2 border-red-500 rounded-block text-red-800 text-sm font-bold flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="underline text-xs">
              Tutup
            </button>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold text-slate-500">Total Kuis</span>
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="font-display font-black text-3xl text-slate-950">{quizzes.length}</p>
            <p className="text-xs text-slate-500 mt-1">Koleksi kuis tersimpan</p>
          </Card>

          <Card className="bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold text-slate-500">Kuis Siap Host</span>
              <Layers className="w-5 h-5 text-amber-600" />
            </div>
            <p className="font-display font-black text-3xl text-slate-950">
              {quizzes.filter(q => q.status === 'publish').length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Status Published</p>
          </Card>

          <Card className="bg-amber-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-black text-slate-900">Aksi Cepat</span>
              <Play className="w-5 h-5 fill-slate-900" />
            </div>
            <p className="font-display font-bold text-sm text-slate-900 mb-2">
              Pilih kuis di bawah lalu klik "Host Game" untuk membuka lobi dengan PIN 5 digit.
            </p>
          </Card>
        </div>

        {/* Recent Quizzes List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-black text-xl text-slate-950">
              Daftar Kuis
            </h2>
            <Link
              to="/teacher/quizzes"
              className="text-xs font-bold text-indigo-700 hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua Kuis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="p-12 text-center bg-white border-2 border-slate-900 rounded-block shadow-block">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="font-display font-bold text-slate-700">Memuat koleksi kuis...</p>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && quizzes.length === 0 && (
            <div className="p-10 text-center bg-white border-2 border-dashed border-slate-400 rounded-block shadow-block">
              <div className="w-12 h-12 rounded-block bg-indigo-50 border-2 border-slate-900 flex items-center justify-center text-indigo-600 mx-auto mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg text-slate-950 mb-1">
                Belum Ada Kuis Tersedia
              </h3>
              <p className="text-sm text-slate-600 mb-4 max-w-md mx-auto">
                Mulai buat kuis pertama Anda dengan menambahkan pertanyaan.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/teacher/quizzes/new')}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Buat Kuis Sekarang</span>
              </Button>
            </div>
          )}

          {/* SUCCESS STATE */}
          {!loading && quizzes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  className="bg-white hover:-translate-y-0.5 transition-all flex flex-col justify-between"
                  padding="md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block truncate">
                          ID #{quiz.id} • {quiz.course_title ? `Topik: ${quiz.course_title}` : quiz.course_id ? `Kursus #${quiz.course_id}` : 'Kuis Bebas'} {quiz.section_name ? `(${quiz.section_name})` : ''}
                        </span>
                        <h3 className="font-display font-black text-xl text-slate-950 leading-tight mt-0.5 break-words line-clamp-2">
                          {quiz.title}
                        </h3>
                      </div>
                      <Badge
                        variant={quiz.status === 'publish' ? 'success' : 'neutral'}
                        size="sm"
                        className="shrink-0"
                      >
                        {quiz.status === 'publish' ? 'Publish' : 'Draft'}
                      </Badge>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-3">
                      {quiz.description || 'Tidak ada deskripsi.'}
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

                  <div className="pt-3 border-t-2 border-slate-100 flex items-center justify-between gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/teacher/quizzes/${quiz.id}/edit`)}
                    >
                      Kelola Soal
                    </Button>

                    <Button
                      variant="warning"
                      size="sm"
                      loading={startingGameId === quiz.id}
                      disabled={startingGameId === quiz.id}
                      onClick={() => handleStartGame(quiz.id)}
                      className="flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Host Game</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Game Sessions History & Excel Recap */}
        <div className="pt-6 border-t-3 border-slate-900/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600 stroke-[2.5]" />
                <h2 className="font-display font-black text-xl text-slate-950">
                  Riwayat Sesi Kuis & Rekap Nilai
                </h2>
              </div>
              <p className="text-xs font-medium text-slate-600 mt-0.5">
                Semua sesi kuis tersimpan otomatis di sini. Guru dapat mengunduh rekap Excel (.csv) kapan saja tanpa khawatir data hilang.
              </p>
            </div>

            <Badge variant="purple" size="sm" className="shrink-0 self-start sm:self-auto">
              {gameHistory.length} Sesi Tercatat
            </Badge>
          </div>

          {/* History Notice Toast */}
          {historyNotice && (
            <div className="p-3 bg-emerald-100 border-2 border-emerald-500 rounded-block text-emerald-950 text-xs font-bold flex items-center justify-between shadow-block-xs">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {historyNotice}
              </span>
              <button onClick={() => setHistoryNotice('')} className="underline text-[11px]">
                Tutup
              </button>
            </div>
          )}

          {/* HISTORY LOADING */}
          {historyLoading && (
            <div className="p-8 text-center bg-white border-2 border-slate-900 rounded-block shadow-block">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">Memuat riwayat sesi kuis...</p>
            </div>
          )}

          {/* HISTORY EMPTY */}
          {!historyLoading && gameHistory.length === 0 && (
            <div className="p-8 text-center bg-white border-2 border-dashed border-slate-300 rounded-block shadow-block-sm">
              <div className="w-10 h-10 rounded-block bg-slate-100 border-2 border-slate-900 flex items-center justify-center text-slate-500 mx-auto mb-2">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-base text-slate-950 mb-1">
                Belum Ada Riwayat Sesi Kuis
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Setelah Anda memulai dan menyelesaikan sesi permainan kuis kelas (Host Game), rekap skor dan matriks jawaban murid akan tercatat di sini.
              </p>
            </div>
          )}

          {/* HISTORY LIST TABLE */}
          {!historyLoading && gameHistory.length > 0 && (
            <div className="bg-white border-3 border-slate-900 rounded-block shadow-block overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-900 font-display font-black text-slate-900">
                      <th className="py-2.5 px-3 sm:px-4">Waktu & Tanggal</th>
                      <th className="py-2.5 px-3 sm:px-4">Judul Kuis</th>
                      <th className="py-2.5 px-3 sm:px-4 text-center">PIN</th>
                      <th className="py-2.5 px-3 sm:px-4 text-center">Peserta</th>
                      <th className="py-2.5 px-3 sm:px-4 text-center">Status</th>
                      <th className="py-2.5 px-3 sm:px-4 text-right">Aksi & Rekap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {gameHistory.map((session) => {
                      const sid = session.id || session.gameId;
                      const dateStr = session.createdAt
                        ? new Date(session.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-';
                      const isDownloading = downloadingSessionId === sid;

                      return (
                        <tr key={sid} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3 sm:px-4 font-mono text-[11px] sm:text-xs text-slate-600 whitespace-nowrap">
                            {dateStr}
                          </td>
                          <td className="py-3 px-3 sm:px-4">
                            <span className="font-display font-bold text-slate-950 block text-xs sm:text-sm leading-snug">
                              {session.quizTitle || `Kuis #${session.quizId || ''}`}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              ID: {sid}
                            </span>
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-center">
                            <span className="font-display font-black text-xs px-2 py-0.5 bg-amber-200 border border-slate-900 rounded font-mono">
                              {session.pinCode || session.code || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-center font-bold text-slate-800 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
                              {session.totalPlayers || 0} Murid
                            </span>
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                            <Badge
                              variant={session.status === 'finished' ? 'success' : 'warning'}
                              size="sm"
                            >
                              {session.status === 'finished' ? 'Selesai' : 'Aktif'}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                              <button
                                type="button"
                                onClick={() => handleDownloadHistoryExcel(session)}
                                disabled={isDownloading}
                                title="Download Rekap Excel (.csv)"
                                className="px-2.5 py-1 text-xs font-display font-bold bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-slate-900 rounded-block shadow-block-xs flex items-center gap-1 transition-transform active:translate-y-0.5 disabled:opacity-50"
                              >
                                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>{isDownloading ? 'Mengunduh...' : 'Unduh Excel'}</span>
                              </button>

                              <Link
                                to={`/teacher/games/${sid}/results`}
                                className="px-2.5 py-1 text-xs font-display font-bold bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 rounded-block shadow-block-xs transition-transform active:translate-y-0.5"
                              >
                                Lihat Detail &rarr;
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* How To Play Modal */}
      <HowToPlayModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        initialRole="guru"
      />
    </div>
  );
};
