import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Play,
  Edit3,
  Trash2,
  ArrowLeft,
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Users,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  getQuizzes,
  getQuiz,
  deleteQuiz,
  updateQuizStatus,
  getCourses,
  DEFAULT_COURSE_ID,
} from '../../services/api/quizzes';
import { createGame, getGameHistory, getResults, getGameById } from '../../services/api/games';
import { exportQuizResultsToCsv } from '../../utils/exportQuizReport';

export const TeacherQuizListPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');

  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startingGameId, setStartingGameId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // History & Recap State
  const [gameHistory, setGameHistory] = useState([]);
  const [downloadingSessionId, setDownloadingSessionId] = useState(null);
  const [selectedQuizForHistory, setSelectedQuizForHistory] = useState(null);
  const [recapNotice, setRecapNotice] = useState('');

  // Delete modal state
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load courses list once
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const list = await getCourses();
        if (list && list.length > 0) {
          setCourses(list);
        }
      } catch (err) {
        console.warn('Courses error:', err);
      }
    };
    loadCourses();
  }, []);

  const fetchQuizzes = async (currentPage = page, searchQuery = search, courseFilter = selectedCourseFilter) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        search: searchQuery,
        returnFullResponse: true,
      };

      if (courseFilter !== 'all') {
        params.courseId = Number(courseFilter);
        params.useCourseTable = true;
      }

      const result = await getQuizzes(params);
      setQuizzes(result.tableData || []);
      setTotalPages(result.totalPages || 1);
      setTotalRecords(result.totalRecords || 0);
      setPage(result.currentPage || currentPage);
    } catch (err) {
      setError(err.message || 'Gagal memuat daftar kuis.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const historyData = await getGameHistory();
      setGameHistory(historyData || []);
    } catch (err) {
      console.warn('Game history fetch error:', err);
    }
  };

  useEffect(() => {
    fetchQuizzes(1, search, selectedCourseFilter);
    fetchHistory();
  }, [selectedCourseFilter]);

  const handleDownloadHistoryExcel = async (session) => {
    const sid = session.id || session.gameId;
    setDownloadingSessionId(sid);
    setRecapNotice('');
    try {
      const [gameData, resData] = await Promise.all([
        getGameById(sid).catch(() => session),
        getResults(sid),
      ]);
      const fileName = exportQuizResultsToCsv({
        game: gameData || session,
        results: resData,
      });
      setRecapNotice(`Rekap Excel untuk PIN ${session.pinCode || session.code || sid} berhasil diunduh (${fileName})!`);
      setTimeout(() => setRecapNotice(''), 5000);
    } catch (err) {
      alert(err.message || 'Gagal mengunduh file rekap kuis.');
    } finally {
      setDownloadingSessionId(null);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuizzes(1, search, selectedCourseFilter);
  };

  const handleStartGame = async (quizId) => {
    setStartingGameId(quizId);
    setError('');
    try {
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

  const handleToggleStatus = async (quiz) => {
    const nextStatus = quiz.status === 'publish' ? 'draft' : 'publish';
    setStatusUpdatingId(quiz.id);
    try {
      await updateQuizStatus(quiz.id, nextStatus);
      setQuizzes(prev => prev.map(q => q.id === quiz.id ? { ...q, status: nextStatus } : q));
    } catch (err) {
      setError(err.message || 'Gagal memperbarui status kuis.');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!quizToDelete) return;
    setDeleting(true);
    try {
      await deleteQuiz(quizToDelete.id);
      setQuizzes(prev => prev.filter(q => q.id !== quizToDelete.id));
      setTotalRecords(prev => Math.max(0, prev - 1));
      setQuizToDelete(null);
    } catch (err) {
      setError(err.message || 'Gagal menghapus kuis.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link to="/teacher" className="hover:text-indigo-600 hover:underline">
            Dashboard Guru
          </Link>
          <span>/</span>
          <span className="text-slate-900">Koleksi Kuis</span>
        </div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-black text-3xl text-slate-950">
              Koleksi Kuis
            </h1>
            <p className="text-sm font-medium text-slate-600 mt-0.5">
              Kelola koleksi materi kuis: buat kuis, atur status publikasi, dan host live game.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/teacher/quizzes/new')}
            className="flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Buat Kuis Baru</span>
          </Button>
        </div>

        {/* Course Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="sm:w-72">
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 bg-white text-sm font-display font-bold border-2 border-slate-900 rounded-block shadow-block-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="all">🌟 Semua Kuis Yahoot! (Koleksi Penuh)</option>
              {courses.map(c => (
                <option key={c.course_id} value={String(c.course_id)}>
                  Filter Course #{c.course_id}: {c.title}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <input
              type="text"
              placeholder="Cari judul kuis atau materi... (Tekan Enter)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-h-[44px] pl-10 pr-20 py-2 bg-white text-sm border-2 border-slate-900 rounded-block shadow-block-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-block hover:bg-slate-800"
            >
              Cari
            </button>
          </form>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-red-100 border-2 border-red-500 rounded-block text-red-800 text-sm font-bold flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="underline text-xs">
              Tutup
            </button>
          </div>
        )}

        {/* Recap Notice Toast */}
        {recapNotice && (
          <div className="p-3.5 bg-emerald-100 border-2 border-emerald-500 rounded-block text-emerald-950 text-xs sm:text-sm font-bold flex items-center justify-between shadow-block-xs">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {recapNotice}
            </span>
            <button onClick={() => setRecapNotice('')} className="underline text-xs">
              Tutup
            </button>
          </div>
        )}

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
            <div className="w-12 h-12 rounded-block bg-slate-100 border-2 border-slate-900 flex items-center justify-center text-slate-600 mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-display font-black text-lg text-slate-950 mb-1">
              {search ? 'Tidak ada kuis yang cocok' : 'Belum Ada Kuis'}
            </h3>
            <p className="text-sm text-slate-600 mb-4 max-w-sm mx-auto">
              {search
                ? `Tidak ditemukan kuis dengan kata kunci "${search}".`
                : 'Mulai buat kuis pertama Anda sekarang.'}
            </p>
            {search ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearch('');
                  fetchQuizzes(1, '', selectedCourseId);
                }}
              >
                Bersihkan Pencarian
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => navigate('/teacher/quizzes/new')}
                className="flex items-center gap-1.5 mx-auto"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Buat Kuis Sekarang</span>
              </Button>
            )}
          </div>
        )}

        {/* QUIZ GRID */}
        {!loading && quizzes.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map((quiz) => {
                const quizSessions = gameHistory.filter((s) => String(s.quizId) === String(quiz.id));

                return (
                  <Card
                    key={quiz.id}
                    className="bg-white flex flex-col justify-between"
                    padding="md"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block truncate">
                            ID #{quiz.id} • {quiz.course_title ? `Topik: ${quiz.course_title}` : quiz.course_id ? `Kursus #${quiz.course_id}` : 'Kuis Bebas'} {quiz.section_name ? `(${quiz.section_name})` : ''}
                          </span>
                          <h3 className="font-display font-black text-lg sm:text-xl text-slate-950 leading-tight mt-0.5 break-words line-clamp-2">
                            {quiz.title}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(quiz)}
                          disabled={statusUpdatingId === quiz.id}
                          title="Klik untuk ubah status publish/draft"
                          className={`text-xs px-2.5 py-0.5 rounded-full border-2 font-display font-black shrink-0 transition-all ${
                            quiz.status === 'publish'
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-500 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {statusUpdatingId === quiz.id ? '...' : quiz.status === 'publish' ? '● Publish' : '○ Draft'}
                        </button>
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
                        {quizSessions.length > 0 && (
                          <span className="flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                            {quizSessions.length} Sesi Rekap
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t-2 border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/teacher/quizzes/${quiz.id}/edit`)}
                          title="Kelola pertanyaan"
                          className="!px-2.5"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setQuizToDelete(quiz)}
                          title="Hapus kuis"
                          className="!px-2.5 text-red-600 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                        {/* Rekap Nilai Button */}
                        {quizSessions.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (quizSessions.length === 1) {
                                handleDownloadHistoryExcel(quizSessions[0]);
                              } else {
                                setSelectedQuizForHistory({ quiz, sessions: quizSessions });
                              }
                            }}
                            disabled={downloadingSessionId === (quizSessions[0]?.id || quizSessions[0]?.gameId)}
                            title="Unduh rekap nilai siswa Excel (.csv)"
                            className="px-2 py-1 text-xs font-display font-bold bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-slate-900 rounded-block shadow-block-xs flex items-center gap-1 transition-transform active:translate-y-0.5 disabled:opacity-50"
                          >
                            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>
                              {downloadingSessionId === (quizSessions[0]?.id || quizSessions[0]?.gameId)
                                ? '...'
                                : `Rekap${quizSessions.length > 1 ? ` (${quizSessions.length})` : ''}`}
                            </span>
                          </button>
                        )}
                      </div>

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
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t-2 border-slate-200">
                <span className="text-xs font-bold text-slate-600">
                  Total {totalRecords} kuis (Halaman {page} dari {totalPages})
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => fetchQuizzes(page - 1, search, selectedCourseId)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Sebelumnya</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => fetchQuizzes(page + 1, search, selectedCourseId)}
                  >
                    <span>Berikutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        <Modal
          isOpen={Boolean(quizToDelete)}
          onClose={() => setQuizToDelete(null)}
          title="Hapus Kuis?"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-700">
              Apakah Anda yakin ingin menghapus kuis <span className="font-bold">"{quizToDelete?.title}"</span>?
              Tindakan ini akan menonaktifkan kuis secara soft delete.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setQuizToDelete(null)}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={deleting}
                onClick={handleConfirmDelete}
              >
                Hapus Sekarang
              </Button>
            </div>
          </div>
        </Modal>

        {/* RECAP HISTORY MODAL PER QUIZ */}
        {selectedQuizForHistory && (
          <Modal
            isOpen={Boolean(selectedQuizForHistory)}
            onClose={() => setSelectedQuizForHistory(null)}
            title={`Riwayat Rekap Nilai: ${selectedQuizForHistory.quiz.title}`}
            maxWidth="max-w-xl"
          >
            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-600">
                Berikut adalah daftar sesi permainan live yang pernah di-host untuk kuis ini. Anda dapat mengunduh rekap Excel (.csv) atau melihat detail hasil kuis per sesi.
              </p>

              <div className="divide-y divide-slate-200 border-2 border-slate-900 rounded-block overflow-hidden max-h-80 overflow-y-auto">
                {selectedQuizForHistory.sessions.map((s, idx) => {
                  const sid = s.id || s.gameId;
                  const dateStr = s.createdAt
                    ? new Date(s.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-';
                  const isDownloading = downloadingSessionId === sid;

                  return (
                    <div key={sid} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-black text-xs px-2 py-0.5 bg-amber-200 border border-slate-900 rounded font-mono">
                            PIN: {s.pinCode || s.code || '-'}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            Sesi #{selectedQuizForHistory.sessions.length - idx}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-semibold">
                          <span>{dateStr}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-indigo-600" />
                            {s.totalPlayers || 0} Murid
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDownloadHistoryExcel(s)}
                          disabled={isDownloading}
                          className="px-2.5 py-1 text-xs font-display font-bold bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-slate-900 rounded-block shadow-block-xs flex items-center gap-1 transition-transform active:translate-y-0.5 disabled:opacity-50"
                        >
                          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{isDownloading ? 'Mengunduh...' : 'Unduh Excel'}</span>
                        </button>

                        <Link
                          to={`/teacher/games/${sid}/results`}
                          className="px-2.5 py-1 text-xs font-display font-bold bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 rounded-block shadow-block-xs"
                        >
                          Lihat Detail &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};
