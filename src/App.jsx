import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Layout
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Public & Student Pages
import { LandingPage } from './pages/public/LandingPage';
import { JoinPage } from './pages/public/JoinPage';
import { StudentQuizListPage } from './pages/student/StudentQuizListPage';
import { StudentLobbyPage } from './pages/student/StudentLobbyPage';
import { StudentPlayPage } from './pages/student/StudentPlayPage';
import { StudentResultPage } from './pages/student/StudentResultPage';

// Teacher Pages
import { TeacherDashboardPage } from './pages/teacher/TeacherDashboardPage';
import { TeacherQuizListPage } from './pages/teacher/TeacherQuizListPage';
import { TeacherQuizCreatePage } from './pages/teacher/TeacherQuizCreatePage';
import { TeacherQuizEditPage } from './pages/teacher/TeacherQuizEditPage';
import { TeacherGameLobbyPage } from './pages/teacher/TeacherGameLobbyPage';
import { TeacherGamePlayPage } from './pages/teacher/TeacherGamePlayPage';
import { TeacherGameResultPage } from './pages/teacher/TeacherGameResultPage';

const AppLayout = () => {
  const location = useLocation();

  // Hide general header on student live play screen to optimize screen space for game controls
  const isStudentPlay = location.pathname.includes('/play') && !location.pathname.startsWith('/teacher');
  const showFooter = !location.pathname.includes('/play') && !location.pathname.includes('/lobby');

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {!isStudentPlay && <Header />}
      
      <main className="flex-1 flex flex-col">
        <Routes>
          {/* Public & Student Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/quizzes" element={<StudentQuizListPage />} />
          <Route path="/game/:code" element={<StudentLobbyPage />} />
          <Route path="/game/:code/play" element={<StudentPlayPage />} />
          <Route path="/game/:code/result" element={<StudentResultPage />} />

          {/* Teacher Routes */}
          <Route path="/teacher" element={<TeacherDashboardPage />} />
          <Route path="/teacher/quizzes" element={<TeacherQuizListPage />} />
          <Route path="/teacher/quizzes/new" element={<TeacherQuizCreatePage />} />
          <Route path="/teacher/quizzes/:id/edit" element={<TeacherQuizEditPage />} />
          <Route path="/teacher/games/:id/lobby" element={<TeacherGameLobbyPage />} />
          <Route path="/teacher/games/:id/play" element={<TeacherGamePlayPage />} />
          <Route path="/teacher/games/:id/result" element={<TeacherGameResultPage />} />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center p-8 bg-white border-3 border-slate-900 rounded-block shadow-block-lg max-w-md">
                  <h1 className="font-display font-black text-4xl text-slate-950 mb-2">404</h1>
                  <p className="font-bold text-slate-700 mb-4">Halaman yang Anda cari tidak ditemukan.</p>
                  <a
                    href="/"
                    className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-display font-bold rounded-block border-2 border-slate-900 shadow-block"
                  >
                    Kembali ke Beranda
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </main>

      {showFooter && <Footer />}
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
