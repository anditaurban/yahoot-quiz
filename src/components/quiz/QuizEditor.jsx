import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Check, AlertCircle } from 'lucide-react';

export const QuizEditor = ({
  initialQuestion,
  onSave,
  onCancel,
}) => {
  const [type, setType] = useState(initialQuestion?.type || 'multiple_choice');
  const [questionText, setQuestionText] = useState(initialQuestion?.question || '');
  const [timeLimit, setTimeLimit] = useState(initialQuestion?.timeLimit || 20);
  const [points, setPoints] = useState(initialQuestion?.points || 100);

  // Default Multiple Choice options
  const [mcOptions, setMcOptions] = useState(() => {
    const existing = initialQuestion?.options || [];
    const getVal = (id) => existing.find(o => String(o.id).toLowerCase() === id)?.text || '';
    return [
      { id: 'a', text: getVal('a') || existing[0]?.text || '' },
      { id: 'b', text: getVal('b') || existing[1]?.text || '' },
      { id: 'c', text: getVal('c') || existing[2]?.text || '' },
      { id: 'd', text: getVal('d') || existing[3]?.text || '' }
    ];
  });

  const [correctOptionId, setCorrectOptionId] = useState(() => {
    if (initialQuestion?.type === 'short_answer') {
      return initialQuestion.correct_answer || initialQuestion.correctOptionId || '';
    }
    return initialQuestion?.correctOptionId || (initialQuestion?.type === 'true_false' ? 'true' : 'a');
  });

  // Short answer text state
  const [shortAnswerText, setShortAnswerText] = useState(
    initialQuestion?.type === 'short_answer'
      ? (initialQuestion.correct_answer || initialQuestion.correctOptionId || '')
      : ''
  );

  const [error, setError] = useState('');

  const handleOptionTextChange = (id, text) => {
    setMcOptions(prev => prev.map(opt => opt.id === id ? { ...opt, text } : opt));
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'true_false') {
      setCorrectOptionId('true');
    } else if (newType === 'short_answer') {
      setCorrectOptionId(shortAnswerText.trim());
    } else {
      setCorrectOptionId('a');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!questionText.trim()) {
      setError('Teks pertanyaan tidak boleh kosong.');
      return;
    }

    let finalOptions = [];
    let finalCorrectAnswer = '';

    if (type === 'multiple_choice') {
      const hasEmpty = mcOptions.some(opt => !opt.text.trim());
      if (hasEmpty) {
        setError('Semua 4 pilihan jawaban harus diisi.');
        return;
      }
      finalOptions = mcOptions.map(opt => ({ id: opt.id, text: opt.text.trim() }));
      finalCorrectAnswer = correctOptionId;
    } else if (type === 'true_false') {
      finalOptions = [
        { id: 'true', text: 'True' },
        { id: 'false', text: 'False' }
      ];
      finalCorrectAnswer = correctOptionId;
    } else if (type === 'short_answer') {
      if (!shortAnswerText.trim()) {
        setError('Kunci teks jawaban tidak boleh kosong.');
        return;
      }
      finalOptions = [];
      finalCorrectAnswer = shortAnswerText.trim();
    }

    if (!finalCorrectAnswer) {
      setError('Tentukan kunci jawaban yang benar.');
      return;
    }

    onSave({
      type,
      question: questionText.trim(),
      options: finalOptions,
      correctOptionId: finalCorrectAnswer,
      correct_answer: finalCorrectAnswer,
      timeLimit: Number(timeLimit),
      points: Number(points)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-100 border-2 border-red-500 rounded-block text-red-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Question Type Switcher */}
      <div>
        <label className="block text-xs sm:text-sm font-display font-bold text-slate-900 mb-1.5">
          Tipe Soal
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange('multiple_choice')}
            className={`py-2 px-2 text-xs font-display font-bold border-2 border-slate-900 rounded-block transition-all ${
              type === 'multiple_choice'
                ? 'bg-indigo-600 text-white shadow-block'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Pilihan Ganda (A-D)
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('true_false')}
            className={`py-2 px-2 text-xs font-display font-bold border-2 border-slate-900 rounded-block transition-all ${
              type === 'true_false'
                ? 'bg-indigo-600 text-white shadow-block'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Benar / Salah
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('short_answer')}
            className={`py-2 px-2 text-xs font-display font-bold border-2 border-slate-900 rounded-block transition-all ${
              type === 'short_answer'
                ? 'bg-indigo-600 text-white shadow-block'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Ketik Isian Singkat
          </button>
        </div>
      </div>

      {/* Question Text */}
      <Input
        label="Teks Pertanyaan"
        placeholder="Contoh: Apa kepanjangan dari HTML?"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        required
      />

      {/* Answer Options */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs sm:text-sm font-display font-bold text-slate-900">
            {type === 'short_answer' ? 'Kunci Jawaban Isian Teks' : 'Pilihan Jawaban & Kunci'}
          </label>
          <span className="text-xs text-slate-500">
            {type === 'short_answer' ? 'Dicocokkan case-insensitive' : 'Centang opsi yang benar'}
          </span>
        </div>

        {type === 'multiple_choice' ? (
          <div className="space-y-2.5">
            {mcOptions.map((opt, idx) => {
              const symbols = ['▲ A', '◆ B', '● C', '■ D'];
              const isCorrect = correctOptionId === opt.id;
              return (
                <div key={opt.id} className="flex items-center gap-2">
                  <span className="w-12 py-2.5 text-center font-display font-bold text-xs bg-slate-200 border-2 border-slate-900 rounded-block shrink-0">
                    {symbols[idx]}
                  </span>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                    placeholder={`Jawaban pilihan ${opt.id.toUpperCase()}`}
                    className="flex-1 min-h-[42px] px-3 py-2 text-sm border-2 border-slate-900 rounded-block focus:outline-none focus:ring-2 focus:ring-amber-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setCorrectOptionId(opt.id)}
                    title="Jadikan Jawaban Benar"
                    className={`w-11 h-11 shrink-0 border-2 border-slate-900 rounded-block flex items-center justify-center font-bold transition-all ${
                      isCorrect
                        ? 'bg-emerald-500 text-slate-950 shadow-block'
                        : 'bg-white text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <Check className={`w-5 h-5 ${isCorrect ? 'stroke-[3]' : 'opacity-30'}`} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : type === 'true_false' ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCorrectOptionId('true')}
              className={`p-3.5 border-2 border-slate-900 rounded-block font-display font-black text-sm flex items-center justify-center gap-2 transition-all ${
                correctOptionId === 'true'
                  ? 'bg-emerald-500 text-slate-950 shadow-block'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Check className="w-5 h-5" />
              <span>True (Benar)</span>
            </button>
            <button
              type="button"
              onClick={() => setCorrectOptionId('false')}
              className={`p-3.5 border-2 border-slate-900 rounded-block font-display font-black text-sm flex items-center justify-center gap-2 transition-all ${
                correctOptionId === 'false'
                  ? 'bg-red-500 text-white shadow-block'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Check className="w-5 h-5" />
              <span>False (Salah)</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={shortAnswerText}
              onChange={(e) => {
                setShortAnswerText(e.target.value);
                setCorrectOptionId(e.target.value.trim());
              }}
              placeholder="Contoh: HyperText Markup Language"
              className="w-full min-h-[44px] px-3.5 py-2 text-sm font-bold border-2 border-slate-900 rounded-block focus:outline-none focus:ring-2 focus:ring-amber-400"
              required
            />
            <p className="text-xs text-slate-500 font-medium">
              💡 Jawaban siswa akan dicocokkan langsung dengan teks di atas secara otomatis (huruf kapital/kecil diabaikan).
            </p>
          </div>
        )}
      </div>

      {/* Settings Grid: Time Limit & Points */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-display font-bold text-slate-900 mb-1">
            Batas Waktu (Detik)
          </label>
          <select
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border-2 border-slate-900 rounded-block font-sans font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value={10}>10 Detik (Cepat)</option>
            <option value={15}>15 Detik</option>
            <option value={20}>20 Detik (Standar)</option>
            <option value={30}>30 Detik</option>
            <option value={60}>60 Detik (Panjang)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-display font-bold text-slate-900 mb-1">
            Poin Maksimal
          </label>
          <select
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border-2 border-slate-900 rounded-block font-sans font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value={50}>50 Poin</option>
            <option value={100}>100 Poin (Standar)</option>
            <option value={200}>200 Poin (Bonus)</option>
          </select>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-slate-200">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Batal
          </Button>
        )}
        <Button variant="primary" type="submit">
          Simpan Soal
        </Button>
      </div>
    </form>
  );
};
