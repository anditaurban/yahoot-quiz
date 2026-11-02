import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Gamepad2, GraduationCap, ArrowRight, Zap, Trophy, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleQuickJoin = (e) => {
    e.preventDefault();
    const cleanPin = pin.trim();
    if (!cleanPin) {
      setError('Masukkan 5 digit PIN game.');
      return;
    }
    navigate(`/join?pin=${cleanPin}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between game-grid-pattern py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto w-full">
        {/* Main Banner */}
        <div className="text-center my-6 sm:my-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-300 border-2 border-slate-900 rounded-block shadow-block-sm text-xs sm:text-sm font-display font-black text-slate-950 mb-4">
            <Zap className="w-4 h-4 fill-amber-500" />
            <span>Kuis Interaktif Kelas & Komunitas</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-slate-950 tracking-tight leading-none mb-4">
            Bermain Kuis Jadi <span className="underline decoration-indigo-600 decoration-wavy decoration-2">Seru</span>
          </h1>

          <p className="text-slate-700 text-base sm:text-xl font-medium max-w-2xl mx-auto">
            Platform kuis multiplayer cepat untuk sekolah. Guru membuat soal, murid berkompetisi dengan PIN dari gawai masing-masing.
          </p>
        </div>

        {/* Dual Portals (Student vs Teacher) */}
        <div className="grid md:grid-cols-2 gap-6 my-8">
          {/* Student Portal (High Priority, Bold Game Action) */}
          <Card className="bg-amber-100 border-3 flex flex-col justify-between relative overflow-hidden" padding="lg">
            <div className="absolute top-3 right-3 text-4xl font-display font-black text-amber-300/60 select-none pointer-events-none" aria-hidden="true">
              MURID
            </div>

            <div>
              <div className="inline-flex items-center gap-2 p-2 bg-amber-400 border-2 border-slate-900 rounded-block shadow-block-sm text-slate-950 mb-3">
                <Gamepad2 className="w-5 h-5 stroke-[2.5]" />
                <span className="font-display font-black text-sm uppercase">Ruang Murid</span>
              </div>

              <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950 mb-2">
                Punya PIN Game?
              </h2>
              <p className="text-sm sm:text-base text-slate-700 mb-6">
                Masukkan kode 5 digit dari layar guru untuk langsung bergabung ke sesi kuis.
              </p>

              <form onSubmit={handleQuickJoin} className="space-y-3">
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    pattern="[0-9]*"
                    maxLength={5}
                    placeholder="Contoh: 84271"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value.replace(/\D/g, ''));
                      setError('');
                    }}
                    className="w-full min-h-[52px] text-center font-display font-black text-2xl tracking-widest bg-white border-2 border-slate-900 rounded-block focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    aria-label="PIN Game 5 Digit"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="flex items-center justify-center gap-2"
                  >
                    <span>Masuk</span>
                    <ArrowRight className="w-5 h-5 stroke-[3]" />
                  </Button>
                </div>
                {error && (
                  <p className="text-xs font-bold text-red-600">{error}</p>
                )}
              </form>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-slate-900/10 flex items-center justify-between text-xs font-bold text-slate-600">
              <Link to="/quizzes" className="text-amber-900 hover:underline font-black flex items-center gap-1">
                <span>🌟 Kuis Mandiri</span>
              </Link>
              <Link to="/join" className="text-indigo-700 hover:underline">
                Halaman Join PIN &rarr;
              </Link>
            </div>
          </Card>

          {/* Teacher Portal */}
          <Card className="bg-indigo-50 border-3 flex flex-col justify-between relative overflow-hidden" padding="lg">
            <div className="absolute top-3 right-3 text-4xl font-display font-black text-indigo-200/60 select-none pointer-events-none" aria-hidden="true">
              GURU
            </div>

            <div>
              <div className="inline-flex items-center gap-2 p-2 bg-indigo-600 border-2 border-slate-900 rounded-block shadow-block-sm text-white mb-3">
                <GraduationCap className="w-5 h-5 stroke-[2.5]" />
                <span className="font-display font-black text-sm uppercase">Ruang Guru</span>
              </div>

              <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-950 mb-2">
                Kelola & Host Kuis
              </h2>
              <p className="text-sm sm:text-base text-slate-700 mb-6">
                Buat kuis pilihan ganda atau benar/salah, buka lobi kelas, dan pantau skor langsung.
              </p>

              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => navigate('/teacher')}
                  className="flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-5 h-5 stroke-[2.5]" />
                  <span>Buka Dashboard Guru</span>
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => navigate('/teacher/quizzes/new')}
                >
                  + Buat Kuis Baru
                </Button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-slate-900/10 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Simpan kuis & live lobby</span>
              <Link to="/teacher/quizzes" className="text-indigo-700 hover:underline">
                Lihat Daftar Kuis &rarr;
              </Link>
            </div>
          </Card>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
          <div className="p-4 bg-white border-2 border-slate-900 rounded-block shadow-block flex items-start gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 border-2 border-slate-900 rounded-block shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-950">
                PILIH & KETIK (Isian Singkat)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Mendukung pilihan ganda, benar/salah, serta soal isian singkat dengan pencocokan otomatis.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white border-2 border-slate-900 rounded-block shadow-block flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 border-2 border-slate-900 rounded-block shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-950">
                Kuis Cepat & Responsif
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Tombol jawaban sentuh besar dirancang khusus untuk kenyamanan murid di ponsel.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white border-2 border-slate-900 rounded-block shadow-block flex items-start gap-3">
            <div className="p-2 bg-rose-100 text-rose-800 border-2 border-slate-900 rounded-block shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-950">
                Leaderboard & Podium
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Sistem poin memperhitungkan ketepatan dan kecepatan respons.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
