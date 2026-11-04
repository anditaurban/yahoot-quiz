# Yahoot! — Platform Kuis Interaktif Kelas & Komunitas 🎮📚

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

**Yahoot!** adalah aplikasi web kuis langsung (*live multiplayer game*) yang dirancang khusus untuk pembelajaran interaktif di kelas maupun komunitas. Mengusung gaya visual *neo-brutalist* yang berani, menyenangkan, dan cepat, Yahoot! menyulap sesi evaluasi belajar menjadi kompetisi permainan yang seru bagi siswa dan praktis bagi guru.

---

## 🌟 Fitur Utama

### 1. 🎓 Ruang Guru (Host Proyektor / Desktop-First)
- **Manajemen Kuis Fleksibel (3 Mode Pembuatan)**:
  - **Mode PILIH**: Terhubung ke kursus & bab kurikulum LMS.
  - **Mode KETIK**: Tulis judul kuis mandiri bebas.
  - **Mode BEBAS**: Kuis cepat tanpa kursus.
- **Dukungan Ragam Butir Soal**:
  - Pilihan Ganda (4 opsi seragam warna & bentuk: ▲ Merah, ◆ Biru, ● Kuning, ■ Hijau).
  - Benar / Salah (True / False).
  - Isian Singkat (*Short Answer*) dengan pencocokan teks otomatis *case-insensitive*.
  - **Impor Soal Massal (Bulk JSON Import)** untuk memasukkan puluhan soal dalam hitungan detik.
- **Lobi Permainan Interaktif**:
  - Penghasil otomatis **PIN Game 5-Digit** unik.
  - Tampilan **QR Code Dinamis** berukuran besar di proyektor untuk pemindaian instan oleh gawai murid.
  - Daftar nama murid yang bergabung ter-update secara *real-time*.
  - Fitur simulasi tambah murid demo (*Bot Player*).
- **Kontrol Gameplay Kelas yang Tangguh**:
  - **Bilah Partisipasi Kelas Anti-Contek**: Bilah kemajuan di bawah soal memantau total murid yang sudah menjawab tanpa membocorkan opsi mana yang dipilih mayoritas.
  - **Auto-Reveal Respons Cepat**: Sesi otomatis terkunci dan kunci jawaban terbuka seketika begitu seluruh murid telah mengirim jawaban (tanpa perlu menunggu sisa timer 20 detik habis).
  - **Bypass Kunci Manual**: Tombol manual untuk guru membuka kunci ronde kapan saja jika ada murid yang terkendala jaringan.
  - **Tata Letak Pas Layar (No-Scroll Viewport)**: Seluruh tampilan soal dan opsi dirancang pas dalam 1 layar proyektor tanpa *scrollbar*.
- **Efek Suara & Musik Tematik Terpisah**:
  - Musik latar ceria SpongeBob saat pertanyaan aktif.
  - Suara *Fanfare* perayaan saat kunci jawaban terbuka.
  - Suara *Drumroll & Jingle* spesial saat membuka klasemen sementara.
- **Podium Juara 3D & Selebrasi**:
  - Animasi podium 3D Juara 1, 2, dan 3 dengan ledakan pesta *confetti*.
- **📊 Matriks Nilai & Ekspor Rekap Excel / CSV**:
  - **Tabel Matriks On-Screen**: Pratinjau detail pilihan jawaban, status benar/salah, dan poin per butir soal seluruh siswa langsung di web.
  - **Unduh Spreadsheet Excel (.csv)**: Rekap nilai berformat UTF-8 BOM yang memuat metadata kuis, kunci jawaban, matriks jawaban siswa, akurasi nilai, dan statistik kelas.

---

### 2. 🎮 Ruang Murid (Pemain / Mobile-First)
- **Kemudahan Bergabung**:
  - Cukup memasukkan 5 digit PIN kuis, atau
  - **Pemindai QR Code Kamera HP bawaan** (terintegrasi library `html5-qrcode` & opsi unggah foto/screenshot QR dari galeri).
- **Pengalaman Menjawab Cepat & Responsif**:
  - Tombol jawaban sentuh berukuran proporsional yang pas di satu layar ponsel (*zero vertical scrolling*).
  - **Bonus Poin Kecepatan**: Poin bertambah semakin cepat murid memilih jawaban yang benar.
  - **Streak Api Beruntun**: Melipatgandakan sensasi kemenangan murid saat menjawab benar berturut-turut.
- **Umpan Balik Instan**:
  - Kartu hasil langsung memberitahukan status jawaban: Benar (+poin), Kurang Tepat, atau Belum Sempat Menjawab (jika waktu habis), beserta peringkat kelas pribadi.

---

### 3. 🔒 Keamanan & Integritas Kuis (Anti-Cheat & Lock Inspect)
- **Lock Inspect Senyap (*Silent Mode*)**:
  - Klik kanan (*context menu*) diblokir sepenuhnya.
  - Pintasan keyboard developer tools diblokir total (`F12`, `Ctrl+Shift+I`, `Ctrl+Shift+J`, `Ctrl+Shift+C`, `Ctrl+Shift+K`, `Ctrl+U`, `Ctrl+S`).
  - Pembersihan log konsol berkala dengan peringatan keamanan anti-modifikasi DOM.
- **Proteksi Seleksi Teks**:
  - Teks pertanyaan dan opsi jawaban dilindungi dengan `user-select: none` sehingga tidak dapat disorot atau disalin ke mesin pencari/AI.
- **Proteksi Duplikasi Jawaban (Anti-Race Condition)**:
  - Database MySQL menerapkan `UNIQUE KEY (game_id, question_index, player_id)` untuk mencegah pengiriman jawaban ganda.

---

### 4. 📖 Panduan Penggunaan Terintegrasi
- Modal popup panduan interaktif yang dapat diakses kapan saja melalui tombol **"Panduan 💡"** di navbar atas, beranda, halaman gabung, maupun dashboard guru.
- Dilengkapi tab terpisah: **Panduan Guru (Host)** dan **Panduan Siswa (Pemain)**.

---

## 🛠️ Tumpukan Teknologi (Tech Stack)

- **Frontend Core**: [React 18](https://reactjs.org/), [Vite 6](https://vitejs.dev/), JavaScript (ESModules)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) dengan palet Neo-Brutalist (Shadows `shadow-block`, Borders tebal, High contrast)
- **Ikon**: [Lucide React](https://lucide.dev/)
- **Interaktivitas & Efek**: [Canvas-Confetti](https://github.com/catdad/canvas-confetti), [HTML5-QRCode](https://github.com/mebjas/html5-qrcode), [QRCode](https://github.com/soldair/node-qrcode)
- **Proxy & Edge Layer**: [Cloudflare Worker](src/worker.js) (Dual-proxy ke backend native dengan fallback memory store)
- **Backend LMS API**: Node.js / Express MySQL ([ngodingai-lms-API](https://github.com/anditaurban/ngodingai-lms-API.git))

---

## 📁 Struktur Direktori Proyek

```text
yahoot!/
├── docs/                                # Source of Truth & Spesifikasi Arsitektur
│   ├── 01-PRD.md                        # Product Requirement Document
│   ├── 02-USER-FLOW.md                  # Peta Alur Pengguna (Guru & Murid)
│   ├── 03-UI-GUIDELINE.md               # Pedoman Desain Neo-Brutalist
│   ├── 04-API-SPEC.md                   # Spesifikasi Kontrak API
│   ├── 05-ENDPOINT-USAGE-MAP.md         # Peta Lengkap Penggunaan 38 Endpoint API
│   └── 06-BACKEND-INTEGRATION-HANDOVER.md # Panduan & Checklist Verifikasi Re-Integrasi
├── public/
│   ├── audio/                           # Aset Audio (SpongeBob, Fanfare, Jingle)
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── common/                      # Komponen Bersama (HowToPlayModal)
│   │   ├── game/                        # Game Widgets (Timer, ScoreCard, PlayerList, GameCode)
│   │   ├── layout/                      # Header, Footer
│   │   ├── quiz/                        # QuestionCard, QuestionOption, QuizEditor
│   │   └── ui/                          # Button, Card, Badge, Input, Modal (Neo-Brutalist UI)
│   ├── pages/
│   │   ├── public/                      # LandingPage, JoinPage
│   │   ├── student/                     # StudentLobbyPage, StudentPlayPage, StudentResultPage, StudentQuizListPage
│   │   └── teacher/                     # TeacherDashboardPage, TeacherQuizListPage, TeacherQuizCreatePage,
│   │                                    # TeacherQuizEditPage, TeacherGameLobbyPage, TeacherGamePlayPage, TeacherGameResultPage
│   ├── services/
│   │   ├── api/                         # client.js, quizzes.js, games.js
│   │   └── mocks/                       # mockStore.js (Fallback Dev)
│   ├── styles/                          # index.css (Neo-brutalist utility & Anti-Cheat CSS)
│   ├── utils/                           # exportQuizReport.js, lockInspect.js
│   ├── App.jsx                          # Root Router & Routing Table
│   ├── main.jsx                         # App Entry Point & Lock Inspect Initialization
│   └── worker.js                        # Cloudflare Worker Deployment & Proxy
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🚀 Memulai Proyek (Getting Started)

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18.x atau lebih baru
- [npm](https://www.npmjs.com/) versi 9.x atau lebih baru
- Backend LMS API ([ngodingai-lms-API](https://github.com/anditaurban/ngodingai-lms-API.git)) berjalan di port 3000 atau server `https://dev.katib.cloud`

### Instalasi & Menjalankan Lokal

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/anditaurban/yahoot-quiz.git
   cd yahoot-quiz
   ```

2. **Pasang Dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan Mode Pengembangan (Development Server)**:
   ```bash
   npm run dev
   ```
   Aplikasi akan terbuka secara otomatis di `http://localhost:5173`.

4. **Kompilasi Produksi (Production Build)**:
   ```bash
   npm run build
   ```
   Hasil kompilasi siap saji akan berada di direktori `dist/`.

5. **Pratinjau Hasil Build**:
   ```bash
   npm run preview
   ```

---

## 🔗 Endpoint API & Integrasi Backend

Seluruh aksi permainan Yahoot! telah 100% tersambung ke backend native LMS:
- **Host Buat Ruangan**: `POST /games`
- **Cek & Polling Lobi**: `GET /games/:codeOrId`
- **Murid Bergabung**: `POST /games/:codeOrId/join`
- **Mulai Kuis**: `POST /games/:gameId/start`
- **Soal Aktif**: `GET /games/:gameId/current-question`
- **Kirim Jawaban**: `POST /games/:gameId/answers`
- **Statistik Jawaban**: `GET /games/:gameId/stats/:questionIndex`
- **Status Kunci Jawaban**: `POST /games/:gameId/status`
- **Soal Berikutnya**: `POST /games/:gameId/next`
- **Hasil & Matriks Jawaban**: `GET /games/:gameId/results`

Dokumentasi lengkap pemetaan 38 aksi dan kontrak API dapat dilihat di [`docs/05-ENDPOINT-USAGE-MAP.md`](docs/05-ENDPOINT-USAGE-MAP.md).

---

## 📜 Lisensi & Kontributor

Dibuat dengan ❤️ oleh **[anditaurban](https://github.com/anditaurban)** untuk mendukung ekosistem pendidikan yang lebih menyenangkan, adil, dan interaktif.

Lisensi di bawah [MIT License](LICENSE).
