// Real database quizzes and questions snapshot for offline fallback
export const INITIAL_QUIZZES = [
  {
    "id": 7,
    "quiz_id": 7,
    "owner_id": 4409,
    "course_id": null,
    "course_title": "Pemrograman Website",
    "title": "Frontend Development Quiz",
    "description": "Kuis ini menguji pemahaman mengenai Frontend Development Roadmap, mulai dari fundamental HTML, CSS, JavaScript, DOM, REST API, Git, npm, React, TypeScript, hingga testing, security, dan performance. Terdiri dari 25 soal pilihan ganda (ABCD) untuk mengukur pemahaman konsep dan kesiapan peserta dalam membangun aplikasi web modern.",
    "passing_score": 75,
    "time_limit": 30,
    "status": "publish",
    "questionCount": 25,
    "total_questions": 25,
    "questions": [
      {
        "id": "q_9",
        "question_id": 9,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Apa peran utama seorang Frontend Developer?",
        "options": [
          {
            "id": "a",
            "text": "Mengelola database server"
          },
          {
            "id": "b",
            "text": "Membangun bagian aplikasi yang berinteraksi langsung dengan user"
          },
          {
            "id": "c",
            "text": "Mengatur infrastruktur jaringan"
          },
          {
            "id": "d",
            "text": "Membuat sistem operasi"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_10",
        "question_id": 10,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Dalam proses membuka website, urutan yang paling sesuai adalah ...",
        "options": [
          {
            "id": "a",
            "text": "Browser → DNS → IP → HTTPS → Server"
          },
          {
            "id": "b",
            "text": "Server → Browser → DNS → IP → HTML"
          },
          {
            "id": "c",
            "text": "DNS → HTML → Browser → Database"
          },
          {
            "id": "d",
            "text": "IP → CSS → DNS → JavaScript"
          }
        ],
        "correctOptionId": "a",
        "correct_answer": "a",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_11",
        "question_id": 11,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Apa perbedaan Internet dan Browser jika kita analogikan?",
        "options": [
          {
            "id": "a",
            "text": "Internet adalah kendaraan, Browser adalah jalan raya"
          },
          {
            "id": "b",
            "text": "Internet dan Browser adalah hal yang sama"
          },
          {
            "id": "c",
            "text": "Internet adalah jalan raya, Browser adalah kendaraan"
          },
          {
            "id": "d",
            "text": "Browser adalah server, Internet adalah database"
          }
        ],
        "correctOptionId": "c",
        "correct_answer": "c",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_12",
        "question_id": 12,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Ketika frontend ingin mengambil data produk dari backend, HTTP method yang digunakan pada contoh materi adalah ...",
        "options": [
          {
            "id": "a",
            "text": "POST"
          },
          {
            "id": "b",
            "text": "DELETE"
          },
          {
            "id": "c",
            "text": "PUT"
          },
          {
            "id": "d",
            "text": "GET"
          }
        ],
        "correctOptionId": "d",
        "correct_answer": "d",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_13",
        "question_id": 13,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Apa fungsi utama HTML dalam pengembangan frontend?",
        "options": [
          {
            "id": "a",
            "text": "Mengatur warna dan animasi"
          },
          {
            "id": "b",
            "text": "Membentuk struktur dan konten halaman"
          },
          {
            "id": "c",
            "text": "Mengelola database"
          },
          {
            "id": "d",
            "text": "Mengatur komunikasi jaringan"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_14",
        "question_id": 14,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Mengapa penggunaan Semantic HTML seperti header, nav, main, dan footer dianjurkan?",
        "options": [
          {
            "id": "a",
            "text": "Agar website otomatis menjadi responsif"
          },
          {
            "id": "b",
            "text": "Agar kode lebih jelas, accessible, ramah SEO, dan mudah dirawat"
          },
          {
            "id": "c",
            "text": "Agar JavaScript tidak diperlukan"
          },
          {
            "id": "d",
            "text": "Agar ukuran database lebih kecil"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_15",
        "question_id": 15,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "JIka kita analogikan, CSS diibaratkan sebagai ...",
        "options": [
          {
            "id": "a",
            "text": "Tulang"
          },
          {
            "id": "b",
            "text": "Otak"
          },
          {
            "id": "c",
            "text": "Outfit"
          },
          {
            "id": "d",
            "text": "Mesin"
          }
        ],
        "correctOptionId": "c",
        "correct_answer": "c",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_16",
        "question_id": 16,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Manakah urutan Box Model CSS dari bagian paling dalam ke paling luar?",
        "options": [
          {
            "id": "a",
            "text": "Margin → Border → Padding → Content"
          },
          {
            "id": "b",
            "text": "Content → Padding → Border → Margin"
          },
          {
            "id": "c",
            "text": "Padding → Content → Margin → Border"
          },
          {
            "id": "d",
            "text": "Border → Content → Padding → Margin"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_17",
        "question_id": 17,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Kapan penggunaan Flexbox lebih tepat?",
        "options": [
          {
            "id": "a",
            "text": "Untuk mengatur elemen dalam satu arah agar tersusun rapi"
          },
          {
            "id": "b",
            "text": "Untuk mengelola database relasional"
          },
          {
            "id": "c",
            "text": "Untuk membuat API endpoint"
          },
          {
            "id": "d",
            "text": "Untuk mengatur autentikasi user"
          }
        ],
        "correctOptionId": "a",
        "correct_answer": "a",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_18",
        "question_id": 18,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Apa fungsi utama CSS Grid?",
        "options": [
          {
            "id": "a",
            "text": "Mengatur komunikasi frontend dan backend"
          },
          {
            "id": "b",
            "text": "Mengelola event klik"
          },
          {
            "id": "c",
            "text": "Menyusun layout menggunakan baris dan kolom"
          },
          {
            "id": "d",
            "text": "Mengelola state aplikasi"
          }
        ],
        "correctOptionId": "c",
        "correct_answer": "c",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_19",
        "question_id": 19,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Apa yang dimaksud dengan Responsive Web Design?",
        "options": [
          {
            "id": "a",
            "text": "Website hanya berjalan di desktop"
          },
          {
            "id": "b",
            "text": "Website tetap memiliki tampilan yang masuk akal di berbagai ukuran layar"
          },
          {
            "id": "c",
            "text": "Website harus menggunakan React"
          },
          {
            "id": "d",
            "text": "Website hanya dapat diakses melalui smartphone"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_20",
        "question_id": 20,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "JavaScript diibaratkan sebagai otak karena ...",
        "options": [
          {
            "id": "a",
            "text": "Mengatur struktur HTML"
          },
          {
            "id": "b",
            "text": "Mengatur warna halaman"
          },
          {
            "id": "c",
            "text": "Membuat halaman bisa bereaksi terhadap tindakan user"
          },
          {
            "id": "d",
            "text": "Menggantikan fungsi browser"
          }
        ],
        "correctOptionId": "c",
        "correct_answer": "c",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_21",
        "question_id": 21,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Apa fungsi DOM dalam JavaScript?",
        "options": [
          {
            "id": "a",
            "text": "Menyimpan data permanen di server"
          },
          {
            "id": "b",
            "text": "Menjadi peta struktur halaman yang dapat dicari dan dimanipulasi JavaScript"
          },
          {
            "id": "c",
            "text": "Mengatur DNS website"
          },
          {
            "id": "d",
            "text": "Menggantikan HTML dan CSS"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_22",
        "question_id": 22,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Urutan proses event handling yang benar adalah ...",
        "options": [
          {
            "id": "a",
            "text": "Handler → User → UI → Event → Action"
          },
          {
            "id": "b",
            "text": "User → Event → Handler → Action → UI"
          },
          {
            "id": "c",
            "text": "UI → Action → User → Handler → Event"
          },
          {
            "id": "d",
            "text": "Event → UI → User → Action → Handler"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_23",
        "question_id": 23,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Apa kegunaan await dalam proses asynchronous JavaScript?",
        "options": [
          {
            "id": "a",
            "text": "Menghentikan browser secara permanen"
          },
          {
            "id": "b",
            "text": "Menghapus seluruh data aplikasi"
          },
          {
            "id": "c",
            "text": "Menunggu hasil proses asynchronous sebelum melanjutkan eksekusi pada konteks async"
          },
          {
            "id": "d",
            "text": "Mengubah HTML menjadi CSS"
          }
        ],
        "correctOptionId": "c",
        "correct_answer": "c",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_24",
        "question_id": 24,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Mengapa Git diibaratkan sebagai mesin waktu?",
        "options": [
          {
            "id": "a",
            "text": "Karena bisa mempercepat koneksi internet"
          },
          {
            "id": "b",
            "text": "Karena menyimpan riwayat perubahan sehingga kita dapat melihat atau kembali ke versi sebelumnya"
          },
          {
            "id": "c",
            "text": "Karena dapat menggantikan JavaScript"
          },
          {
            "id": "d",
            "text": "Karena otomatis memperbaiki semua bug"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_25",
        "question_id": 25,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Apa fungsi utama npm dalam pengembangan frontend?",
        "options": [
          {
            "id": "a",
            "text": "Mengelola dan memasang dependency atau package project"
          },
          {
            "id": "b",
            "text": "Mengelola alamat IP server"
          },
          {
            "id": "c",
            "text": "Membuat desain UI secara otomatis"
          },
          {
            "id": "d",
            "text": "Menggantikan GitHub"
          }
        ],
        "correctOptionId": "a",
        "correct_answer": "a",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_26",
        "question_id": 26,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Mengapa React dibutuhkan ketika aplikasi frontend semakin kompleks?",
        "options": [
          {
            "id": "a",
            "text": "Karena React menggantikan seluruh bahasa pemrograman"
          },
          {
            "id": "b",
            "text": "Karena React membantu mengelola UI melalui state dan component"
          },
          {
            "id": "c",
            "text": "Karena React otomatis membuat database"
          },
          {
            "id": "d",
            "text": "Karena React menghilangkan kebutuhan API"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_27",
        "question_id": 27,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Apa yang dimaksud dengan Component dalam React?",
        "options": [
          {
            "id": "a",
            "text": "Bagian UI yang dapat dibuat sekali dan digunakan kembali"
          },
          {
            "id": "b",
            "text": "Sebuah jenis database"
          },
          {
            "id": "c",
            "text": "Bahasa untuk styling CSS"
          },
          {
            "id": "d",
            "text": "Protokol komunikasi HTTP"
          }
        ],
        "correctOptionId": "a",
        "correct_answer": "a",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_28",
        "question_id": 28,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Apa yang terjadi ketika State dalam React berubah?",
        "options": [
          {
            "id": "a",
            "text": "Server otomatis mati"
          },
          {
            "id": "b",
            "text": "Browser harus diinstal ulang"
          },
          {
            "id": "c",
            "text": "UI akan ikut diperbarui sesuai perubahan state"
          },
          {
            "id": "d",
            "text": "Database otomatis dihapus"
          }
        ],
        "correctOptionId": "c",
        "correct_answer": "c",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_29",
        "question_id": 29,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Apa fungsi Tailwind CSS?",
        "options": [
          {
            "id": "a",
            "text": "Menggantikan JavaScript"
          },
          {
            "id": "b",
            "text": "Menulis styling menggunakan utility class"
          },
          {
            "id": "c",
            "text": "Mengelola API backend"
          },
          {
            "id": "d",
            "text": "Menggantikan pemahaman dasar CSS"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_30",
        "question_id": 30,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Apa manfaat utama TypeScript dalam pengembangan aplikasi?",
        "options": [
          {
            "id": "a",
            "text": "Membuat koneksi internet lebih cepat"
          },
          {
            "id": "b",
            "text": "Menghilangkan semua kemungkinan bug"
          },
          {
            "id": "c",
            "text": "Memberikan kejelasan tipe data sehingga mengurangi kesalahan saat runtime"
          },
          {
            "id": "d",
            "text": "Menggantikan fungsi React"
          }
        ],
        "correctOptionId": "c",
        "correct_answer": "c",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_31",
        "question_id": 31,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Apa tujuan utama testing dalam pengembangan aplikasi?",
        "options": [
          {
            "id": "a",
            "text": "Memastikan perilaku aplikasi tetap berjalan sesuai harapan"
          },
          {
            "id": "b",
            "text": "Membuat desain website lebih menarik"
          },
          {
            "id": "c",
            "text": "Mempercepat proses penulisan kode"
          },
          {
            "id": "d",
            "text": "Menggantikan proses deployment"
          }
        ],
        "correctOptionId": "a",
        "correct_answer": "a",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_32",
        "question_id": 32,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Seorang developer ingin mengetahui request API mana yang menyebabkan halaman lambat. Fitur apa yang sebaiknya digunakan?",
        "options": [
          {
            "id": "a",
            "text": "CSS Grid"
          },
          {
            "id": "b",
            "text": "React Component"
          },
          {
            "id": "c",
            "text": "Semantic HTML"
          },
          {
            "id": "d",
            "text": "DevTools Network dan Timing"
          }
        ],
        "correctOptionId": "d",
        "correct_answer": "d",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_33",
        "question_id": 33,
        "quiz_id": 7,
        "type": "multiple_choice",
        "question": "Dalam era AI, bagaimana seharusnya seorang developer melakukan Vibe Coding?",
        "options": [
          {
            "id": "a",
            "text": "Generate kode lalu langsung deploy tanpa pemeriksaan"
          },
          {
            "id": "b",
            "text": "Meminta AI mengerjakan semuanya tanpa memahami kode"
          },
          {
            "id": "c",
            "text": "Generate, pahami, test, review, kemudian deploy"
          },
          {
            "id": "d",
            "text": "Menghindari testing karena AI sudah menulis kode"
          }
        ],
        "correctOptionId": "c",
        "correct_answer": "c",
        "timeLimit": 20,
        "points": 100
      }
    ],
    "createdAt": "2026-11-02T03:56:19.000Z"
  },
  {
    "id": 8,
    "quiz_id": 8,
    "owner_id": 4409,
    "course_id": 1,
    "course_title": "NgodingAI: Membangun Web Aplikasi Dalam Waktu Singkat",
    "title": "Vibe Coding Quiz",
    "description": "Quiz ini menguji pemahaman mengenai AI dalam Web Development, mulai dari konsep Vibe Coding, pemanfaatan AI untuk membantu proses coding, AI Coding Tools dan Agents, Prompt Engineering, hingga penerapan konsep Source of Truth (SOT) Driven Development. Kerjakan 30 soal pilihan ganda berikut untuk mengukur pemahamanmu dan seberapa siap kamu berkolaborasi dengan AI dalam membangun aplikasi!",
    "passing_score": 75,
    "time_limit": 30,
    "status": "publish",
    "questionCount": 31,
    "total_questions": 31,
    "questions": [
      {
        "id": "q_34",
        "question_id": 34,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Apa yang dimaksud dengan Artificial Intelligence (AI)?",
        "options": [
          {
            "id": "a",
            "text": "Bahasa pemrograman untuk membuat website"
          },
          {
            "id": "b",
            "text": "Cabang ilmu komputer yang membuat sistem mampu meniru kemampuan intelektual manusia"
          },
          {
            "id": "c",
            "text": "Perangkat keras untuk mempercepat komputer"
          },
          {
            "id": "d",
            "text": "Sistem penyimpanan data secara otomatis"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_35",
        "question_id": 35,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Siapa yang mempopulerkan istilah Vibe Coding?",
        "options": [
          {
            "id": "a",
            "text": "Sam Altman"
          },
          {
            "id": "b",
            "text": "Elon Musk"
          },
          {
            "id": "c",
            "text": "Andrej Karpathy"
          },
          {
            "id": "d",
            "text": "Bill Gates"
          }
        ],
        "correctOptionId": "c",
        "correct_answer": "c",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_36",
        "question_id": 36,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Apa yang dimaksud dengan Vibe Coding?",
        "options": [
          {
            "id": "a",
            "text": "Menulis seluruh kode secara manual tanpa bantuan"
          },
          {
            "id": "b",
            "text": "Membangun aplikasi dengan memberikan instruksi bahasa alami kepada AI"
          },
          {
            "id": "c",
            "text": "Membuat desain website menggunakan Photoshop"
          },
          {
            "id": "d",
            "text": "Mengembangkan aplikasi tanpa memahami kebutuhan pengguna"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_37",
        "question_id": 37,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Siapa yang paling cocok menggunakan pendekatan Vibe Coding?",
        "options": [
          {
            "id": "a",
            "text": "Hanya programmer senior"
          },
          {
            "id": "b",
            "text": "Hanya administrator database"
          },
          {
            "id": "c",
            "text": "Developer solo, pemula, dan orang yang memiliki ide produk digital"
          },
          {
            "id": "d",
            "text": "Hanya desainer grafis"
          }
        ],
        "correctOptionId": "c",
        "correct_answer": "c",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_38",
        "question_id": 38,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Dalam workflow Vibe Coding, apa yang dilakukan setelah AI menghasilkan kode?",
        "options": [
          {
            "id": "a",
            "text": "Langsung menghapus seluruh kode"
          },
          {
            "id": "b",
            "text": "Melakukan review dan memberikan persetujuan terhadap hasil kode"
          },
          {
            "id": "c",
            "text": "Mengganti bahasa pemrograman"
          },
          {
            "id": "d",
            "text": "Menghentikan proses pengembangan"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_39",
        "question_id": 39,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Manakah berikut ini yang merupakan pemanfaatan AI dalam programming?",
        "options": [
          {
            "id": "a",
            "text": "Menghasilkan kode program"
          },
          {
            "id": "b",
            "text": "Memperbaiki bug"
          },
          {
            "id": "c",
            "text": "Membuat dokumentasi"
          },
          {
            "id": "d",
            "text": "Semua jawaban benar"
          }
        ],
        "correctOptionId": "d",
        "correct_answer": "d",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_40",
        "question_id": 40,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Apa salah satu manfaat utama penggunaan AI dalam proses coding?",
        "options": [
          {
            "id": "a",
            "text": "Menghilangkan kebutuhan memahami logika program"
          },
          {
            "id": "b",
            "text": "Menjamin aplikasi bebas dari bug"
          },
          {
            "id": "c",
            "text": "Menghapus kebutuhan melakukan testing"
          },
          {
            "id": "d",
            "text": "Menghemat waktu dan meningkatkan produktivitas"
          }
        ],
        "correctOptionId": "d",
        "correct_answer": "d",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_41",
        "question_id": 41,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Apa yang dimaksud dengan AI-Assisted Coding?",
        "options": [
          {
            "id": "a",
            "text": "AI membangun seluruh aplikasi tanpa campur tangan manusia"
          },
          {
            "id": "b",
            "text": "AI membantu proses coding melalui autocomplete, debugging, dan dokumentasi"
          },
          {
            "id": "c",
            "text": "Developer hanya menggunakan bahasa mesin"
          },
          {
            "id": "d",
            "text": "AI menggantikan seluruh pekerjaan developer"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_42",
        "question_id": 42,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Apa yang dimaksud dengan AI-Generated Coding?",
        "options": [
          {
            "id": "a",
            "text": "Proses menghasilkan kode secara otomatis menggunakan model machine learning"
          },
          {
            "id": "b",
            "text": "Proses menulis kode secara manual"
          },
          {
            "id": "c",
            "text": "Proses menghapus kode yang tidak digunakan"
          },
          {
            "id": "d",
            "text": "Proses membuat desain database"
          }
        ],
        "correctOptionId": "a",
        "correct_answer": "a",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_43",
        "question_id": 43,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "AI Coding Tool manakah yang dikenal memiliki fitur Codex?",
        "options": [
          {
            "id": "a",
            "text": "ChatGPT"
          },
          {
            "id": "b",
            "text": "DeepSeek"
          },
          {
            "id": "c",
            "text": "V0"
          },
          {
            "id": "d",
            "text": "GitHub Copilot"
          }
        ],
        "correctOptionId": "a",
        "correct_answer": "a",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_44",
        "question_id": 44,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "AI Coding Tool manakah yang memiliki Antigravity dalam ekosistemnya?",
        "options": [
          {
            "id": "a",
            "text": "Claude"
          },
          {
            "id": "b",
            "text": "Gemini"
          },
          {
            "id": "c",
            "text": "DeepSeek"
          },
          {
            "id": "d",
            "text": "GitHub Copilot"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_45",
        "question_id": 45,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Tool AI manakah yang berfokus pada pembuatan UI?",
        "options": [
          {
            "id": "a",
            "text": "V0"
          },
          {
            "id": "b",
            "text": "DeepSeek"
          },
          {
            "id": "c",
            "text": "ChatGPT"
          },
          {
            "id": "d",
            "text": "GitHub Copilot"
          }
        ],
        "correctOptionId": "a",
        "correct_answer": "a",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_46",
        "question_id": 46,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Tool AI manakah yang dikenal membantu memberikan saran kode otomatis di dalam IDE?",
        "options": [
          {
            "id": "a",
            "text": "Claude"
          },
          {
            "id": "b",
            "text": "Gemini"
          },
          {
            "id": "c",
            "text": "GitHub Copilot"
          },
          {
            "id": "d",
            "text": "V0"
          }
        ],
        "correctOptionId": "c",
        "correct_answer": "c",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_47",
        "question_id": 47,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Manakah yang termasuk AI Coding Agent?",
        "options": [
          {
            "id": "a",
            "text": "Cursor"
          },
          {
            "id": "b",
            "text": "Microsoft Word"
          },
          {
            "id": "c",
            "text": "Adobe Photoshop"
          },
          {
            "id": "d",
            "text": "Google Sheets"
          }
        ],
        "correctOptionId": "a",
        "correct_answer": "a",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_48",
        "question_id": 48,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Apa peran manusia ketika menggunakan AI untuk melakukan coding?",
        "options": [
          {
            "id": "a",
            "text": "Memberikan arahan, memahami logika, dan mengevaluasi hasil kode"
          },
          {
            "id": "b",
            "text": "Membiarkan AI mengambil seluruh keputusan"
          },
          {
            "id": "c",
            "text": "Tidak perlu memahami struktur aplikasi"
          },
          {
            "id": "d",
            "text": "Hanya menjalankan aplikasi tanpa melakukan review"
          }
        ],
        "correctOptionId": "a",
        "correct_answer": "a",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_49",
        "question_id": 49,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Apa salah satu tantangan dalam menggunakan AI untuk coding?",
        "options": [
          {
            "id": "a",
            "text": "AI selalu menghasilkan kode yang sempurna"
          },
          {
            "id": "b",
            "text": "AI tidak membutuhkan konteks"
          },
          {
            "id": "c",
            "text": "AI tidak bisa menghasilkan kode program"
          },
          {
            "id": "d",
            "text": "AI dapat salah memahami konteks dan menghasilkan kode yang keliru"
          }
        ],
        "correctOptionId": "d",
        "correct_answer": "d",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_50",
        "question_id": 50,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Mengapa AI terkadang menghasilkan kode yang tidak sesuai harapan?",
        "options": [
          {
            "id": "a",
            "text": "Karena komputer tidak memiliki RAM"
          },
          {
            "id": "b",
            "text": "Karena ide produk tidak jelas dan prompt kurang terarah"
          },
          {
            "id": "c",
            "text": "Karena semua bahasa pemrograman sama"
          },
          {
            "id": "d",
            "text": "Karena AI tidak dapat membaca instruksi"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_51",
        "question_id": 51,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Apa yang dimaksud dengan Prompt Engineering?",
        "options": [
          {
            "id": "a",
            "text": "Teknik mempercepat koneksi internet"
          },
          {
            "id": "b",
            "text": "Teknik mengelola database"
          },
          {
            "id": "c",
            "text": "Teknik mendesain tampilan website"
          },
          {
            "id": "d",
            "text": "Teknik menyusun instruksi agar AI menghasilkan output yang sesuai kebutuhan"
          }
        ],
        "correctOptionId": "d",
        "correct_answer": "d",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_52",
        "question_id": 52,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Mengapa prompt yang diberikan kepada AI harus jelas dan memiliki konteks?",
        "options": [
          {
            "id": "a",
            "text": "Agar AI dapat menggantikan seluruh pekerjaan manusia"
          },
          {
            "id": "b",
            "text": "Agar AI tidak perlu menghasilkan kode"
          },
          {
            "id": "c",
            "text": "Agar AI lebih memahami kebutuhan dan memberikan hasil yang relevan"
          },
          {
            "id": "d",
            "text": "Agar proses coding tidak membutuhkan testing"
          }
        ],
        "correctOptionId": "c",
        "correct_answer": "c",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_53",
        "question_id": 53,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Analogi memesan makanan di restoran dalam Prompt Engineering menjelaskan tentang apa?",
        "options": [
          {
            "id": "a",
            "text": "Pentingnya menggunakan bahasa pemrograman yang tepat"
          },
          {
            "id": "b",
            "text": "Pentingnya memberikan instruksi yang spesifik dan jelas"
          },
          {
            "id": "c",
            "text": "Pentingnya memilih restoran terbaik"
          },
          {
            "id": "d",
            "text": "Pentingnya menggunakan komputer dengan spesifikasi tinggi"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_54",
        "question_id": 54,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Manakah berikut ini yang termasuk elemen dalam penyusunan prompt?",
        "options": [
          {
            "id": "a",
            "text": "Instruction"
          },
          {
            "id": "b",
            "text": "Additional Input Data"
          },
          {
            "id": "c",
            "text": "Desired Output Format"
          },
          {
            "id": "d",
            "text": "Semua jawaban benar"
          }
        ],
        "correctOptionId": "d",
        "correct_answer": "d",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_55",
        "question_id": 55,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Apakah semua elemen prompt wajib digunakan dalam setiap instruksi kepada AI?",
        "options": [
          {
            "id": "a",
            "text": "Ya, seluruh elemen wajib digunakan"
          },
          {
            "id": "b",
            "text": "Tidak, elemen dapat disesuaikan dengan kebutuhan prompt"
          },
          {
            "id": "c",
            "text": "Hanya Example Answer yang wajib digunakan"
          },
          {
            "id": "d",
            "text": "Hanya Tone yang wajib digunakan"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_56",
        "question_id": 56,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Minimal, prompt yang baik harus memiliki salah satu dari elemen berikut:",
        "options": [
          {
            "id": "a",
            "text": "Instruction atau Questions"
          },
          {
            "id": "b",
            "text": "Example Answer atau Tone"
          },
          {
            "id": "c",
            "text": "Format atau Additional Input Data"
          },
          {
            "id": "d",
            "text": "Role atau Example"
          }
        ],
        "correctOptionId": "a",
        "correct_answer": "a",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_57",
        "question_id": 57,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Dalam Golden Rules Prompt Engineering, ROLE digunakan untuk apa?",
        "options": [
          {
            "id": "a",
            "text": "Menentukan warna desain aplikasi"
          },
          {
            "id": "b",
            "text": "Menentukan jumlah tabel database"
          },
          {
            "id": "c",
            "text": "Menentukan peran atau identitas yang harus dijalankan AI"
          },
          {
            "id": "d",
            "text": "Menentukan bahasa pemrograman backend"
          }
        ],
        "correctOptionId": "c",
        "correct_answer": "c",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_58",
        "question_id": 58,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Dalam Golden Rules Prompt Engineering, TASK berfungsi untuk apa?",
        "options": [
          {
            "id": "a",
            "text": "Menentukan latar belakang masalah"
          },
          {
            "id": "b",
            "text": "Menentukan gaya bahasa AI"
          },
          {
            "id": "c",
            "text": "Menentukan contoh hasil output"
          },
          {
            "id": "d",
            "text": "Menjelaskan tugas spesifik yang harus dikerjakan AI"
          }
        ],
        "correctOptionId": "d",
        "correct_answer": "d",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_59",
        "question_id": 59,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Dalam Golden Rules Prompt Engineering, CONTEXT berisi informasi tentang apa?",
        "options": [
          {
            "id": "a",
            "text": "Warna favorit developer"
          },
          {
            "id": "b",
            "text": "Masalah, tujuan, fitur utama, dan alur pengguna"
          },
          {
            "id": "c",
            "text": "Nama perangkat komputer"
          },
          {
            "id": "d",
            "text": "Jumlah anggota tim saja"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_60",
        "question_id": 60,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Apa fungsi FORMAT dalam Golden Rules Prompt Engineering?",
        "options": [
          {
            "id": "a",
            "text": "Menentukan bentuk atau struktur output yang diharapkan"
          },
          {
            "id": "b",
            "text": "Menentukan role AI"
          },
          {
            "id": "c",
            "text": "Menentukan database yang digunakan"
          },
          {
            "id": "d",
            "text": "Menentukan jumlah developer"
          }
        ],
        "correctOptionId": "a",
        "correct_answer": "a",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_61",
        "question_id": 61,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Apa tujuan penerapan Source of Truth (SOT) Driven Development?",
        "options": [
          {
            "id": "a",
            "text": "Memulai coding tanpa perencanaan"
          },
          {
            "id": "b",
            "text": "Membuat dokumentasi sebanyak mungkin"
          },
          {
            "id": "c",
            "text": "Menyediakan dokumen dan aturan sebagai referensi bersama bagi developer dan AI"
          },
          {
            "id": "d",
            "text": "Menghindari penggunaan API"
          }
        ],
        "correctOptionId": "c",
        "correct_answer": "c",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_62",
        "question_id": 62,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Dokumen SOT manakah yang menjelaskan struktur tabel, relasi, dan database?",
        "options": [
          {
            "id": "a",
            "text": "USER FLOW"
          },
          {
            "id": "b",
            "text": "DATABASE SPEC"
          },
          {
            "id": "c",
            "text": "UI GUIDELINE"
          },
          {
            "id": "d",
            "text": "IMPLEMENTATION PLAN"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_63",
        "question_id": 63,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Dokumen SOT apa saja yang menjadi referensi utama bagi DB Agent?",
        "options": [
          {
            "id": "a",
            "text": "PRD, USER FLOW, dan UI GUIDELINE"
          },
          {
            "id": "b",
            "text": "USER FLOW, API SPEC, dan IMPLEMENTATION PLAN"
          },
          {
            "id": "c",
            "text": "UI GUIDELINE, API SPEC, dan BUSINESS RULES"
          },
          {
            "id": "d",
            "text": "PRD, BUSINESS RULES, dan DATABASE SPEC"
          }
        ],
        "correctOptionId": "d",
        "correct_answer": "d",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_64",
        "question_id": 64,
        "quiz_id": 8,
        "type": "multiple_choice",
        "question": "Apa kesimpulan utama dari penggunaan AI dalam proses coding?",
        "options": [
          {
            "id": "a",
            "text": "AI sepenuhnya menggantikan developer"
          },
          {
            "id": "b",
            "text": "Developer tidak perlu memahami logika pemrograman"
          },
          {
            "id": "c",
            "text": "AI adalah partner atau asisten coding, sedangkan manusia tetap bertanggung jawab atas hasilnya"
          },
          {
            "id": "d",
            "text": "AI dapat membangun aplikasi tanpa instruksi manusia"
          }
        ],
        "correctOptionId": "c",
        "correct_answer": "c",
        "timeLimit": 20,
        "points": 100
      }
    ],
    "createdAt": "2026-11-02T05:22:04.000Z"
  },
  {
    "id": 10,
    "quiz_id": 10,
    "owner_id": 4409,
    "course_id": null,
    "course_title": "Vibe Coding Fundamentals",
    "title": "Vibe Coding Fun Quiz",
    "description": "Seberapa paham kamu tentang dunia Vibe Coding dan AI dalam Web Development? 🤖\n\nLewat 15 pertanyaan seru ini, uji pengetahuanmu tentang konsep Vibe Coding, AI Coding Tools, Prompt Engineering, AI Coding Agents, hingga SOT Driven Development. Yuk, buktikan bahwa kamu bukan cuma bisa ngoding bareng AI, tapi juga tahu cara mengarahkannya dengan benar!",
    "passing_score": 75,
    "time_limit": 30,
    "status": "publish",
    "questionCount": 15,
    "total_questions": 15,
    "questions": [
      {
        "id": "q_65",
        "question_id": 65,
        "quiz_id": 10,
        "type": "multiple_choice",
        "question": "Apa yang dimaksud dengan Vibe Coding?",
        "options": [
          {
            "id": "a",
            "text": "Ngoding manual tanpa bantuan AI"
          },
          {
            "id": "b",
            "text": "Ngoding dengan memberikan instruksi kepada AI untuk menghasilkan kode"
          },
          {
            "id": "c",
            "text": "Mendesain website menggunakan Photoshop"
          },
          {
            "id": "d",
            "text": "Membuat database tanpa struktur"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_66",
        "question_id": 66,
        "quiz_id": 10,
        "type": "multiple_choice",
        "question": "Siapa yang mempopulerkan istilah Vibe Coding?",
        "options": [
          {
            "id": "a",
            "text": "Sam Altman"
          },
          {
            "id": "b",
            "text": "Bill Gates"
          },
          {
            "id": "c",
            "text": "Andrej Karpathy"
          },
          {
            "id": "d",
            "text": "Mark Zuckerberg"
          }
        ],
        "correctOptionId": "c",
        "correct_answer": "c",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_67",
        "question_id": 67,
        "quiz_id": 10,
        "type": "multiple_choice",
        "question": "Apa yang sebaiknya dilakukan setelah AI menghasilkan kode?",
        "options": [
          {
            "id": "a",
            "text": "Langsung deploy tanpa diperiksa"
          },
          {
            "id": "b",
            "text": "Menghapus seluruh kode"
          },
          {
            "id": "c",
            "text": "Review dan menguji hasil kode"
          },
          {
            "id": "d",
            "text": "Meminta AI berhenti bekerja"
          }
        ],
        "correctOptionId": "c",
        "correct_answer": "c",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_68",
        "question_id": 68,
        "quiz_id": 10,
        "type": "multiple_choice",
        "question": "Apa manfaat utama menggunakan AI untuk coding?",
        "options": [
          {
            "id": "a",
            "text": "Menghilangkan kebutuhan belajar programming"
          },
          {
            "id": "b",
            "text": "Menghemat waktu dan meningkatkan produktivitas"
          },
          {
            "id": "c",
            "text": "Menjamin tidak ada bug"
          },
          {
            "id": "d",
            "text": "Menghapus kebutuhan testing"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_69",
        "question_id": 69,
        "quiz_id": 10,
        "type": "multiple_choice",
        "question": "Tool AI manakah yang berfokus pada pembuatan UI?",
        "options": [
          {
            "id": "a",
            "text": "V0"
          },
          {
            "id": "b",
            "text": "DeepSeek"
          },
          {
            "id": "c",
            "text": "GitHub Copilot"
          },
          {
            "id": "d",
            "text": "MySQL"
          }
        ],
        "correctOptionId": "a",
        "correct_answer": "a",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_70",
        "question_id": 70,
        "quiz_id": 10,
        "type": "multiple_choice",
        "question": "Tool AI manakah yang dikenal memberikan saran kode otomatis di IDE?",
        "options": [
          {
            "id": "a",
            "text": "Canva"
          },
          {
            "id": "b",
            "text": "GitHub Copilot"
          },
          {
            "id": "c",
            "text": "Figma"
          },
          {
            "id": "d",
            "text": "Photoshop"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_71",
        "question_id": 71,
        "quiz_id": 10,
        "type": "multiple_choice",
        "question": "Apa yang dimaksud dengan AI Coding Agent?",
        "options": [
          {
            "id": "a",
            "text": "Aplikasi untuk mengedit foto"
          },
          {
            "id": "b",
            "text": "Tools AI yang dapat membantu menjalankan tugas pengembangan software"
          },
          {
            "id": "c",
            "text": "Sistem operasi komputer"
          },
          {
            "id": "d",
            "text": "Bahasa pemrograman baru"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_72",
        "question_id": 72,
        "quiz_id": 10,
        "type": "multiple_choice",
        "question": "Apa yang dimaksud dengan Prompt Engineering?",
        "options": [
          {
            "id": "a",
            "text": "Teknik mempercepat internet"
          },
          {
            "id": "b",
            "text": "Teknik membuat database"
          },
          {
            "id": "c",
            "text": "Teknik menyusun instruksi agar AI menghasilkan output sesuai kebutuhan"
          },
          {
            "id": "d",
            "text": "Teknik memperbaiki hardware"
          }
        ],
        "correctOptionId": "c",
        "correct_answer": "c",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_73",
        "question_id": 73,
        "quiz_id": 10,
        "type": "multiple_choice",
        "question": "Mengapa prompt harus jelas dan memiliki konteks?",
        "options": [
          {
            "id": "a",
            "text": "Agar AI memahami kebutuhan dengan lebih baik"
          },
          {
            "id": "b",
            "text": "Agar AI tidak menghasilkan kode"
          },
          {
            "id": "c",
            "text": "Agar tidak perlu melakukan testing"
          },
          {
            "id": "d",
            "text": "Agar komputer bekerja lebih cepat"
          }
        ],
        "correctOptionId": "a",
        "correct_answer": "a",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_74",
        "question_id": 74,
        "quiz_id": 10,
        "type": "multiple_choice",
        "question": "Dalam Golden Rules Prompt Engineering, ROLE digunakan untuk apa?",
        "options": [
          {
            "id": "a",
            "text": "Menentukan warna website"
          },
          {
            "id": "b",
            "text": "Menentukan peran yang harus dijalankan AI"
          },
          {
            "id": "c",
            "text": "Menentukan ukuran database"
          },
          {
            "id": "d",
            "text": "Menentukan harga aplikasi"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_75",
        "question_id": 75,
        "quiz_id": 10,
        "type": "multiple_choice",
        "question": "Dalam Golden Rules Prompt Engineering, TASK berfungsi untuk apa?",
        "options": [
          {
            "id": "a",
            "text": "Menjelaskan tugas spesifik yang harus dikerjakan AI"
          },
          {
            "id": "b",
            "text": "Menentukan warna tombol"
          },
          {
            "id": "c",
            "text": "Menentukan nama database"
          },
          {
            "id": "d",
            "text": "Menentukan perangkat komputer"
          }
        ],
        "correctOptionId": "a",
        "correct_answer": "a",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_76",
        "question_id": 76,
        "quiz_id": 10,
        "type": "multiple_choice",
        "question": "Apa fungsi CONTEXT dalam sebuah prompt?",
        "options": [
          {
            "id": "a",
            "text": "Menentukan gaya font"
          },
          {
            "id": "b",
            "text": "Memberikan informasi masalah, tujuan, fitur, dan alur aplikasi"
          },
          {
            "id": "c",
            "text": "Menghapus instruksi sebelumnya"
          },
          {
            "id": "d",
            "text": "Menentukan jumlah file gambar"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_77",
        "question_id": 77,
        "quiz_id": 10,
        "type": "multiple_choice",
        "question": "Apa yang dimaksud dengan Source of Truth (SOT) Driven Development?",
        "options": [
          {
            "id": "a",
            "text": "Coding langsung tanpa perencanaan"
          },
          {
            "id": "b",
            "text": "Mengembangkan aplikasi hanya menggunakan AI"
          },
          {
            "id": "c",
            "text": "Menggunakan dokumen dan aturan sebagai referensi bersama developer dan AI"
          },
          {
            "id": "d",
            "text": "Membuat aplikasi tanpa database"
          }
        ],
        "correctOptionId": "c",
        "correct_answer": "c",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_78",
        "question_id": 78,
        "quiz_id": 10,
        "type": "multiple_choice",
        "question": "Dokumen SOT apa yang menjelaskan struktur tabel dan relasi database?",
        "options": [
          {
            "id": "a",
            "text": "PRD"
          },
          {
            "id": "b",
            "text": "USER FLOW"
          },
          {
            "id": "c",
            "text": "UI GUIDELINE"
          },
          {
            "id": "d",
            "text": "DATABASE SPEC"
          }
        ],
        "correctOptionId": "d",
        "correct_answer": "d",
        "timeLimit": 20,
        "points": 100
      },
      {
        "id": "q_79",
        "question_id": 79,
        "quiz_id": 10,
        "type": "multiple_choice",
        "question": "Siapa yang tetap bertanggung jawab terhadap kualitas dan hasil akhir kode yang dibuat dengan bantuan AI?",
        "options": [
          {
            "id": "a",
            "text": "AI sepenuhnya"
          },
          {
            "id": "b",
            "text": "Manusia atau developer"
          },
          {
            "id": "c",
            "text": "Komputer secara otomatis"
          },
          {
            "id": "d",
            "text": "Tidak ada yang bertanggung jawab"
          }
        ],
        "correctOptionId": "b",
        "correct_answer": "b",
        "timeLimit": 20,
        "points": 100
      }
    ],
    "createdAt": "2026-11-02T13:46:15.000Z"
  }
];
