# Dokumentasi Lengkap Integrasi Frontend & API — Course Quiz (LMS)
**Tanggal**: 20 Oktober 2026  
**Modul**: Course Quiz (CRUD Kuis, Pertanyaan, Status, Submission & Hasil Pengerjaan)  
**Target Sistem**: NgodingAI LMS API & Yahoot! Frontend  

Dokumentasi ini merupakan gabungan lengkap dan mutakhir dari spesifikasi modul kuis LMS API (mengkombinasikan dokumen rilis 10 September 2026 dan update status 22 September 2026). Panduan ini memuat seluruh kontrak endpoint, metode HTTP, format request body, URL parameter, query string, serta contoh respons sukses maupun gagal.

---

## 1. Standar Komunikasi & Otentikasi

Semua permintaan API (kecuali jika dinyatakan publik) wajib menyertakan Authorization Header berbasis Bearer Token dan Content-Type JSON:

```http
Authorization: Bearer <AUTH_TOKEN>
Content-Type: application/json
```

---

## 2. Struktur Data Database (Data Model)

### 2.1. Tabel `course_quiz`
| Field | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `quiz_id` | INT (PK, Auto Inc) | ID unik kuis |
| `owner_id` | INT | User ID pemilik / pembuat |
| `course_id` | INT | ID kursus terkait |
| `section_id` | INT (Nullable) | ID section kurikulum (opsional) |
| `title` | VARCHAR(255) | Judul kuis |
| `description` | TEXT | Deskripsi atau instruksi kuis |
| `passing_score`| INT (Default: 70) | Nilai minimum kelulusan (0 - 100) |
| `time_limit` | INT (Nullable) | Batas waktu pengerjaan (dalam menit, null jika tanpa batas) |
| `status` | ENUM('draft', 'publish', 'published') | Status publikasi kuis (Default: `'draft'`) |
| `deleted` | ENUM('no', 'yes') | Status soft-delete |
| `created_at` | TIMESTAMP | Waktu pembuatan kuis |
| `updated_at` | TIMESTAMP | Waktu terakhir pembaruan data |

### 2.2. Tabel `course_quiz_questions`
| Field | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `question_id` | INT (PK, Auto Inc) | ID unik soal |
| `quiz_id` | INT | Relasi ke `course_quiz.quiz_id` |
| `owner_id` | INT | ID pembuat soal |
| `question_text`| TEXT | Pertanyaan kuis |
| `option_a` | TEXT | Pilihan ganda A |
| `option_b` | TEXT | Pilihan ganda B |
| `option_c` | TEXT (Nullable) | Pilihan ganda C |
| `option_d` | TEXT (Nullable) | Pilihan ganda D |
| `correct_answer`| VARCHAR(10) | Kunci jawaban benar (`a`, `b`, `c`, atau `d`) |
| `order_index` | INT (Default: 0) | Urutan tampilan pertanyaan |
| `deleted` | ENUM('no', 'yes') | Status soft-delete |

### 2.3. Tabel `course_quiz_results`
| Field | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `result_id` | INT (PK, Auto Inc) | ID riwayat hasil |
| `quiz_id` | INT | ID kuis |
| `customer_id` | INT | ID siswa / customer yang mengerjakan |
| `course_id` | INT | ID kursus |
| `score` | DECIMAL(5,2) | Nilai akhir (0 - 100) |
| `correct_count`| INT | Jumlah jawaban benar |
| `total_questions`| INT | Jumlah total butir soal |
| `is_passed` | ENUM('no', 'yes') | Kelulusan (`score >= passing_score`) |
| `answers` | JSON / LONGTEXT | Objek JSON jawaban yang dikirim user |
| `attempt` | INT | Percobaan ke berapa oleh siswa ini |

---

## 3. Modul Course Quiz (CRUD & Status Kuis)

### 3.1. Tambah Kuis Baru (Add Quiz)
Digunakan oleh Instruktur / Admin untuk membuat kuis baru pada suatu course.

* **Method**: `POST`
* **Endpoint**: `/add/course_quiz`
* **Request Body (JSON)**:
```json
{
  "owner_id": 1,
  "course_id": 10,
  "section_id": 2,
  "title": "Kuis Fundamental Pemrograman Web",
  "description": "Kerjakan soal pilihan ganda berikut dengan jujur.",
  "passing_score": 75,
  "time_limit": 30,
  "status": "draft"
}
```
*Catatan:*
* `section_id` dapat bernilai `null` jika kuis tidak terikat section tertentu.
* `status` opsional, default adalah `'draft'`. Nilai yang didukung: `'draft'` atau `'publish'`.

* **Response Success (201 Created)**:
```json
{
  "success": true,
  "quiz_id": 15
}
```

---

### 3.2. Update Kuis (Update Quiz)
Memperbarui informasi kuis (judul, deskripsi, passing score, limit waktu, atau seksi).

* **Method**: `PUT`
* **Endpoint**: `/update/course_quiz/:quiz_id`
* **URL Params**:
  * `quiz_id` (Integer): ID kuis yang akan diupdate.
* **Request Body (JSON)** (Kirim field yang ingin diupdate saja):
```json
{
  "title": "Kuis Fundamental Pemrograman Web (Revisi)",
  "description": "Waktu pengerjaan diperpanjang.",
  "passing_score": 80,
  "time_limit": 45,
  "section_id": 3
}
```
* **Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Quiz updated"
}
```
* **Response Not Found (404 Not Found)**:
```json
{
  "success": false,
  "message": "Quiz not found"
}
```

---

### 3.3. Update Status Publikasi Kuis (Publish / Draft Toggle)
Endpoint khusus dan cepat untuk mengganti status kuis tanpa mengubah field lainnya.

* **Method**: `PUT`
* **Endpoint**: `/update/course_quiz/status/:quiz_id`  
  *(Alias didukung: `/update/course_quiz_status/:quiz_id`)*
* **URL Params**: `quiz_id` (Integer)
* **Request Body (JSON)**:
```json
{
  "status": "publish"
}
```
*(Atau kembali ke draft: `{ "status": "draft" }`)*

* **Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Status quiz berhasil diperbarui menjadi publish."
}
```
* **Response Error Status Invalid (400 Bad Request)**:
```json
{
  "message": "Status tidak valid. Gunakan 'draft' atau 'publish'."
}
```

---

### 3.4. Detail Kuis Beserta Butir Soal (Get Quiz Detail)
Mengambil informasi lengkap kuis beserta seluruh daftar butir soal di dalamnya (digunakan untuk halaman kelola kuis atau halaman pengerjaan soal siswa).

* **Method**: `GET`
* **Endpoint**: `/detail/course_quiz/:quiz_id`
* **URL Params**: `quiz_id` (Integer)
* **Response Success (200 OK)**:
```json
{
  "data": {
    "quiz": {
      "quiz_id": 15,
      "owner_id": 1,
      "course_id": 10,
      "section_id": 2,
      "section_name": "Persiapan Lingkungan Pengembangan",
      "title": "Kuis Fundamental Pemrograman Web",
      "description": "Kerjakan soal pilihan ganda berikut dengan jujur.",
      "passing_score": 75,
      "time_limit": 30,
      "status": "publish",
      "deleted": "no",
      "created_at": "2026-10-20T10:00:00.000Z",
      "updated_at": "2026-10-20T10:15:00.000Z"
    },
    "questions": [
      {
        "question_id": 101,
        "question_text": "Apa kepanjangan dari HTML?",
        "option_a": "Hyper Text Markup Language",
        "option_b": "Hyperlink Text Making Language",
        "option_c": "High Tech Modern Language",
        "option_d": "Home Tool Markup Language",
        "correct_answer": "a",
        "order_index": 1
      },
      {
        "question_id": 102,
        "question_text": "CSS digunakan untuk keperluan apa?",
        "option_a": "Mengatur logika server",
        "option_b": "Mengatur tampilan dan layout",
        "option_c": "Menyimpan data database",
        "option_d": "Mengirimkan email",
        "correct_answer": "b",
        "order_index": 2
      }
    ]
  }
}
```

---

### 3.5. Tabel Daftar Kuis per Course (Admin / Instructor Table View)
Mengambil daftar seluruh kuis dalam kursus dengan pagination dan pencarian nama/deskripsi.

* **Method**: `GET`
* **Endpoint**: `/table/course_quiz/:course_id/:current_page?search=keyword`
* **URL Params**:
  * `course_id` (Integer): ID kursus.
  * `current_page` (Integer): Nomor halaman tabel (mulai dari 1).
* **Query Params**:
  * `search` (String, opsional): Pencarian berdasarkan judul kuis atau deskripsi.
* **Response Success (200 OK)**:
```json
{
  "tableData": [
    {
      "quiz_id": 15,
      "title": "Kuis Fundamental Pemrograman Web",
      "description": "Kerjakan soal pilihan ganda berikut.",
      "passing_score": 75,
      "time_limit": 30,
      "status": "publish",
      "section_id": 2,
      "section_name": "Persiapan Lingkungan Pengembangan"
    }
  ],
  "totalRecords": 1,
  "totalPages": 1,
  "currentPage": 1
}
```

---

### 3.6. Daftar Kuis Siswa dengan Status Kelulusan (Customer / Student List View)
Mengambil daftar kuis per course untuk siswa tertentu, dilengkapi agregasi skor tertinggi, total attempt, dan status kelulusan.

* **Method**: `GET`
* **Endpoint**: `/list/course_quiz/:course_id/:customer_id`
* **URL Params**:
  * `course_id` (Integer): ID kursus.
  * `customer_id` (Integer): ID siswa yang sedang login.
* **Response Success (200 OK)**:
```json
{
  "listData": [
    {
      "quiz_id": 15,
      "title": "Kuis Fundamental Pemrograman Web",
      "description": "Kerjakan soal pilihan ganda berikut.",
      "passing_score": 75,
      "time_limit": 30,
      "status": "publish",
      "section_id": 2,
      "section_name": "Persiapan Lingkungan Pengembangan",
      "highest_score": 100.0,
      "attempts": 2,
      "is_passed": 1
    }
  ]
}
```
*Catatan field:*
* `highest_score`: Skor terbaik siswa pada kuis ini (`null` jika belum pernah mengerjakan).
* `attempts`: Total berapa kali kuis telah dikerjakan.
* `is_passed`: `1` jika sudah pernah lulus (`score >= passing_score`), `0` jika belum.

---

### 3.7. Hapus Kuis (Soft Delete)
Menonaktifkan kuis secara soft delete (`deleted = 'yes'`). Mendukung method `PUT` maupun `DELETE`.

* **Method**: `DELETE` atau `PUT`
* **Endpoint**:
  * `DELETE /delete/course_quiz/:quiz_id`
  * `DELETE /course_quiz/:quiz_id`
  * `PUT /delete/course_quiz/:quiz_id`
* **Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Quiz deleted"
}
```

---

## 4. Modul Soal Kuis (Quiz Questions CRUD)

### 4.1. Tambah Butir Soal (Add Question)
Menambahkan pertanyaan ke dalam kuis yang sudah dibuat.

* **Method**: `POST`
* **Endpoint**: `/add/course_quiz_question`
* **Request Body (JSON)**:
```json
{
  "quiz_id": 15,
  "owner_id": 1,
  "question_text": "Manakah deklarasi variabel JavaScript yang benar?",
  "option_a": "var nama = 'Andi';",
  "option_b": "variable nama = 'Andi';",
  "option_c": "v nama = 'Andi';",
  "option_d": "val nama = 'Andi';",
  "correct_answer": "a",
  "order_index": 3
}
```
*Catatan:*
* `correct_answer`: Simpan kunci jawaban huruf kecil (`a`, `b`, `c`, atau `d`).
* `option_c` dan `option_d` bersifat opsional (default `null` jika kuis hanya berbentuk Benar/Salah).
* **Response Success (201 Created)**:
```json
{
  "success": true,
  "question_id": 103
}
```

---

### 4.2. Detail Soal Kuis (Get Question Detail)
Mengambil detail satu butir pertanyaan berdasarkan ID.

* **Method**: `GET`
* **Endpoint**: `/detail/course_quiz_question/:question_id`  
  *(Alias didukung: `/detail/course_quiz/question/:question_id`)*
* **Response Success (200 OK)**:
```json
{
  "data": {
    "question_id": 103,
    "quiz_id": 15,
    "owner_id": 1,
    "question_text": "Manakah deklarasi variabel JavaScript yang benar?",
    "option_a": "var nama = 'Andi';",
    "option_b": "variable nama = 'Andi';",
    "option_c": "v nama = 'Andi';",
    "option_d": "val nama = 'Andi';",
    "correct_answer": "a",
    "order_index": 3
  }
}
```

---

### 4.3. Update Soal Kuis (Update Question)
Memperbarui pertanyaan, pilihan opsi, kunci jawaban, atau urutan indeks soal.

* **Method**: `PUT`
* **Endpoint**: `/update/course_quiz_question/:question_id`  
  *(Alias didukung: `/update/course_quiz/question/:question_id`)*
* **Request Body (JSON)** (Kirim field yang diubah):
```json
{
  "question_text": "Manakah deklarasi modern variabel di JavaScript (ES6)?",
  "option_a": "const nama = 'Andi';",
  "option_b": "variable nama = 'Andi';",
  "correct_answer": "a"
}
```
* **Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Question updated"
}
```

---

### 4.4. Hapus Soal Kuis (Soft Delete Question)
* **Method**: `DELETE` atau `PUT`
* **Endpoint**:
  * `DELETE /delete/course_quiz_question/:question_id`
  * `DELETE /course_quiz_question/:question_id`
  * `PUT /delete/course_quiz_question/:question_id`
* **Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Question deleted"
}
```

---

## 5. Modul Pengerjaan & Hasil Kuis (Submission & Results)

### 5.1. Submit Jawaban Kuis (Submit Quiz)
Menghitung skor otomatis dari jawaban yang dikirim user, membandingkan dengan passing score, merekam riwayat attempt ke tabel `course_quiz_results`, dan mengirim notifikasi jika lulus.

* **Method**: `POST`
* **Endpoint**: `/submit/course_quiz`
* **Request Body (JSON)**:
```json
{
  "quiz_id": 15,
  "customer_id": 101,
  "course_id": 10,
  "answers": {
    "101": "a",
    "102": "b",
    "103": "a"
  }
}
```
*Struktur `answers`:* Key adalah `question_id` (string/number), value adalah jawaban yang dipilih siswa (`a`, `b`, `c`, atau `d`).

* **Response Success (201 Created)**:
```json
{
  "success": true,
  "result_id": 78,
  "score": 100,
  "correct_count": 3,
  "total_questions": 3,
  "is_passed": "yes",
  "attempt": 1
}
```
*Jika tidak lulus:*
```json
{
  "success": true,
  "result_id": 79,
  "score": 33.33,
  "correct_count": 1,
  "total_questions": 3,
  "is_passed": "no",
  "attempt": 2
}
```

---

### 5.2. Tabel Hasil Seluruh Siswa (Admin / Instructor Result Table View)
Melihat daftar siswa yang telah mengerjakan kuis beserta nilai dan status kelulusan mereka.

* **Method**: `GET`
* **Endpoint**: `/table/course_quiz_results/:quiz_id/:current_page?search=keyword`
* **URL Params**:
  * `quiz_id` (Integer): ID kuis.
  * `current_page` (Integer): Halaman (mulai dari 1).
* **Query Params**:
  * `search` (String, opsional): Cari berdasarkan nama siswa (`customer.nama`).
* **Response Success (200 OK)**:
```json
{
  "tableData": [
    {
      "customer_id": 101,
      "nama": "Budi Santoso",
      "highest_score": 100.0,
      "attempts": 2,
      "is_passed": 1
    }
  ],
  "totalRecords": 1,
  "totalPages": 1,
  "currentPage": 1
}
```

---

### 5.3. Detail Hasil Pengerjaan Siswa Spesifik (Get Result by Customer)
Mengambil detail skor, kelulusan, dan riwayat jawaban siswa tertentu.

* **Method**: `GET`
* **Endpoint**: `/detail/course_quiz_result/:quiz_id/:customer_id`
* **URL Params**:
  * `quiz_id` (Integer): ID kuis.
  * `customer_id` (Integer): ID siswa.
* **Response Success (200 OK)**:
```json
{
  "data": {
    "result_id": 78,
    "quiz_id": 15,
    "customer_id": 101,
    "course_id": 10,
    "score": 100.0,
    "correct_count": 3,
    "total_questions": 3,
    "is_passed": "yes",
    "answers": "{\"101\":\"a\",\"102\":\"b\",\"103\":\"a\"}",
    "attempt": 1,
    "created_at": "2026-10-20T11:00:00.000Z"
  }
}
```

---

## 6. Endpoint Pendukung (Dropdown Relasi Section Kurikulum)

Digunakan pada form Buat/Edit Kuis pada UI Frontend untuk memilih seksi mana kuis tersebut diletakkan.

* **Method**: `GET`
* **Endpoint**: `/list/course_sections/:course_id`
* **Response Success (200 OK)**:
```json
{
  "listData": [
    {
      "section_id": 1,
      "owner_id": 1,
      "course_id": 10,
      "title": "Pengenalan dan Dasar Web",
      "order_index": 1
    },
    {
      "section_id": 2,
      "owner_id": 1,
      "course_id": 10,
      "title": "Persiapan Lingkungan Pengembangan",
      "order_index": 2
    }
  ]
}
```

---

## 7. Rekomendasi Alur Integrasi Frontend (UI/UX Best Practices)

### 7.1. Alur Instruktur / Pembuat Kuis (Admin Flow)
1. **Pilih Section**: Panggil `GET /list/course_sections/:course_id` untuk mengisi pilihan dropdown Section.
2. **Buat Kuis Awal**: Panggil `POST /add/course_quiz` dengan status `"draft"`. Dapatkan `quiz_id`.
3. **Tambah Soal**: Panggil `POST /add/course_quiz_question` berulang sesuai jumlah butir pertanyaan.
4. **Pratinjau Kuis**: Panggil `GET /detail/course_quiz/:quiz_id` untuk memverifikasi seluruh pertanyaan dan kunci jawaban.
5. **Publikasikan**: Ketika soal sudah siap, panggil `PUT /update/course_quiz/status/:quiz_id` dengan body `{ "status": "publish" }`. Kuis sekarang siap dikerjakan siswa.

### 7.2. Alur Siswa / Pengerjaan Kuis (Student Flow)
1. **Daftar Kuis**: Panggil `GET /list/course_quiz/:course_id/:customer_id`. Tampilkan label status (Sudah Lulus / Belum Dikerjakan / Nilai Tertinggi).
2. **Mulai Kuis**: Panggil `GET /detail/course_quiz/:quiz_id`. Mulai penghitung waktu mundur (*timer*) berdasarkan `quiz.time_limit`.
3. **Kirim Jawaban**: Saat waktu habis atau user menekan tombol "Selesai", kumpulkan semua pilihan ke dalam dictionary format `{ [question_id]: answer_code }` dan kirim ke `POST /submit/course_quiz`.
4. **Hasil Instan**: Tampilkan dialog skor, status kelulusan (`is_passed`), dan jumlah jawaban benar. Jika siswa belum lulus dan ingin mencoba lagi, tombol *Coba Lagi* dapat diarahkan kembali ke langkah pengerjaan.
