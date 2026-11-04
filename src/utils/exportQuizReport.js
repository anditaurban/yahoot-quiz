/**
 * Yahoot! Quiz Report Exporter
 * Menghasilkan file spreadsheet rekap nilai (CSV kompatibel dengan Microsoft Excel, Google Sheets, & Numbers)
 * yang memuat identitas kuis, daftar soal, serta matriks jawaban dan perolehan poin per murid.
 */

function escapeCsvCell(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  // Jika mengandung koma, titik koma, kutip ganda, atau newline, bungkus dengan kutip dan escape kutip ganda
  if (str.includes(',') || str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export function exportQuizResultsToCsv({ game, results }) {
  if (!results || !results.players || results.players.length === 0) {
    throw new Error('Tidak ada data pemain untuk diekspor.');
  }

  const quizTitle = results.quizTitle || game?.quizTitle || 'Kuis Yahoot';
  const pinCode = results.pinCode || game?.code || '-';
  const totalQuestions = results.totalQuestions || game?.totalQuestions || 0;
  const questions = results.questions || [];
  const players = results.players || [];
  const dateStr = new Date().toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const rows = [];

  // 1. HEADER INFORMASI UMUM
  rows.push([escapeCsvCell('REKAP HASIL EVALUASI KUIS YAHOOT!')]);
  rows.push([escapeCsvCell('Platform Kuis Interaktif Kelas & Komunitas')]);
  rows.push([]);
  rows.push([escapeCsvCell('Judul Kuis:'), escapeCsvCell(quizTitle)]);
  rows.push([escapeCsvCell('PIN Sesi:'), escapeCsvCell(pinCode)]);
  rows.push([escapeCsvCell('Waktu Pelaksanaan:'), escapeCsvCell(dateStr)]);
  rows.push([escapeCsvCell('Total Soal:'), escapeCsvCell(totalQuestions)]);
  rows.push([escapeCsvCell('Total Peserta:'), escapeCsvCell(players.length)]);
  rows.push([]);

  // 2. DAFTAR PERTANYAAN & KUNCI JAWABAN
  if (questions.length > 0) {
    rows.push([escapeCsvCell('=== DAFTAR BUTIR SOAL & KUNCI JAWABAN ===')]);
    rows.push([
      escapeCsvCell('No'),
      escapeCsvCell('Tipe'),
      escapeCsvCell('Pertanyaan'),
      escapeCsvCell('Kunci Jawaban Resmi'),
      escapeCsvCell('Bobot Poin'),
      escapeCsvCell('Durasi (Detik)'),
    ]);

    questions.forEach((q, idx) => {
      rows.push([
        escapeCsvCell(`Soal ${idx + 1}`),
        escapeCsvCell(q.type || 'Pilihan Ganda'),
        escapeCsvCell(q.question || '-'),
        escapeCsvCell(q.correctAnswer || '-'),
        escapeCsvCell(q.points || 100),
        escapeCsvCell(q.timeLimit || 20),
      ]);
    });
    rows.push([]);
  }

  // 3. TABEL MATRIKS NILAI & JAWABAN SISWA
  rows.push([escapeCsvCell('=== MATRIKS DETAIL JAWABAN & SKOR SISWA ===')]);

  // Bangun Header Kolom Dinamis berdasarkan jumlah soal
  const tableHeader = [
    escapeCsvCell('Peringkat'),
    escapeCsvCell('Nama Siswa'),
  ];

  for (let i = 0; i < totalQuestions; i++) {
    tableHeader.push(escapeCsvCell(`S${i + 1} Jawaban`));
    tableHeader.push(escapeCsvCell(`S${i + 1} Status`));
    tableHeader.push(escapeCsvCell(`S${i + 1} Poin`));
  }

  tableHeader.push(escapeCsvCell('Total Skor Akhir'));
  tableHeader.push(escapeCsvCell('Jawaban Benar'));
  tableHeader.push(escapeCsvCell('Jawaban Salah/Lewat'));
  tableHeader.push(escapeCsvCell('Akurasi (%)'));

  rows.push(tableHeader);

  // Baris Data Tiap Murid
  let totalClassScore = 0;

  players.forEach((p) => {
    totalClassScore += p.score || 0;
    const playerAnswers = p.answers || [];
    
    // Cari jawaban per index
    const answersMap = {};
    playerAnswers.forEach((ans) => {
      answersMap[ans.questionIndex] = ans;
    });

    let correctCount = 0;
    const playerRow = [
      escapeCsvCell(p.rank || '-'),
      escapeCsvCell(p.nickname || 'Anonim'),
    ];

    for (let i = 0; i < totalQuestions; i++) {
      const a = answersMap[i];
      if (a) {
        if (a.isCorrect) correctCount++;
        const answerLabel = a.optionId ? String(a.optionId).toUpperCase() : '-';
        const statusLabel = a.isCorrect ? 'BENAR ✓' : 'SALAH ✗';
        const pointsLabel = a.pointsEarned || 0;

        playerRow.push(escapeCsvCell(answerLabel));
        playerRow.push(escapeCsvCell(statusLabel));
        playerRow.push(escapeCsvCell(pointsLabel));
      } else {
        // Tidak menjawab / waktu habis
        playerRow.push(escapeCsvCell('Tidak Menjawab'));
        playerRow.push(escapeCsvCell('LEWAT ⏱️'));
        playerRow.push(escapeCsvCell(0));
      }
    }

    const wrongCount = totalQuestions - correctCount;
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    playerRow.push(escapeCsvCell(p.score || 0));
    playerRow.push(escapeCsvCell(correctCount));
    playerRow.push(escapeCsvCell(wrongCount));
    playerRow.push(escapeCsvCell(`${accuracy}%`));

    rows.push(playerRow);
  });

  // 4. STATISTIK KELAS
  const avgClassScore = players.length > 0 ? Math.round(totalClassScore / players.length) : 0;
  const highestScore = players[0]?.score || 0;
  const lowestScore = players[players.length - 1]?.score || 0;

  rows.push([]);
  rows.push([escapeCsvCell('=== STATISTIK KELAS ===')]);
  rows.push([escapeCsvCell('Rata-Rata Nilai Kelas:'), escapeCsvCell(avgClassScore)]);
  rows.push([escapeCsvCell('Nilai Tertinggi:'), escapeCsvCell(highestScore)]);
  rows.push([escapeCsvCell('Nilai Terendah:'), escapeCsvCell(lowestScore)]);

  // Format file CSV dengan BOM UTF-8 (\uFEFF) untuk kompatibilitas sempurna Microsoft Excel
  const csvContent = '\uFEFF' + rows.map((r) => r.join(';')).join('\r\n');

  // Trigger download di browser
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const safeTitle = quizTitle.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
  const fileName = `Rekap_Nilai_Yahoot_${safeTitle}_PIN_${pinCode}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return fileName;
}
