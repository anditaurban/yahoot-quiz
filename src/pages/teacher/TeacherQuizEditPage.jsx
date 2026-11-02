import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Edit3, Trash2, Play, Eye, ArrowLeft, Check, Clock, Award, Settings, CheckCircle2, Upload, FileCode } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { QuizEditor } from '../../components/quiz/QuizEditor';
import { QuestionCard } from '../../components/quiz/QuestionCard';
import { QuestionOption } from '../../components/quiz/QuestionOption';
import {
  getQuiz,
  updateQuiz,
  updateQuizStatus,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkImportQuestions,
  getCourseSections,
  transformAppQuestionToLms,
  transformLmsQuestionToApp
} from '../../services/api/quizzes';
import { createGame } from '../../services/api/games';

export const TeacherQuizEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Quiz Metadata Modal
  const [editingMeta, setEditingMeta] = useState(false);
  const [metaForm, setMetaForm] = useState({
    title: '',
    course_title: '',
    description: '',
    passing_score: 75,
    time_limit: 30,
    section_id: '',
  });
  const [savingMeta, setSavingMeta] = useState(false);

  // Status Updating state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Question modal state: null = closed, 'new' = creating, { questionObj } = editing
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Bulk Import modal state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  // Preview modal state: null = closed, questionObj = active preview
  const [previewQuestion, setPreviewQuestion] = useState(null);

  // Launching game state
  const [startingGame, setStartingGame] = useState(false);

  const fetchQuizData = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) {
      setLoading(true);
    }
    setError('');
    try {
      const data = await getQuiz(id);
      if (data) {
        setQuiz(data);
        setMetaForm({
          title: data.title || '',
          course_title: data.course_title || '',
          description: data.description || '',
          passing_score: data.passing_score ?? 75,
          time_limit: data.time_limit ?? 30,
          section_id: data.section_id ? String(data.section_id) : '',
        });

        // Load sections for course if bound
        if (data.course_id) {
          const secList = await getCourseSections(data.course_id);
          setSections(secList || []);
        }
      }
      return data;
    } catch (err) {
      setError(err.message || 'Gagal memuat detail kuis.');
      return null;
    } finally {
      if (showLoadingSpinner) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchQuizData();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!quiz) return;
    const nextStatus = quiz.status === 'publish' ? 'draft' : 'publish';
    setUpdatingStatus(true);
    setError('');
    try {
      await updateQuizStatus(quiz.id, nextStatus);
      setQuiz(prev => ({ ...prev, status: nextStatus }));
      setSuccessMsg(`Status kuis berhasil diubah menjadi ${nextStatus.toUpperCase()}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Gagal mengubah status kuis.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveMeta = async (e) => {
    e.preventDefault();
    if (!metaForm.title.trim()) {
      setError('Judul kuis tidak boleh kosong.');
      return;
    }
    setSavingMeta(true);
    setError('');
    try {
      await updateQuiz(quiz.id, {
        title: metaForm.title.trim(),
        course_title: metaForm.course_title ? metaForm.course_title.trim() : null,
        description: metaForm.description.trim(),
        passing_score: Number(metaForm.passing_score),
        time_limit: Number(metaForm.time_limit),
        section_id: metaForm.section_id ? Number(metaForm.section_id) : null,
      });

      const selectedSec = sections.find(s => String(s.section_id) === String(metaForm.section_id));
      setQuiz(prev => ({
        ...prev,
        title: metaForm.title.trim(),
        course_title: metaForm.course_title ? metaForm.course_title.trim() : null,
        description: metaForm.description.trim(),
        passing_score: Number(metaForm.passing_score),
        time_limit: Number(metaForm.time_limit),
        section_id: metaForm.section_id ? Number(metaForm.section_id) : null,
        section_name: selectedSec ? selectedSec.title : '',
      }));

      setEditingMeta(false);
      setSuccessMsg('Informasi kuis berhasil diperbarui.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Gagal memperbarui informasi kuis.');
    } finally {
      setSavingMeta(false);
    }
  };

  const handleSaveQuestion = async (questionData) => {
    setError('');
    try {
      if (editingQuestion === 'new') {
        const payload = {
          ...questionData,
          order_index: (quiz.questions?.length || 0) + 1,
        };
        const created = await createQuestion(id, payload);
        setQuiz(prev => ({
          ...prev,
          questions: [...(prev.questions || []), created],
          questionCount: (prev.questions?.length || 0) + 1,
        }));
        setSuccessMsg('Soal baru berhasil ditambahkan.');
      } else if (editingQuestion?.id) {
        const updated = await updateQuestion(editingQuestion.id, {
          ...questionData,
          order_index: editingQuestion.order_index || 1,
        });
        setQuiz(prev => ({
          ...prev,
          questions: prev.questions.map(q => q.id === editingQuestion.id ? updated : q),
        }));
        setSuccessMsg('Pertanyaan berhasil diperbarui.');
      }
      setEditingQuestion(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Gagal menyimpan soal.');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Hapus soal ini dari kuis?')) return;
    setError('');
    try {
      await deleteQuestion(questionId);
      setQuiz(prev => ({
        ...prev,
        questions: prev.questions.filter(q => q.id !== questionId),
        questionCount: Math.max(0, (prev.questions?.length || 1) - 1),
      }));
      setSuccessMsg('Soal berhasil dihapus.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Gagal menghapus soal.');
    }
  };

  const handleBulkImport = async () => {
    setImportError('');
    let parsed = null;
    try {
      parsed = JSON.parse(importJsonText);
    } catch {
      setImportError('Format JSON tidak valid. Pastikan berupa array JSON yang valid.');
      return;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      setImportError('Data harus berupa array JSON yang berisi minimal 1 butir soal.');
      return;
    }

    setImporting(true);
    try {
      const res = await bulkImportQuestions({
        quizId: quiz.id,
        ownerId: quiz.owner_id,
        questions: parsed,
      });

      // 1. Immediately and responsively update UI state with imported questions
      const startingOrder = quiz.questions?.length || 0;
      const importedAppList = res.importedQuestions || parsed.map((item, idx) => {
        const lmsQ = transformAppQuestionToLms(quiz.id, item, quiz.owner_id);
        return transformLmsQuestionToApp({
          ...lmsQ,
          question_id: item.question_id || item.id || `temp_${Date.now()}_${idx}`,
          order_index: item.order_index ? Number(item.order_index) : startingOrder + idx + 1,
        });
      });

      setQuiz(prev => {
        if (!prev) return prev;
        const currentQuestions = prev.questions || [];
        const updatedQuestions = [...currentQuestions, ...importedAppList];
        return {
          ...prev,
          questions: updatedQuestions,
          questionCount: updatedQuestions.length,
          total_questions: updatedQuestions.length,
        };
      });

      setSuccessMsg(res.message || `Berhasil mengimpor ${parsed.length} butir soal quiz.`);
      setImportModalOpen(false);
      setImportJsonText('');

      // 2. Silently re-sync with LMS API with cache-busting (without showing blocking loading spinner)
      const freshData = await fetchQuizData(false);
      if (freshData && freshData.questions && freshData.questions.length > 0) {
        setQuiz(freshData);
      }

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setImportError(err.message || 'Gagal mengimpor butir soal.');
    } finally {
      setImporting(false);
    }
  };

  const handleFillImportExample = () => {
    const example = [
      {
        question_text: "CSS digunakan untuk keperluan apa dalam web?",
        option_a: "Mengatur logika server backend",
        option_b: "Mengatur tampilan visual dan layout",
        option_c: "Menyimpan data database",
        option_d: "Mengirimkan email otomatis",
        correct_answer: "b"
      },
      {
        question_text: "Sebutkan cara deklarasi variabel konstan pada JavaScript ES6:",
        correct_answer: "const"
      },
      {
        question_text: "HTML adalah bahasa pemrograman server-side.",
        option_a: "True",
        option_b: "False",
        correct_answer: "b"
      }
    ];
    setImportJsonText(JSON.stringify(example, null, 2));
    setImportError('');
  };

  const handleStartGame = async () => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      setError('Kuis belum memiliki soal. Tambahkan minimal 1 soal sebelum memulai.');
      return;
    }
    setStartingGame(true);
    setError('');
    try {
      const newGame = await createGame(quiz.id, quiz);
      navigate(`/teacher/games/${newGame.id}/lobby`);
    } catch (err) {
      setError(err.message || 'Gagal memulai game.');
      setStartingGame(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-display font-bold text-slate-700">Memuat Detail Kuis...</p>
        </div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <p className="font-display font-black text-xl text-red-600 mb-2">Gagal Memuat Kuis</p>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <Link
            to="/teacher/quizzes"
            className="inline-block px-4 py-2 bg-indigo-600 text-white font-display font-bold rounded-block border-2 border-slate-900 shadow-block"
          >
            Kembali ke Daftar Kuis
          </Link>
        </Card>
      </div>
    );
  }

  const questions = quiz?.questions || [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link to="/teacher" className="hover:text-indigo-600 hover:underline">
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/teacher/quizzes" className="hover:text-indigo-600 hover:underline">
            Kuis
          </Link>
          <span>/</span>
          <span className="text-slate-900 truncate max-w-xs">{quiz?.title}</span>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-100 border-2 border-emerald-600 rounded-block text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-block-sm">
            <Check className="w-4 h-4 stroke-[3] text-emerald-700" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 bg-red-100 border-2 border-red-500 rounded-block text-red-800 text-sm font-bold flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="underline text-xs">
              Tutup
            </button>
          </div>
        )}

        {/* Quiz Info Header Card */}
        <Card className="bg-white border-3 shadow-block-lg">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-700">
                  Quiz ID: #{quiz?.id}
                </span>

                <button
                  type="button"
                  onClick={handleToggleStatus}
                  disabled={updatingStatus}
                  className={`text-xs px-3 py-1 rounded-full border-2 font-display font-black transition-all ${
                    quiz?.status === 'publish'
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-500 hover:bg-emerald-200'
                      : 'bg-amber-100 text-amber-950 border-amber-500 hover:bg-amber-200'
                  }`}
                >
                  {updatingStatus ? 'Menyimpan...' : quiz?.status === 'publish' ? '● PUBLISHED (Aktif)' : '○ DRAFT (Belum Rilis)'}
                </button>

                {quiz?.course_title && (
                  <Badge variant="warning" size="sm">
                    Topik: {quiz.course_title}
                  </Badge>
                )}

                {quiz?.course_id && (
                  <Badge variant="purple" size="sm">
                    Kursus #{quiz.course_id}
                  </Badge>
                )}

                {quiz?.section_name && (
                  <Badge variant="neutral" size="sm">
                    {quiz.section_name}
                  </Badge>
                )}
              </div>

              <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-950 break-words">
                {quiz?.title}
              </h1>

              <p className="text-sm text-slate-600 mt-1.5 whitespace-pre-line">
                {quiz?.description || 'Tidak ada instruksi tambahan.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  Batas Waktu: {quiz?.time_limit} Menit
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  KKM Kelulusan: {quiz?.passing_score} / 100
                </span>
                <span>
                  Total Soal: {questions.length} Butir
                </span>
              </div>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditingMeta(true)}
                className="flex items-center gap-1.5 w-full justify-center"
              >
                <Settings className="w-4 h-4" />
                <span>Pengaturan Kuis</span>
              </Button>

              <Button
                variant="warning"
                size="md"
                loading={startingGame}
                disabled={questions.length === 0 || startingGame}
                onClick={handleStartGame}
                className="flex items-center gap-1.5 w-full justify-center"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Host Game Sekarang</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Questions Header & Add & Bulk Import Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-display font-black text-xl text-slate-950">
            Daftar Soal Pertanyaan ({questions.length})
          </h2>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setImportModalOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Import Banyak Soal</span>
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => setEditingQuestion('new')}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Soal</span>
            </Button>
          </div>
        </div>

        {/* EMPTY QUESTIONS STATE */}
        {questions.length === 0 && (
          <div className="p-12 text-center bg-white border-2 border-dashed border-slate-400 rounded-block shadow-block">
            <h3 className="font-display font-black text-xl text-slate-950 mb-1">
              Kuis Ini Belum Memiliki Soal
            </h3>
            <p className="text-sm text-slate-600 mb-5 max-w-sm mx-auto">
              Tambahkan butir soal pilihan ganda atau isian singkat, atau gunakan fitur Import Soal Sekaligus.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setImportModalOpen(true)}
                className="flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Bulk Import JSON</span>
              </Button>
              <Button
                variant="primary"
                onClick={() => setEditingQuestion('new')}
                className="flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Tambah Soal Pertama</span>
              </Button>
            </div>
          </div>
        )}

        {/* QUESTIONS LIST */}
        {questions.length > 0 && (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <Card key={q.id || idx} className="bg-white" padding="md">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <span className="w-8 h-8 rounded-block bg-slate-900 text-amber-300 font-display font-black text-sm flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-black text-base sm:text-lg text-slate-950 leading-snug break-words">
                        {q.question}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600 font-semibold">
                        <Badge variant="neutral" size="sm">
                          {q.type === 'true_false'
                            ? 'True / False'
                            : q.type === 'short_answer'
                            ? 'Ketik Isian Singkat'
                            : 'Pilihan Ganda (A-D)'}
                        </Badge>
                        <span className="text-slate-500 font-mono text-[11px]">
                          ID: #{q.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPreviewQuestion(q)}
                      title="Preview Soal"
                      className="!px-2.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingQuestion(q)}
                      title="Edit Soal"
                      className="!px-2.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(q.id)}
                      title="Hapus Soal"
                      className="!px-2.5 text-red-600 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Answers / Options breakdown */}
                {q.type === 'short_answer' ? (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="px-3.5 py-2.5 bg-amber-50 border-2 border-amber-300 rounded-block flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs min-w-0 flex-1 mr-2 break-words">
                        <span className="font-bold text-amber-900 mr-2">KUNCI JAWABAN TEKS:</span>
                        <span className="font-display font-black text-slate-950 text-sm break-words">
                          "{q.correct_answer || q.correctOptionId}"
                        </span>
                      </div>
                      <Badge variant="warning" size="sm" className="shrink-0">
                        Dicocokkan Otomatis
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
                    {(q.options || []).map((opt) => {
                      const isCorrect = String(opt.id).toLowerCase() === String(q.correctOptionId || q.correct_answer).toLowerCase();
                      return (
                        <div
                          key={opt.id}
                          className={`px-3 py-2 text-xs font-display font-bold rounded-block border-2 flex items-center justify-between gap-2 ${
                            isCorrect
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-black'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="truncate min-w-0 flex-1">
                            <span className="uppercase text-slate-500 mr-1.5 shrink-0">[{opt.id}]</span>
                            {opt.text}
                          </span>
                          {isCorrect && (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-800 shrink-0 font-black">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Kunci Benar</span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* EDIT METADATA MODAL */}
        <Modal
          isOpen={editingMeta}
          onClose={() => setEditingMeta(false)}
          title="Edit Informasi Kuis"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSaveMeta} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-display font-bold text-slate-900 mb-1">
                Judul Kuis
              </label>
              <input
                type="text"
                value={metaForm.title}
                onChange={(e) => setMetaForm({ ...metaForm, title: e.target.value })}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm border-2 border-slate-900 rounded-block font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-display font-bold text-slate-900 mb-1">
                Nama Kursus / Topik Bebas
              </label>
              <input
                type="text"
                placeholder="Contoh: Dasar Pemrograman Web"
                value={metaForm.course_title}
                onChange={(e) => setMetaForm({ ...metaForm, course_title: e.target.value })}
                className="w-full min-h-[44px] px-3.5 py-2 text-sm border-2 border-slate-900 rounded-block font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {sections.length > 0 && (
              <div>
                <label className="block text-xs sm:text-sm font-display font-bold text-slate-900 mb-1">
                  Seksi Kurikulum
                </label>
                <select
                  value={metaForm.section_id}
                  onChange={(e) => setMetaForm({ ...metaForm, section_id: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm border-2 border-slate-900 rounded-block font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">-- Tanpa Seksi (General Quiz) --</option>
                  {sections.map(s => (
                    <option key={s.section_id} value={s.section_id}>
                      Bagian {s.order_index}: {s.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-display font-bold text-slate-900 mb-1">
                Deskripsi
              </label>
              <textarea
                rows={3}
                value={metaForm.description}
                onChange={(e) => setMetaForm({ ...metaForm, description: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border-2 border-slate-900 rounded-block font-sans focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-display font-bold text-slate-900 mb-1">
                  KKM Kelulusan (0 - 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={metaForm.passing_score}
                  onChange={(e) => setMetaForm({ ...metaForm, passing_score: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm border-2 border-slate-900 rounded-block font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-display font-bold text-slate-900 mb-1">
                  Batas Waktu (Menit)
                </label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={metaForm.time_limit}
                  onChange={(e) => setMetaForm({ ...metaForm, time_limit: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm border-2 border-slate-900 rounded-block font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-slate-200">
              <Button variant="secondary" type="button" onClick={() => setEditingMeta(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit" loading={savingMeta}>
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Modal>

        {/* BULK IMPORT QUESTIONS MODAL */}
        <Modal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          title="Import Banyak Soal Sekaligus (Bulk Import)"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-slate-600">
                Tempelkan array JSON butir soal pilihan ganda maupun isian singkat.
              </p>
              <button
                type="button"
                onClick={handleFillImportExample}
                className="text-xs font-display font-bold text-indigo-700 hover:underline flex items-center gap-1"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Isi Contoh Format JSON</span>
              </button>
            </div>

            {importError && (
              <div className="p-3 bg-red-100 border-2 border-red-500 rounded-block text-red-800 text-xs sm:text-sm font-bold">
                {importError}
              </div>
            )}

            <div>
              <textarea
                rows={10}
                value={importJsonText}
                onChange={(e) => {
                  setImportJsonText(e.target.value);
                  setImportError('');
                }}
                placeholder='[&#10;  {&#10;    "question_text": "Apa kepanjangan HTML?",&#10;    "option_a": "HyperText Markup Language",&#10;    "option_b": "Hyperlink Text Making Language",&#10;    "correct_answer": "a"&#10;  }&#10;]'
                className="w-full px-3.5 py-2.5 font-mono text-xs sm:text-sm border-2 border-slate-900 rounded-block focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50"
              />
            </div>

            <div className="p-3 bg-indigo-50 border-2 border-indigo-200 rounded-block text-xs text-indigo-950 font-medium space-y-1">
              <p className="font-bold">Pedoman Format JSON:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-700">
                <li><strong>Pilihan Ganda</strong>: sertakan <code className="font-mono bg-white px-1">option_a</code>, <code className="font-mono bg-white px-1">option_b</code>, dan <code className="font-mono bg-white px-1">correct_answer: "a"</code> (atau b/c/d).</li>
                <li><strong>Isian Singkat (Tipe KETIK)</strong>: cukup isi <code className="font-mono bg-white px-1">question_text</code> dan <code className="font-mono bg-white px-1">correct_answer: "jawaban"</code> tanpa opsi a/b/c/d.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-slate-200">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setImportModalOpen(false)}
                disabled={importing}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={importing}
                disabled={!importJsonText.trim()}
                onClick={handleBulkImport}
                className="flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Mulai Import Soal</span>
              </Button>
            </div>
          </div>
        </Modal>

        {/* ADD/EDIT QUESTION MODAL */}
        <Modal
          isOpen={Boolean(editingQuestion)}
          onClose={() => setEditingQuestion(null)}
          title={editingQuestion === 'new' ? 'Tambah Soal Baru' : 'Edit Pertanyaan'}
          maxWidth="max-w-xl"
        >
          <QuizEditor
            initialQuestion={typeof editingQuestion === 'object' ? editingQuestion : null}
            onSave={handleSaveQuestion}
            onCancel={() => setEditingQuestion(null)}
          />
        </Modal>

        {/* QUESTION PREVIEW MODAL */}
        <Modal
          isOpen={Boolean(previewQuestion)}
          onClose={() => setPreviewQuestion(null)}
          title="Pratinjau Tampilan Soal"
          maxWidth="max-w-2xl"
        >
          {previewQuestion && (
            <div className="space-y-4">
              <QuestionCard
                question={previewQuestion.question}
                currentIndex={0}
                totalQuestions={1}
                timeLimit={previewQuestion.timeLimit}
                type={previewQuestion.type}
                showTimer={false}
              />

              {previewQuestion.type === 'short_answer' ? (
                <div className="p-4 bg-amber-50 border-2 border-slate-900 rounded-block text-center space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase block">
                    Mode Isian Singkat (Tipe KETIK)
                  </span>
                  <p className="text-sm font-semibold text-slate-700">
                    Siswa menjawab dengan mengetikkan teks di gawai masing-masing.
                  </p>
                  <div className="inline-block px-4 py-2 bg-emerald-100 border-2 border-emerald-600 rounded-block font-display font-black text-emerald-950">
                    Kunci Jawaban: "{previewQuestion.correct_answer || previewQuestion.correctOptionId}"
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {previewQuestion.options.map((opt, idx) => (
                    <QuestionOption
                      key={opt.id}
                      index={idx}
                      option={opt}
                      type={previewQuestion.type}
                      isLocked={true}
                      isSelected={String(opt.id).toLowerCase() === String(previewQuestion.correctOptionId || previewQuestion.correct_answer).toLowerCase()}
                    />
                  ))}
                </div>
              )}

              <div className="text-center pt-2">
                <Button variant="secondary" size="sm" onClick={() => setPreviewQuestion(null)}>
                  Tutup Pratinjau
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};
