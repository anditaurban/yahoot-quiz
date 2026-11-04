import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Gamepad2, GraduationCap, ArrowRight, Zap, Trophy, CheckCircle2, HelpCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { HowToPlayModal } from '../../components/common/HowToPlayModal';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideRole, setGuideRole] = useState('guru');

  const openGuide = (role = 'guru') => {
    setGuideRole(role);
    setShowGuideModal(true);
  };

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
    <>
      <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] flex flex-col justify-between game-grid-pattern py-4 sm:py-8 px-3 sm:px-6 overflow-x-hidden">
        <div className="max-w-5xl mx-auto w-full">
          {/* Main Banner */}
          <div className="text-center my-3 sm:my-8 px-1">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-amber-300 border-2 border-slate-900 rounded-block shadow-block-xs text-xs sm:text-sm font-display font-black text-slate-950 mb-3 sm:mb-4">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-500" />
              <span>Kuis Interaktif Kelas & Komunitas</span>
            </div>

            <h1 className="font-display font-black text-3xl xs:text-4xl sm:text-6xl md:text-7xl text-slate-950 tracking-tight leading-tight sm:leading-none mb-3 sm:mb-4">
              Bermain Kuis Jadi <span className="underline decoration-indigo-600 decoration-wavy decoration-2">Seru</span>
            </h1>

            <p className="text-slate-700 text-sm sm:text-lg md:text-xl font-medium max-w-2xl mx-auto mb-4 sm:mb-6">
              Platform kuis multiplayer cepat untuk sekolah. Guru membuat soal, murid berkompetisi dengan PIN dari gawai masing-masing.
            </p>

            {/* Quick Guide Trigger Button */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => openGuide('guru')}
                className="bg-white hover:bg-slate-100 flex items-center gap-2 shadow-block-xs text-xs sm:text-sm py-2 px-3 sm:px-4"
              >
                <HelpCircle className="w-4 h-4 text-indigo-600 stroke-[2.5]" />
                <span className="hidden sm:inline">Cara Penggunaan (Panduan Lengkap)</span>
                <span className="sm:hidden">Panduan Penggunaan</span>
              </Button>
            </div>
          </div>

        {/* Dual Portals (Student vs Teacher) */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 my-4 sm:my-8">
          {/* Student Portal (High Priority, Bold Game Action) */}
          <Card className="bg-amber-100 border-3 flex flex-col justify-between relative overflow-hidden" padding="md">
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 text-2xl sm:text-4xl font-display font-black text-amber-300/40 select-none pointer-events-none" aria-hidden="true">
              MURID
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 p-1.5 sm:p-2 bg-amber-400 border-2 border-slate-900 rounded-block shadow-block-xs text-slate-950 mb-2 sm:mb-3">
                <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                <span className="font-display font-black text-xs sm:text-sm uppercase">Ruang Murid</span>
              </div>

              <h2 className="font-display font-black text-xl sm:text-2xl md:text-3xl text-slate-950 mb-1.5 sm:mb-2">
                Punya PIN Game?
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-700 mb-4 sm:mb-6">
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
                    className="w-full min-h-[46px] sm:min-h-[52px] text-center font-display font-black text-xl sm:text-2xl tracking-widest bg-white border-2 border-slate-900 rounded-block focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-inner"
                    aria-label="PIN Game 5 Digit"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="flex items-center justify-center gap-2 min-h-[46px] sm:min-h-[50px]"
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

            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t-2 border-slate-900/10 flex items-center justify-between text-xs font-bold text-slate-600">
              <Link to="/quizzes" className="text-amber-900 hover:underline font-black flex items-center gap-1">
                <span>🌟 Kuis Mandiri</span>
              </Link>
              <Link to="/join" className="text-indigo-700 hover:underline">
                Halaman Join PIN &rarr;
              </Link>
            </div>
          </Card>

          {/* Teacher Portal */}
          <Card className="bg-indigo-50 border-3 flex flex-col justify-between relative overflow-hidden" padding="md">
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 text-2xl sm:text-4xl font-display font-black text-indigo-200/40 select-none pointer-events-none" aria-hidden="true">
              GURU
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 p-1.5 sm:p-2 bg-indigo-600 border-2 border-slate-900 rounded-block shadow-block-xs text-white mb-2 sm:mb-3">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                <span className="font-display font-black text-xs sm:text-sm uppercase">Ruang Guru</span>
              </div>

              <h2 className="font-display font-black text-xl sm:text-2xl md:text-3xl text-slate-950 mb-1.5 sm:mb-2">
                Kelola & Host Kuis
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-700 mb-4 sm:mb-6">
                Buat kuis pilihan ganda atau benar/salah, buka lobi kelas, dan pantau skor langsung.
              </p>

              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => navigate('/teacher')}
                  className="flex items-center justify-center gap-2 min-h-[46px] sm:min-h-[50px]"
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

            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t-2 border-slate-900/10 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Simpan kuis & live lobby</span>
              <Link to="/teacher/quizzes" className="text-indigo-700 hover:underline">
                Lihat Daftar Kuis &rarr;
              </Link>
            </div>
          </Card>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 my-4 sm:my-8">
          <div className="p-3.5 sm:p-4 bg-white border-2 border-slate-900 rounded-block shadow-block-xs flex items-start gap-3">
            <div className="p-1.5 sm:p-2 bg-emerald-100 text-emerald-800 border-2 border-slate-900 rounded-block shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm sm:text-base text-slate-950">
                PILIH & KETIK (Isian Singkat)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Mendukung pilihan ganda, benar/salah, serta soal isian singkat dengan pencocokan otomatis.
              </p>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 bg-white border-2 border-slate-900 rounded-block shadow-block-xs flex items-start gap-3">
            <div className="p-1.5 sm:p-2 bg-amber-100 text-amber-800 border-2 border-slate-900 rounded-block shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm sm:text-base text-slate-950">
                Kuis Cepat & Responsif
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Tombol jawaban sentuh besar dirancang khusus untuk kenyamanan murid di ponsel.
              </p>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 bg-white border-2 border-slate-900 rounded-block shadow-block-xs flex items-start gap-3">
            <div className="p-1.5 sm:p-2 bg-rose-100 text-rose-800 border-2 border-slate-900 rounded-block shrink-0">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm sm:text-base text-slate-950">
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

    {/* How To Play Modal */}
    <HowToPlayModal
      isOpen={showGuideModal}
      onClose={() => setShowGuideModal(false)}
      initialRole={guideRole}
    />
  </>
);
};
