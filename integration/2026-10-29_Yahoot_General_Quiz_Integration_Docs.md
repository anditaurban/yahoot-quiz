# Dokumentasi Integrasi API — Kuis Mandiri Yahoot! & Import Soal Quiz
**Tanggal**: 29 Oktober 2026  
**Modul**: Course Quiz / Yahoot! Standalone Quiz (Kuis Umum Tanpa Course/Section & Bulk Import Soal)  
**Target Sistem**: NgodingAI LMS API & Yahoot! Frontend (`yahoot.test`)

---

## 1. Ringkasan Fitur Baru
Pembaruan ini dirancang khusus untuk memfasilitasi antarmuka pembuatan dan pengelolaan kuis pada **Yahoot!**:
1. **Dua Mode Kursus (Bisa PILIH, Bisa KETIK, atau Cuma-cuma/Umum)**:
   - **Mode 1 (PILIH)**: Memilih kursus yang ada di LMS (`course_id: 10`). Kuis otomatis terikat ke kursus tersebut.
   - **Mode 2 (KETIK)**: Mengetik nama kursus/topik secara manual (`course_title: "Dasar Pemrograman Web"`), tanpa harus terdaftar di LMS (`course_id: null`).
   - **Mode 3 (Cuma-cuma / Bebas)**: Tanpa memilih maupun mengetik kursus (`course_id: null`, `course_title: null`). Kuis berstatus umum mandiri.
2. **Dua Tipe Soal (PILIH vs KETIK)**:
   - **Tipe PILIH (Pilihan Ganda)**: Menyediakan `option_a`, `option_b`, `option_c`, `option_d`, dan `correct_answer: "a"` (atau "b", "c", "d").
   - **Tipe KETIK (Isian / Jawaban Singkat)**: Cukup mengisi `question_text` dan `correct_answer: "jawaban"`, tanpa opsi pilihan ganda. Sistem mencocokkan teks jawaban siswa secara otomatis.
3. **Import Banyak Soal Sekaligus (Bulk Import Questions)**:
   - Endpoint khusus `POST /import/course_quiz_questions` untuk mengimpor daftar butir soal sekaligus dalam satu pemanggilan API secara atomik.
4. **One-Shot Create Quiz with Questions**:
   - Pembuatan kuis melalui `POST /add/yahoot_quiz` atau `POST /add/course_quiz` dapat langsung menyertakan array `questions` di dalam request body.
5. **Endpoint Tabel & List Khusus Yahoot**:
   - `GET /table/yahoot_quiz/:owner_id/:current_page` untuk menampilkan seluruh kuis yang dibuat guru di Yahoot.
   - `GET /list/yahoot_quiz/:customer_id` untuk menampilkan daftar kuis umum bagi siswa lengkap dengan skor, attempt, dan status kelulusan.

---

## 2. Header & Otentikasi
Semua request wajib menyertakan Authorization Bearer Token:
```http
Authorization: Bearer <AUTH_TOKEN>
Content-Type: application/json
```

---

## 3. Spesifikasi Endpoint

### 3.1. Buat Kuis Baru Khusus Yahoot (Add Yahoot Quiz)
* **Method**: `POST`
* **Endpoint**: `/add/yahoot_quiz` *(Alias: `/add/course_quiz`, `/add/quiz`)*

#### Contoh 1: Mode KETIK (Custom Course Bebas)
```json
{
  "owner_id": 4409,
  "course_title": "Dasar Pemrograman Web",
  "title": "Kuis Logika Dasar",
  "description": "Kerjakan kuis berikut dengan cermat.",
  "passing_score": 75,
  "time_limit": 30,
  "status": "draft"
}
```

#### Contoh 2: Mode PILIH (Terikat Kursus LMS)
```json
{
  "owner_id": 4409,
  "course_id": 1,
  "title": "Kuis Fundamental LMS Course #1",
  "passing_score": 70,
  "time_limit": 20
}
```

#### Contoh 3: Mode Cuma-cuma / Bebas (Tanpa Kursus)
```json
{
  "owner_id": 4409,
  "title": "Kuis Umum Bebas",
  "passing_score": 75,
  "time_limit": 15
}
```
*Catatan:*
- `course_id` dan `section_id` tidak perlu dikirim (otomatis `null`).
- Field `questions` bersifat opsional. Jika dikirim, soal langsung tersimpan ke database.

* **Response Success (201 Created)**:
```json
{
  "success": true,
  "quiz_id": 16,
  "questions_count": 1
}
```

---

### 3.2. Import Soal Kuis Sekaligus (Bulk Import Questions)
Mengimpor daftar pertanyaan ke kuis yang sudah dibuat sebelumnya.

* **Method**: `POST`
* **Endpoint**: `/import/course_quiz_questions`  
  *(Alias: `/import/course_quiz_question`, `/import/yahoot_quiz_questions`, `/import/quiz_questions`)*
* **Request Body (JSON)**:
```json
{
  "quiz_id": 16,
  "owner_id": 4409,
  "questions": [
    {
      "question_text": "CSS digunakan untuk keperluan apa?",
      "option_a": "Mengatur logika server",
      "option_b": "Mengatur tampilan dan layout",
      "option_c": "Menyimpan data database",
      "option_d": "Mengirimkan email",
      "correct_answer": "b",
      "order_index": 2
    },
    {
      "question_text": "Manakah cara mendeklarasikan variabel di JavaScript ES6?",
      "option_a": "const x = 10;",
      "option_b": "variable x = 10;",
      "option_c": "dim x = 10",
      "option_d": "v x = 10",
      "correct_answer": "a",
      "order_index": 3
    }
  ]
}
```
*Catatan:*
- `correct_answer`: huruf kecil (`a`, `b`, `c`, atau `d`).
- `option_c` dan `option_d` opsional (bisa bernilai `null` jika kuis True/False).
- `order_index` opsional (otomatis berurutan jika tidak ditentukan).

* **Response Success (201 Created)**:
```json
{
  "success": true,
  "message": "Berhasil mengimpor 2 butir soal quiz.",
  "count": 2,
  "quiz_id": 16
}
```

---

### 3.3. Tabel Kuis Yahoot (Teacher Table View)
Melihat daftar kuis milik guru/instruktur di Yahoot dengan pagination dan pencarian.

* **Method**: `GET`
* **Endpoint**:
  - `/table/yahoot_quiz/:owner_id/:current_page?search=keyword`
  - `/table/yahoot_quiz/:current_page?search=keyword` (menampilkan seluruh kuis)
* **Response Success (200 OK)**:
```json
{
  "tableData": [
    {
      "quiz_id": 16,
      "owner_id": 4409,
      "course_id": null,
      "course_title": null,
      "title": "Kuis Fundamental Pemrograman Web",
      "description": "Kerjakan soal pilihan ganda berikut dengan cermat dan jujur.",
      "passing_score": 75,
      "time_limit": 30,
      "status": "draft",
      "section_id": null,
      "section_name": null,
      "created_at": "2026-10-29T00:20:00.000Z",
      "total_questions": 3
    }
  ],
  "totalRecords": 1,
  "totalPages": 1,
  "currentPage": 1
}
```

---

### 3.4. Detail Kuis Beserta Daftar Soal
Mengambil detail kuis dan seluruh butir pertanyaan.

* **Method**: `GET`
* **Endpoint**: `/detail/yahoot_quiz/:quiz_id` *(Alias: `/detail/course_quiz/:quiz_id`)*
* **Response Success (200 OK)**:
```json
{
  "data": {
    "quiz": {
      "quiz_id": 16,
      "owner_id": 4409,
      "course_id": null,
      "course_title": null,
      "section_id": null,
      "section_name": null,
      "title": "Kuis Fundamental Pemrograman Web",
      "description": "Kerjakan soal pilihan ganda berikut.",
      "passing_score": 75,
      "time_limit": 30,
      "status": "publish",
      "deleted": "no",
      "created_at": "2026-10-29T00:20:00.000Z",
      "updated_at": "2026-10-29T00:25:00.000Z"
    },
    "questions": [
      {
        "question_id": 201,
        "quiz_id": 16,
        "owner_id": 4409,
        "question_text": "Apa kepanjangan dari HTML?",
        "option_a": "HyperText Markup Language",
        "option_b": "Hyperlink Text Making Language",
        "option_c": "High Tech Modern Language",
        "option_d": "Home Tool Markup Language",
        "correct_answer": "a",
        "order_index": 1
      }
    ]
  }
}
```

---

### 3.5. Daftar Kuis Umum Yahoot untuk Siswa (Student List View)
Mengambil daftar seluruh kuis umum di Yahoot yang sudah berstatus `publish`, dilengkapi status pengerjaan dan skor terbaik siswa.

* **Method**: `GET`
* **Endpoint**:
  - `/list/yahoot_quiz/:customer_id` (dengan riwayat pengerjaan siswa)
  - `/list/yahoot_quiz` (tanpa riwayat pengerjaan siswa)
* **Response Success (200 OK)**:
```json
{
  "listData": [
    {
      "quiz_id": 16,
      "owner_id": 4409,
      "course_id": null,
      "course_title": null,
      "title": "Kuis Fundamental Pemrograman Web",
      "description": "Kerjakan soal pilihan ganda berikut.",
      "passing_score": 75,
      "time_limit": 30,
      "status": "publish",
      "total_questions": 3,
      "highest_score": 100.0,
      "attempts": 1,
      "is_passed": 1
    }
  ]
}
```

---

### 3.6. Submit Jawaban Kuis Yahoot (Submit Quiz)
* **Method**: `POST`
* **Endpoint**: `/submit/yahoot_quiz` *(Alias: `/submit/course_quiz`)*
* **Request Body (JSON)**:
```json
{
  "quiz_id": 16,
  "customer_id": 32456,
  "answers": {
    "201": "a",
    "202": "b",
    "203": "a"
  }
}
```
*Catatan:* `course_id` bersifat opsional dan tidak wajib dikirim.

* **Response Success (201 Created)**:
```json
{
  "success": true,
  "result_id": 85,
  "score": 100,
  "correct_count": 3,
  "total_questions": 3,
  "is_passed": "yes",
  "attempt": 1
}
```

---

### 3.7. Update Status Publikasi Kuis (Draft / Publish)
* **Method**: `PUT`
* **Endpoint**: `/update/yahoot_quiz/status/:quiz_id` *(Alias: `/update/course_quiz/status/:quiz_id`)*
* **Request Body (JSON)**:
```json
{
  "status": "publish"
}
```
* **Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Status quiz berhasil diperbarui menjadi publish."
}
```
