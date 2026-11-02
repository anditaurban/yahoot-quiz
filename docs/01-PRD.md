# Yahoot! — PRD (Frontend)

## 1. Product
**Yahoot!** adalah platform kuis multiplayer berbasis web untuk guru dan murid. Guru membuat/mengelola sesi kuis, sedangkan murid bergabung menggunakan kode dan menjawab soal dari perangkat masing-masing.

## 2. Frontend Scope
Stack:
- HTML
- React + Vite
- Tailwind CSS
- Responsive Web

Frontend fase ini berfokus pada pengalaman dan state UI. Backend/API menjadi kontrak yang dikonsumsi frontend.

## 3. Target User
### Guru
Membuat kuis, membuka game session, melihat peserta, menjalankan soal, dan melihat hasil.

### Murid
Masuk menggunakan game code + nickname, menunggu host, menjawab soal, dan melihat hasil/status.

## 4. Core MVP
### Teacher
- Landing/login entry sederhana.
- Teacher dashboard.
- Daftar kuis.
- Membuat kuis.
- Menambah/edit/hapus soal.
- Tipe soal:
  - Multiple Choice
  - True / False
- Preview kuis.
- Membuka live game.
- Menampilkan game code.
- Melihat peserta yang bergabung.
- Menjalankan soal.
- Melihat hasil sementara dan final.

### Student
- Join game dengan game code.
- Input nickname.
- Lobby/waiting screen.
- Menampilkan soal aktif.
- Memilih jawaban.
- Feedback jawaban.
- Score/result screen.

## 5. Non-Goals
Jangan implementasikan pada fase frontend MVP:
- Payment/subscription.
- Chat.
- Social features.
- AI question generator.
- File import/export.
- Advanced analytics.
- Native mobile app.
- Complex role/permission system.
- Custom theme builder.
- Real-time infrastructure di frontend.

## 6. UX Principle
Yahoot! harus terasa seperti game, bukan admin CRUD biasa:
- cepat dipahami;
- visual kuat;
- feedback instan;
- tombol besar;
- minim teks yang tidak diperlukan;
- mobile-first untuk student;
- desktop-friendly untuk teacher.

## 7. Visual Direction
Nuansa terinspirasi game sandbox seperti Minecraft/Roblox:
- blocky;
- playful;
- bold;
- rounded/block-shaped components;
- depth melalui shadow;
- avatar/player identity;
- gamified feedback.

Jangan menyalin aset, logo, font, karakter, atau UI proprietary Minecraft/Roblox. Gunakan hanya inspirasi visual umum.

## 8. Responsive
### Student
Prioritas:
1. Mobile portrait
2. Tablet
3. Desktop

### Teacher
Prioritas:
1. Desktop
2. Tablet
3. Mobile fallback

## 9. Success Criteria
- User memahami tujuan halaman tanpa tutorial panjang.
- Student dapat join dan menjawab dengan sedikit interaksi.
- Teacher dapat membuat soal tanpa kebingungan.
- Layout tidak rusak pada mobile.
- State loading/error/empty tersedia.
- Tidak ada visual atau komponen yang terasa seperti template AI generik.

## 10. Frontend Architecture
Gunakan komponen reusable secukupnya:
- Button
- Card
- Input
- Modal
- Badge
- QuestionOption
- Progress
- Avatar
- GameCode
- Timer
- ScoreCard

Jangan membuat design system besar. Komponen dibuat ketika ada reuse nyata.

## 11. Definition of Done
Frontend dianggap selesai jika:
- semua user flow utama dapat dinavigasi;
- semua screen MVP tersedia;
- responsive;
- loading/error/empty state tersedia;
- API calls terisolasi dari UI;
- tidak ada hardcoded data yang menghambat integrasi API;
- build Vite berhasil.
