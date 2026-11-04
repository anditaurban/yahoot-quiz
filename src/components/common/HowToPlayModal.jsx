import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Gamepad2, 
  Play, 
  QrCode, 
  Trophy, 
  Zap, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Sparkles, 
  BookOpen, 
  Share2, 
  Smartphone,
  X
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const HowToPlayModal = ({
  isOpen,
  onClose,
  initialRole = 'guru', // 'guru' | 'siswa'
}) => {
  const [activeTab, setActiveTab] = useState(initialRole);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialRole);
    }
  }, [isOpen, initialRole]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cara Penggunaan Yahoot!"
      maxWidth="max-w-2xl"
    >
      <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
        {/* Role Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 border-2 border-slate-900 rounded-block">
          <button
            type="button"
            onClick={() => setActiveTab('guru')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded font-display font-black text-xs sm:text-sm transition-all ${
              activeTab === 'guru'
                ? 'bg-indigo-600 text-white shadow-block-xs border-2 border-slate-900'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4 stroke-[2.5]" />
            <span>Panduan Guru (Host)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('siswa')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded font-display font-black text-xs sm:text-sm transition-all ${
              activeTab === 'siswa'
                ? 'bg-amber-400 text-slate-950 shadow-block-xs border-2 border-slate-900'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'
            }`}
          >
            <Gamepad2 className="w-4 h-4 stroke-[2.5]" />
            <span>Panduan Siswa (Pemain)</span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: PANDUAN GURU (HOST KUIS)
           ======================================================== */}
        {activeTab === 'guru' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3 bg-indigo-50 border-2 border-indigo-200 rounded-block text-xs sm:text-sm text-indigo-950 font-medium">
              Guru bertindak sebagai <strong>Host / Pembawa Acara</strong> kuis langsung di depan kelas menggunakan layar proyektor atau *screen share* online.
            </div>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex gap-3 p-3.5 bg-white border-2 border-slate-900 rounded-block shadow-block-xs">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-display font-black text-sm flex items-center justify-center shrink-0 border border-slate-900">
                  1
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="font-display font-black text-sm sm:text-base text-slate-950 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>Pilih atau Buat Kuis Baru</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Masuk ke <strong>Dashboard Guru</strong>. Anda dapat membuat kuis baru dengan 3 pilihan mode (PILIH dari kursus LMS, KETIK judul sendiri, atau BEBAS tanpa kursus). Tambahkan butir soal atau gunakan fitur <strong>Impor JSON</strong> untuk memasukkan banyak soal instan.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3 p-3.5 bg-white border-2 border-slate-900 rounded-block shadow-block-xs">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-display font-black text-sm flex items-center justify-center shrink-0 border border-slate-900">
                  2
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="font-display font-black text-sm sm:text-base text-slate-950 flex items-center gap-1.5">
                    <Play className="w-4 h-4 text-emerald-600 fill-emerald-500" />
                    <span>Host Kuis & Proyeksikan Lobi</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Klik tombol <strong>"Host Kuis"</strong>. Sistem otomatis menghasilkan <strong>5 Digit Game PIN</strong> dan <strong>QR Code</strong>. Tampilkan layar ini ke proyektor kelas atau bagikan layar jika kuis online.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3 p-3.5 bg-white border-2 border-slate-900 rounded-block shadow-block-xs">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-display font-black text-sm flex items-center justify-center shrink-0 border border-slate-900">
                  3
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="font-display font-black text-sm sm:text-base text-slate-950 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-amber-600" />
                    <span>Murid Bergabung & Mulai Game</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Murid memindai QR Code atau memasukkan PIN dari ponsel mereka. Nama murid yang bergabung akan muncul langsung di layar lobi. Bila seluruh kelas siap, klik tombol hijau <strong>"Mulai Kuis"</strong>.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-3 p-3.5 bg-white border-2 border-slate-900 rounded-block shadow-block-xs">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-display font-black text-sm flex items-center justify-center shrink-0 border border-slate-900">
                  4
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="font-display font-black text-sm sm:text-base text-slate-950 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-rose-600" />
                    <span>Jalannya Permainan (*Gameplay*)</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Setiap soal memiliki batas waktu (misal 20 detik). <strong>Bilah progres</strong> di bawah soal memantau berapa murid yang sudah menjawab tanpa membocorkan opsi mana yang dipilih. Saat semua murid selesai menjawab, kunci jawaban otomatis terbuka (atau guru bisa menekan <strong>"Kunci Jawaban"</strong> lebih awal).
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-3 p-3.5 bg-white border-2 border-slate-900 rounded-block shadow-block-xs">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-display font-black text-sm flex items-center justify-center shrink-0 border border-slate-900">
                  5
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="font-display font-black text-sm sm:text-base text-slate-950 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>Klasemen & Podium Juara</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Buka <strong>"Lihat Klasemen"</strong> di tiap akhir ronde soal untuk memicu atmosfer kompetitif kelas dengan musik khusus. Di soal terakhir, nikmati selebrasi animasi <strong>Podium Juara 1, 2, dan 3</strong>!
                  </p>
                </div>
              </div>
            </div>

            {/* Pro Tip Box */}
            <div className="p-3 bg-amber-100 border-2 border-slate-900 rounded-block text-xs font-semibold text-slate-900 flex items-start gap-2 shadow-block-xs">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Tips Guru:</strong> Anda bisa memutar atau mematikan musik latar SpongeBob & efek suara kuis kapan saja lewat tombol musik di pojok kanan atas layar bermain.
              </span>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: PANDUAN SISWA (PEMAIN)
           ======================================================== */}
        {activeTab === 'siswa' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-block text-xs sm:text-sm text-amber-950 font-medium">
              Siswa menjawab soal kuis secara *real-time* langsung dari ponsel, tablet, atau laptop masing-masing.
            </div>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex gap-3 p-3.5 bg-white border-2 border-slate-900 rounded-block shadow-block-xs">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-display font-black text-sm flex items-center justify-center shrink-0 border border-slate-900">
                  1
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="font-display font-black text-sm sm:text-base text-slate-950 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <span>Gabung via PIN atau Scan QR</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Buka halaman <strong>PIN Game</strong> di ponselmu, lalu masukkan 5 digit PIN dari layar guru, atau tekan tombol <strong>"Scan QR Code"</strong> untuk memindai kode di layar proyektor kelas secara instan.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3 p-3.5 bg-white border-2 border-slate-900 rounded-block shadow-block-xs">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-display font-black text-sm flex items-center justify-center shrink-0 border border-slate-900">
                  2
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="font-display font-black text-sm sm:text-base text-slate-950 flex items-center gap-1.5">
                    <Gamepad2 className="w-4 h-4 text-amber-600" />
                    <span>Masukkan Nama Panggilan (Nickname)</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tulis nama atau panggilan kamu yang mudah dikenali oleh guru dan teman sekelas. Klik <strong>"Masuk ke Game"</strong> dan tunggu di lobi sampai guru memulai permainan.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3 p-3.5 bg-white border-2 border-slate-900 rounded-block shadow-block-xs">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-display font-black text-sm flex items-center justify-center shrink-0 border border-slate-900">
                  3
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="font-display font-black text-sm sm:text-base text-slate-950 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>Pilih Jawaban yang Tepat</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sentuh salah satu kartu warna & bentuk jawaban di layar HP kamu:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] font-bold">
                    <span className="p-1.5 bg-red-500 text-white rounded text-center">▲ A (Merah)</span>
                    <span className="p-1.5 bg-blue-600 text-white rounded text-center">◆ B (Biru)</span>
                    <span className="p-1.5 bg-amber-400 text-slate-950 rounded text-center">● C (Kuning)</span>
                    <span className="p-1.5 bg-emerald-500 text-slate-950 rounded text-center">■ D (Hijau)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1">
                    Untuk soal <em>Benar/Salah</em> cukup klik Benar atau Salah, dan untuk <em>Isian Singkat</em> ketik teks jawabanmu lalu klik Kirim.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-3 p-3.5 bg-white border-2 border-slate-900 rounded-block shadow-block-xs">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-display font-black text-sm flex items-center justify-center shrink-0 border border-slate-900">
                  4
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="font-display font-black text-sm sm:text-base text-slate-950 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-600 fill-rose-500" />
                    <span>Kecepatan & Streak Beruntun</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ⚡ <strong>Kecepatan Bernilai Tinggi:</strong> Semakin cepat kamu memilih opsi yang tepat, semakin besar poin bonus yang kamu dapatkan!  
                    🔥 <strong>Pertahankan Streak:</strong> Menjawab benar berturut-turut akan mempertahankan tanda api streak kamu di papan skor kelas.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-3 p-3.5 bg-white border-2 border-slate-900 rounded-block shadow-block-xs">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-display font-black text-sm flex items-center justify-center shrink-0 border border-slate-900">
                  5
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="font-display font-black text-sm sm:text-base text-slate-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Lihat Skor & Peringkat Pribadi</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Setelah waktu habis atau semua murid menjawab, HP kamu langsung menampilkan kartu hasil apakah jawabanmu <strong>BENAR (+poin)</strong> atau <strong>KURANG TEPAT</strong>, serta peringkat posisimu saat ini.
                  </p>
                </div>
              </div>
            </div>

            {/* Pro Tip Box */}
            <div className="p-3 bg-emerald-100 border-2 border-slate-900 rounded-block text-xs font-semibold text-slate-900 flex items-start gap-2 shadow-block-xs">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                <strong>Tips Murid:</strong> Jangan menunggu sampai detik terakhir! Jika kamu sudah yakin dengan jawabanmu, langsung tekan opsinya agar meraih bonus kecepatan tertinggi!
              </span>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-2 border-t-2 border-slate-900 flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-500">
            Yahoot! Platform Kuis Interaktif
          </span>
          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            className="!px-5"
          >
            Mengerti & Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
};
