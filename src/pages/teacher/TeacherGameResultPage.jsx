import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Trophy, 
  Medal, 
  Award, 
  Home, 
  RotateCcw, 
  Users, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Table, 
  ChevronDown, 
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getResults, getGameById } from '../../services/api/games';
import { exportQuizResultsToCsv } from '../../utils/exportQuizReport';

export const TeacherGameResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportMsg, setExportMsg] = useState('');
  const [showMatrix, setShowMatrix] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const gameData = await getGameById(id);
        setGame(gameData);
        const resData = await getResults(id);
        setResults(resData);
      } catch (err) {
        setError(err.message || 'Gagal memuat hasil kuis.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  const handleExportExcel = () => {
    try {
      setExportMsg('');
      const fileName = exportQuizResultsToCsv({ game, results });
      setExportMsg(`File "${fileName}" berhasil diunduh!`);
      setTimeout(() => setExportMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Gagal mengekspor data rekap kuis.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-display font-bold text-slate-700">Mempersiapkan Podium Juara...</p>
        </div>
      </div>
    );
  }

  const players = results?.players || [];
  const questions = results?.questions || [];
  const totalQ = results?.totalQuestions || game?.totalQuestions || questions.length || 0;
  const p1 = players[0];
  const p2 = players[1];
  const p3 = players[2];

  return (
    <div className="min-h-[calc(100vh-4rem)] game-grid-pattern py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="text-center">
          <Badge variant="gold" size="lg" className="mb-2">
            HASIL FINAL KUIS
          </Badge>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-slate-950">
            {game?.quizTitle || 'Permainan Yahoot!'}
          </h1>
          <p className="text-slate-600 font-semibold text-sm mt-1">
            Total {players.length} Murid Berpartisipasi &bull; PIN Game: {results?.pinCode || game?.code}
          </p>
        </div>

        {/* 3D Sandbox Podium Display */}
        {players.length > 0 && (
          <div className="flex items-end justify-center gap-2 sm:gap-4 pt-8 pb-4">
            {/* 2nd Place */}
            {p2 ? (
              <div className="flex-1 max-w-[180px] flex flex-col items-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white border-2 border-slate-900 rounded-block flex items-center justify-center shadow-block-sm mb-2 font-display font-black text-slate-800">
                  🥈
                </div>
                <p className="font-display font-black text-xs sm:text-sm text-slate-900 truncate w-full text-center">
                  {p2.nickname}
                </p>
                <p className="font-bold text-xs text-slate-600 mb-2">{p2.score} pt</p>
                <div className="w-full h-32 sm:h-40 bg-slate-300 border-3 border-slate-900 rounded-t-block shadow-block flex items-center justify-center font-display font-black text-3xl text-slate-700">
                  2
                </div>
              </div>
            ) : (
              <div className="flex-1 max-w-[180px]" />
            )}

            {/* 1st Place (Center / Tallest) */}
            {p1 && (
              <div className="flex-1 max-w-[200px] flex flex-col items-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-300 border-3 border-slate-900 rounded-block flex items-center justify-center shadow-block mb-2 text-2xl sm:text-3xl">
                  👑
                </div>
                <p className="font-display font-black text-sm sm:text-base text-slate-950 truncate w-full text-center">
                  {p1.nickname}
                </p>
                <p className="font-display font-black text-xs sm:text-sm text-amber-700 mb-2">{p1.score} pt</p>
                <div className="w-full h-44 sm:h-56 bg-amber-400 border-3 border-slate-900 rounded-t-block shadow-block-lg flex items-center justify-center font-display font-black text-4xl sm:text-5xl text-slate-950">
                  1
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {p3 ? (
              <div className="flex-1 max-w-[180px] flex flex-col items-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white border-2 border-slate-900 rounded-block flex items-center justify-center shadow-block-sm mb-2 font-display font-black text-slate-800">
                  🥉
                </div>
                <p className="font-display font-black text-xs sm:text-sm text-slate-900 truncate w-full text-center">
                  {p3.nickname}
                </p>
                <p className="font-bold text-xs text-slate-600 mb-2">{p3.score} pt</p>
                <div className="w-full h-24 sm:h-28 bg-amber-700/30 border-3 border-slate-900 rounded-t-block shadow-block flex items-center justify-center font-display font-black text-2xl text-slate-700">
                  3
                </div>
              </div>
            ) : (
              <div className="flex-1 max-w-[180px]" />
            )}
          </div>
        )}

        {/* Action Bar: Download Excel & Quick Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border-3 border-slate-900 rounded-block shadow-block">
          <div>
            <h3 className="font-display font-black text-base sm:text-lg text-slate-950 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>Ekspor Rekap Nilai Siswa</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Unduh lembar kerja spreadsheet lengkap dengan jawaban & poin per butir soal.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              onClick={handleExportExcel}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black border-2 border-slate-900 shadow-block-sm"
            >
              <Download className="w-4 h-4 stroke-[3]" />
              <span>Download Rekap Excel (.csv)</span>
            </Button>
          </div>
        </div>

        {/* Export Success Toast */}
        {exportMsg && (
          <div className="p-3 bg-emerald-100 border-2 border-emerald-600 rounded-block text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{exportMsg}</span>
          </div>
        )}

        {/* Section 1: Detailed Answer Matrix Table (Collapsible) */}
        <Card className="bg-white">
          <div 
            onClick={() => setShowMatrix(!showMatrix)}
            className="flex items-center justify-between cursor-pointer select-none pb-2 border-b-2 border-slate-100"
          >
            <div className="flex items-center gap-2">
              <Table className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-display font-black text-base sm:text-lg text-slate-950">
                  Matriks Detail Jawaban & Poin Siswa
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Lihat pilihan jawaban, kebenaran, dan skor per butir soal secara langsung
                </p>
              </div>
            </div>

            <button 
              type="button" 
              className="p-1.5 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 rounded-block"
            >
              {showMatrix ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showMatrix && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs font-medium border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-900 font-display font-black text-slate-900">
                    <th className="p-2.5 w-16 text-center">Rank</th>
                    <th className="p-2.5 min-w-[140px]">Nama Siswa</th>
                    {Array.from({ length: totalQ }).map((_, qIdx) => (
                      <th key={qIdx} className="p-2.5 text-center min-w-[90px]">
                        Soal {qIdx + 1}
                      </th>
                    ))}
                    <th className="p-2.5 text-right w-24">Total Skor</th>
                    <th className="p-2.5 text-center w-20">Akurasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  {players.map((p) => {
                    const ansMap = {};
                    (p.answers || []).forEach((a) => {
                      ansMap[a.questionIndex] = a;
                    });
                    const correctCount = (p.answers || []).filter((a) => a.isCorrect).length;
                    const accuracy = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

                    return (
                      <tr key={p.playerId || p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 text-center font-display font-black">
                          <span className={`inline-block w-6 h-6 leading-6 rounded ${
                            p.rank === 1 ? 'bg-amber-300 text-slate-950 font-black' :
                            p.rank === 2 ? 'bg-slate-200 text-slate-900 font-bold' :
                            p.rank === 3 ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-600'
                          }`}>
                            #{p.rank}
                          </span>
                        </td>
                        <td className="p-2.5 font-display font-bold text-slate-950">
                          {p.nickname}
                        </td>
                        {Array.from({ length: totalQ }).map((_, qIdx) => {
                          const ans = ansMap[qIdx];
                          if (!ans) {
                            return (
                              <td key={qIdx} className="p-2.5 text-center">
                                <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold">
                                  Lewat ⏱️
                                </span>
                              </td>
                            );
                          }

                          return (
                            <td key={qIdx} className="p-2.5 text-center">
                              {ans.isCorrect ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 border border-emerald-500 text-emerald-950 rounded text-[11px] font-bold">
                                  <span>{String(ans.optionId).toUpperCase()}</span>
                                  <span className="text-[10px] text-emerald-700 font-black">+{ans.pointsEarned}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-rose-100 border border-rose-300 text-rose-950 rounded text-[11px] font-bold">
                                  <span>{String(ans.optionId).toUpperCase()}</span>
                                  <span className="text-[10px] text-rose-600 font-semibold">(0)</span>
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-2.5 text-right font-display font-black text-sm text-slate-950">
                          {p.score} pt
                        </td>
                        <td className="p-2.5 text-center">
                          <Badge 
                            variant={accuracy >= 80 ? 'success' : accuracy >= 50 ? 'warning' : 'neutral'} 
                            size="sm"
                          >
                            {accuracy}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Section 2: Full Leaderboard List */}
        <Card className="bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-black text-lg text-slate-950 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Daftar Nilai Seluruh Peserta</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">
              {players.length} Pemain
            </span>
          </div>

          <div className="space-y-2">
            {players.map((p) => (
              <div
                key={p.playerId || p.id}
                className="flex items-center justify-between p-3 bg-slate-50 border-2 border-slate-900 rounded-block font-display text-sm hover:bg-amber-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-block bg-white border-2 border-slate-900 flex items-center justify-center font-black text-xs">
                    #{p.rank}
                  </span>
                  <span className="font-bold text-slate-900">{p.nickname}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-base text-slate-950">{p.score} pt</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/teacher')}
            className="w-full sm:w-auto"
          >
            <Home className="w-4 h-4 mr-2" />
            <span>Kembali ke Dashboard Guru</span>
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(`/teacher/games/${id}/lobby`)}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4 mr-2 stroke-[2.5]" />
            <span>Mainkan Lagi Kuis Ini</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
