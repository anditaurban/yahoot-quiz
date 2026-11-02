import React from 'react';
import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';

const PixelHeart = () => (
  <svg
    viewBox="0 0 9 8"
    className="w-4 h-4 inline-block fill-rose-500 mx-1 transition-transform hover:scale-125"
    style={{ shapeRendering: 'crispEdges' }}
    aria-label="cinta"
  >
    <path d="M1 0h2v1H1zm4 0h2v1H5zm-5 1h4v1H0zm5 0h4v1H5zm-5 1h9v2H0zm1 2h7v1H1zm1 1h5v1H2zm1 1h3v1H3zm1 1h1v1H4z" />
  </svg>
);

export const Footer = () => {
  return (
    <footer className="mt-auto border-t-2 border-slate-900 bg-white py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-display font-black text-slate-900">Yahoot!</span>
          <span>: Platform Kuis Interaktif untuk Guru dan Murid</span>
        </div>

        {/* Made with love by anditaurban */}
        <div className="flex items-center text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 border-2 border-slate-900 rounded-block shadow-block-sm">
          <span>Made with</span>
          <PixelHeart />
          <span>by</span>
          <a
            href="https://github.com/anditaurban"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 ml-1.5 text-slate-900 hover:text-indigo-600 font-black transition-all group"
          >
            <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="group-hover:underline">anditaurban</span>
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/join" className="hover:text-indigo-600 hover:underline">
            Gabung Game
          </Link>
          <Link to="/teacher" className="hover:text-indigo-600 hover:underline">
            Dashboard Guru
          </Link>
          <Link to="/teacher/quizzes/new" className="hover:text-indigo-600 hover:underline">
            Buat Kuis Baru
          </Link>
        </div>
      </div>
    </footer>
  );
};
