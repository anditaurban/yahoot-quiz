import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, GraduationCap, BookOpen, HelpCircle } from 'lucide-react';
import { HowToPlayModal } from '../common/HowToPlayModal';

export const Header = () => {
  const location = useLocation();
  const isTeacherArea = location.pathname.startsWith('/teacher');
  const isStudentJoinOrPlay = location.pathname === '/join' || location.pathname.startsWith('/game');

  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideRole, setGuideRole] = useState(isTeacherArea ? 'guru' : 'siswa');

  const openGuide = (role) => {
    setGuideRole(role || (isTeacherArea ? 'guru' : 'siswa'));
    setShowGuideModal(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b-3 border-slate-900 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-1.5 sm:gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-block shrink-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 border-2 border-slate-900 rounded-block flex items-center justify-center text-amber-300 font-display font-black text-base sm:text-xl shadow-block-xs group-hover:-translate-y-0.5 transition-transform">
              Y!
            </div>
            <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-slate-950">
              Yahoot<span className="text-amber-500">!</span>
            </span>
          </Link>

          {/* Navigation Switcher: Hidden on Student Join / Play pages */}
          {!isStudentJoinOrPlay ? (
            <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main Navigation">
              <Link
                to="/quizzes"
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-display font-bold border-2 border-slate-900 rounded-block transition-all shrink-0 ${
                  location.pathname === '/quizzes'
                    ? 'bg-amber-400 text-slate-950 shadow-block-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Kuis Mandiri"
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span className="hidden md:inline">Kuis Mandiri</span>
                <span className="hidden xs:inline md:hidden">Kuis</span>
              </Link>

              <Link
                to="/join"
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-display font-bold border-2 border-slate-900 rounded-block transition-all shrink-0 ${
                  location.pathname === '/join' || location.pathname.startsWith('/game')
                    ? 'bg-indigo-600 text-white shadow-block-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="PIN Game Murid"
              >
                <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span className="hidden xs:inline">PIN Game</span>
              </Link>

              <Link
                to="/teacher"
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-display font-bold border-2 border-slate-900 rounded-block transition-all shrink-0 ${
                  isTeacherArea
                    ? 'bg-indigo-600 text-white shadow-block-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Ruang Guru"
              >
                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span className="hidden xs:inline">Guru</span>
              </Link>

              {/* Panduan Button */}
              <button
                type="button"
                onClick={() => openGuide(isTeacherArea ? 'guru' : 'siswa')}
                title="Cara Penggunaan Yahoot!"
                className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-display font-black bg-amber-300 hover:bg-amber-400 text-slate-950 border-2 border-slate-900 rounded-block shadow-block-xs transition-transform active:translate-y-0.5 shrink-0"
              >
                <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Panduan</span>
              </button>
            </nav>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 bg-amber-100 border-2 border-slate-900 rounded-block font-display font-black text-xs text-amber-950 shadow-block-xs">
                <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700 stroke-[2.5]" />
                <span>Gabung</span>
              </span>

              {/* Help button on Student Join & Play */}
              <button
                type="button"
                onClick={() => openGuide('siswa')}
                title="Bantuan & Cara Bermain"
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-display font-black bg-amber-300 hover:bg-amber-400 text-slate-950 border-2 border-slate-900 rounded-block shadow-block-xs transition-transform active:translate-y-0.5"
              >
                <HelpCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Panduan</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* How To Play Guide Modal */}
      <HowToPlayModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        initialRole={guideRole}
      />
    </>
  );
};
