import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { createQuiz, DEFAULT_OWNER_ID } from '../../services/api/quizzes';

export const TeacherQuizCreatePage = () => {
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingScore, setPassingScore] = useState(75);
  const [timeLimit, setTimeLimit] = useState(30); // in minutes
  const [status, setStatus] = useState('draft');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul kuis tidak boleh kosong.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        owner_id: DEFAULT_OWNER_ID,
        title: title.trim(),
        description: description.trim(),
        passing_score: Number(passingScore),
        time_limit: Number(timeLimit),
        status,
        course_id: null,
        course_title: null,
        section_id: null,
      };

      const newQuiz = await createQuiz(payload);
      navigate(`/teacher/quizzes/${newQuiz.id}/edit`);
    } catch (err) {
      setError(err.message || 'Gagal membuat kuis.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <Link to="/teacher" className="hover:text-indigo-600 hover:underline">
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/teacher/quizzes" className="hover:text-indigo-600 hover:underline">
            Kuis
          </Link>
          <span>/</span>
          <span className="text-slate-900">Buat Baru</span>
        </div>

        <Card className="bg-white border-3 shadow-block-lg">
          <div className="mb-6">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-950 mb-1">
              Buat Kuis Baru
            </h1>
            <p className="text-sm text-slate-600">
              Buat materi kuis baru dan kelola butir soal untuk sesi permainan interaktif di kelas.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-100 border-2 border-red-500 rounded-block text-red-800 text-xs sm:text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Judul Kuis"
              placeholder="Contoh: Kuis Logika Dasar & Pemrograman Web"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              required
              autoFocus
            />

            <div>
              <label className="block text-xs sm:text-sm font-display font-bold text-slate-900 mb-1.5">
                Deskripsi atau Instruksi Siswa
              </label>
              <textarea
                rows={3}
                placeholder="Kerjakan soal pilihan ganda berikut dengan cermat dan jujur..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border-2 border-slate-900 rounded-block focus:outline-none focus:ring-2 focus:ring-amber-400 font-sans"
              />
            </div>

            {/* Passing score & Time limit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-display font-bold text-slate-900 mb-1.5">
                  Batas Kelulusan (KKM: 0 - 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm border-2 border-slate-900 rounded-block font-sans font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-display font-bold text-slate-900 mb-1.5">
                  Batas Waktu Total (Menit)
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm border-2 border-slate-900 rounded-block font-sans font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs sm:text-sm font-display font-bold text-slate-900 mb-1.5">
                Status Kuis
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-white text-sm font-semibold border-2 border-slate-900 rounded-block focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="draft">Draft (Disimpan sebagai draft)</option>
                <option value="publish">Publish (Siap dimainkan murid)</option>
              </select>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t-2 border-slate-100 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => navigate('/teacher/quizzes')}
                className="flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Batal</span>
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <span>+ Simpan & Lanjut Buat Soal</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
