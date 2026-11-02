import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, GraduationCap, BookOpen } from 'lucide-react';

export const Header = () => {
  const location = useLocation();
  const isTeacherArea = location.pathname.startsWith('/teacher');

  return (
    <header className="sticky top-0 z-40 bg-white border-b-3 border-slate-900 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-block"
        >
          <div className="w-10 h-10 bg-indigo-600 border-2 border-slate-900 rounded-block flex items-center justify-center text-amber-300 font-display font-black text-xl shadow-block-sm group-hover:-translate-y-0.5 transition-transform">
            Y!
          </div>
          <span className="font-display font-black text-2xl tracking-tight text-slate-950">
            Yahoot<span className="text-amber-500">!</span>
          </span>
        </Link>

        {/* Navigation Switcher */}
        <nav className="flex items-center gap-1.5 sm:gap-3" aria-label="Main Navigation">
          <Link
            to="/quizzes"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-display font-bold border-2 border-slate-900 rounded-block transition-all shrink-0 ${
              location.pathname === '/quizzes'
                ? 'bg-amber-400 text-slate-950 shadow-block-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline sm:inline">Kuis Mandiri</span>
            <span className="xs:hidden sm:hidden">Kuis</span>
          </Link>

          <Link
            to="/join"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-display font-bold border-2 border-slate-900 rounded-block transition-all shrink-0 ${
              location.pathname === '/join' || location.pathname.startsWith('/game')
                ? 'bg-indigo-600 text-white shadow-block-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Gamepad2 className="w-4 h-4 stroke-[2.5]" />
            <span>PIN Game</span>
          </Link>

          <Link
            to="/teacher"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-display font-bold border-2 border-slate-900 rounded-block transition-all shrink-0 ${
              isTeacherArea
                ? 'bg-indigo-600 text-white shadow-block-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4 stroke-[2.5]" />
            <span>Guru</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};
