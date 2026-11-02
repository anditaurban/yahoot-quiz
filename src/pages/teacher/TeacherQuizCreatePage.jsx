import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, ArrowRight, ArrowLeft, BookOpen, Layers } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  createQuiz,
  getCourses,
  getCourseSections,
  DEFAULT_COURSE_ID,
  DEFAULT_OWNER_ID,
} from '../../services/api/quizzes';

export const TeacherQuizCreatePage = () => {
  const navigate = useNavigate();

  // Course Mode: 'pilih' (LMS Course) | 'ketik' (Custom Course/Topic) | 'bebas' (General Standalone)
  const [courseMode, setCourseMode] = useState('ketik');

  // Form State
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState(DEFAULT_COURSE_ID);
  const [customCourseTitle, setCustomCourseTitle] = useState('');
  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingScore, setPassingScore] = useState(75);
  const [timeLimit, setTimeLimit] = useState(30); // in minutes
  const [status, setStatus] = useState('draft');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch courses list
  useEffect(() => {
    const fetchCoursesList = async () => {
      try {
        const list = await getCourses(DEFAULT_OWNER_ID);
        if (list && list.length > 0) {
          setCourses(list);
          setCourseId(list[0].course_id);
        }
      } catch (err) {
        console.warn('Courses fetch error:', err);
      }
    };
    fetchCoursesList();
  }, []);

  // Fetch sections whenever courseId changes (only relevant in 'pilih' mode)
  useEffect(() => {
    const fetchSectionsList = async () => {
      try {
        const secList = await getCourseSections(courseId);
        setSections(secList || []);
        if (secList && secList.length > 0) {
          setSectionId(String(secList[0].section_id));
        } else {
          setSectionId('');
        }
      } catch (err) {
        console.warn('Sections fetch error:', err);
      }
    };
    if (courseMode === 'pilih' && courseId) {
      fetchSectionsList();
    }
  }, [courseMode, courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul kuis tidak boleh kosong.');
      return;
    }

    if (courseMode === 'ketik' && !customCourseTitle.trim()) {
      setError('Nama topik atau kursus tidak boleh kosong pada mode KETIK.');
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
      };

      if (courseMode === 'pilih') {
        payload.course_id = Number(courseId);
        payload.section_id = sectionId ? Number(sectionId) : null;
      } else if (courseMode === 'ketik') {
        payload.course_title = customCourseTitle.trim();
        payload.course_id = null;
        payload.section_id = null;
      } else {
        // Mode 'bebas'
        payload.course_id = null;
        payload.course_title = null;
        payload.section_id = null;
      }

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
              Pilih mode kursus fleksibel: pilih dari daftar kursus, ketik nama materi sendiri, atau kuis umum mandiri.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-100 border-2 border-red-500 rounded-block text-red-800 text-xs sm:text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Course Mode Selector */}
            <div>
              <label className="block text-xs sm:text-sm font-display font-bold text-slate-900 mb-1.5">
                Mode Kursus / Topik
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCourseMode('ketik')}
                  className={`p-2.5 text-xs font-display font-bold border-2 border-slate-900 rounded-block text-center transition-all ${
                    courseMode === 'ketik'
                      ? 'bg-amber-300 text-slate-950 shadow-block'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-black text-sm">Mode KETIK</span>
                  <span className="text-[11px] font-normal text-slate-700">Ketik materi bebas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCourseMode('pilih')}
                  className={`p-2.5 text-xs font-display font-bold border-2 border-slate-900 rounded-block text-center transition-all ${
                    courseMode === 'pilih'
                      ? 'bg-indigo-600 text-white shadow-block'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-black text-sm">Mode PILIH</span>
                  <span className="text-[11px] font-normal">Pilih dari daftar kursus</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCourseMode('bebas')}
                  className={`p-2.5 text-xs font-display font-bold border-2 border-slate-900 rounded-block text-center transition-all ${
                    courseMode === 'bebas'
                      ? 'bg-emerald-500 text-slate-950 shadow-block'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-black text-sm">Mode BEBAS</span>
                  <span className="text-[11px] font-normal text-slate-700">Tanpa kursus / umum</span>
                </button>
              </div>
            </div>

            {/* Mode 2: KETIK custom course title */}
            {courseMode === 'ketik' && (
              <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-block">
                <Input
                  label="Nama Kursus / Topik Bebas"
                  placeholder="Contoh: Dasar Pemrograman Web, IPA Kelas 8, dsb."
                  value={customCourseTitle}
                  onChange={(e) => {
                    setCustomCourseTitle(e.target.value);
                    setError('');
                  }}
                  required
                />
                <p className="text-[11px] text-amber-900 font-medium mt-1">
                  Kuis akan diberi label topik ini tanpa harus terdaftar sebelumnya di database kursus LMS.
                </p>
              </div>
            )}

            {/* Mode 1: PILIH existing course & optional section */}
            {courseMode === 'pilih' && (
              <div className="p-3.5 bg-indigo-50 border-2 border-indigo-200 rounded-block space-y-3">
                {courses.length > 0 ? (
                  <div>
                    <label className="block text-xs sm:text-sm font-display font-bold text-slate-900 mb-1.5">
                      Pilih Kursus Terdaftar
                    </label>
                    <select
                      value={courseId}
                      onChange={(e) => setCourseId(Number(e.target.value))}
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-white text-sm font-semibold border-2 border-slate-900 rounded-block focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      {courses.map(c => (
                        <option key={c.course_id} value={c.course_id}>
                          Kursus #{c.course_id}: {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 font-semibold">
                    Memuat daftar kursus...
                  </p>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-display font-bold text-slate-900 mb-1.5">
                    Seksi Kurikulum Kursus (Opsional)
                  </label>
                  <select
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-white text-sm font-semibold border-2 border-slate-900 rounded-block focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">-- Tanpa Seksi (General Course Quiz) --</option>
                    {sections.map(s => (
                      <option key={s.section_id} value={s.section_id}>
                        Bagian {s.order_index}: {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Mode 3: BEBAS feedback */}
            {courseMode === 'bebas' && (
              <div className="p-3 bg-emerald-50 border-2 border-emerald-300 rounded-block text-xs font-semibold text-emerald-900">
                ✨ Kuis ini bersifat umum dan mandiri (standalone), cocok untuk ice-breaking atau permainan kuis terbuka.
              </div>
            )}

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
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-display font-bold text-slate-900 mb-1.5">
                  Batas Waktu Pengerjaan (Menit)
                </label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm border-2 border-slate-900 rounded-block font-sans font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>
            </div>

            {/* Initial Publication Status */}
            <div>
              <label className="block text-xs sm:text-sm font-display font-bold text-slate-900 mb-1.5">
                Status Awal
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('draft')}
                  className={`py-2 px-3 text-xs sm:text-sm font-display font-bold border-2 border-slate-900 rounded-block transition-all ${
                    status === 'draft'
                      ? 'bg-indigo-600 text-white shadow-block'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Draft (Belum Tampil di Siswa)
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('publish')}
                  className={`py-2 px-3 text-xs sm:text-sm font-display font-bold border-2 border-slate-900 rounded-block transition-all ${
                    status === 'publish'
                      ? 'bg-emerald-600 text-white shadow-block'
                      : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Publish (Langsung Siap)
                </button>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-slate-100 flex items-center justify-between">
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/teacher/quizzes')}
              >
                Batal
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                className="flex items-center gap-2"
              >
                <span>Lanjutkan Tambah Soal</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
