// Isolated Mock Data and State Management for Yahoot!
// Strictly follows docs/04-API-SPEC.md

const STORAGE_KEY_QUIZZES = 'yahoot_mock_quizzes';
const STORAGE_KEY_GAMES = 'yahoot_mock_games';

import INITIAL_QUIZZES from './initial_quizzes.json';

class MockStore {
  constructor() {
    this.initStore();
  }

  initStore() {
    try {
      const rawQuizzes = localStorage.getItem(STORAGE_KEY_QUIZZES);
      let needReset = false;
      if (!rawQuizzes) {
        needReset = true;
      } else {
        const parsed = JSON.parse(rawQuizzes);
        if (!Array.isArray(parsed) || parsed.length === 0 || parsed.some(q => q.title === 'JavaScript Fundamental')) {
          needReset = true;
        }
      }
      if (needReset) {
        localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(INITIAL_QUIZZES));
      }
    } catch {
      // ignore localStorage errors
    }

    try {
      const rawGames = localStorage.getItem(STORAGE_KEY_GAMES);
      if (!rawGames) {
        localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify({}));
      }
    } catch {
      // ignore
    }
  }

  getQuizzes() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
      if (Array.isArray(data) && data.length > 0) {
        return data.map(q => ({
          id: q.id,
          quiz_id: q.id,
          owner_id: q.owner_id || 4409,
          course_id: q.course_id ?? null,
          course_title: q.course_title ?? null,
          title: q.title,
          description: q.description || '',
          passing_score: q.passing_score ?? 75,
          time_limit: q.time_limit ?? 30,
          status: q.status || 'publish',
          questionCount: q.questions ? q.questions.length : (q.questionCount || 0),
          total_questions: q.questions ? q.questions.length : (q.questionCount || 0),
          createdAt: q.createdAt,
          questions: q.questions || [],
        }));
      }
    } catch {
      // fallback
    }
    return INITIAL_QUIZZES;
  }

  getQuiz(id) {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
      const quiz = data.find(q => String(q.id) === String(id) || String(q.quiz_id) === String(id));
      if (quiz) {
        return quiz;
      }
    } catch {
      // fallback
    }
    return INITIAL_QUIZZES.find(q => String(q.id) === String(id) || String(q.quiz_id) === String(id)) || null;
  }

  createQuiz({ title, description }) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
    const newId = Date.now();
    const newQuiz = {
      id: newId,
      title: title.trim(),
      description: (description || '').trim(),
      questionCount: 0,
      createdAt: new Date().toISOString(),
      questions: []
    };
    data.unshift(newQuiz);
    localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(data));
    return newQuiz;
  }

  updateQuiz(id, { title, description, questions }) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
    const index = data.findIndex(q => String(q.id) === String(id));
    if (index === -1) return null;

    if (title !== undefined) data[index].title = title.trim();
    if (description !== undefined) data[index].description = description.trim();
    if (questions !== undefined) {
      data[index].questions = questions;
      data[index].questionCount = questions.length;
    }
    localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(data));
    return data[index];
  }

  deleteQuiz(id) {
    let data = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
    data = data.filter(q => String(q.id) !== String(id));
    localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(data));
    return true;
  }

  registerOrUpdateQuiz(quiz) {
    if (!quiz || !quiz.id) return;
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
    const index = data.findIndex(q => String(q.id) === String(quiz.id));
    if (index >= 0) {
      data[index] = { ...data[index], ...quiz };
    } else {
      data.unshift(quiz);
    }
    localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(data));
  }

  createQuestion(quizId, questionData) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
    const quiz = data.find(q => String(q.id) === String(quizId));
    if (!quiz) return null;

    const newQuestion = {
      id: `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type: questionData.type,
      question: questionData.question,
      options: questionData.options,
      correctOptionId: questionData.correctOptionId,
      timeLimit: Number(questionData.timeLimit) || 20,
      points: Number(questionData.points) || 100
    };

    quiz.questions = quiz.questions || [];
    quiz.questions.push(newQuestion);
    quiz.questionCount = quiz.questions.length;

    localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(data));
    return newQuestion;
  }

  updateQuestion(quizId, questionId, questionData) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
    const quiz = data.find(q => String(q.id) === String(quizId));
    if (!quiz || !quiz.questions) return null;

    const qIndex = quiz.questions.findIndex(q => String(q.id) === String(questionId));
    if (qIndex === -1) return null;

    quiz.questions[qIndex] = {
      ...quiz.questions[qIndex],
      ...questionData,
      id: questionId
    };

    localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(data));
    return quiz.questions[qIndex];
  }

  deleteQuestion(quizId, questionId) {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY_QUIZZES) || '[]');
    const quiz = data.find(q => String(q.id) === String(quizId));
    if (!quiz || !quiz.questions) return false;

    quiz.questions = quiz.questions.filter(q => String(q.id) !== String(questionId));
    quiz.questionCount = quiz.questions.length;

    localStorage.setItem(STORAGE_KEY_QUIZZES, JSON.stringify(data));
    return true;
  }

  // GAME SESSIONS
  getGames() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_GAMES) || '{}');
  }

  saveGames(games) {
    localStorage.setItem(STORAGE_KEY_GAMES, JSON.stringify(games));
  }

  createGame(quizId, quizData = null) {
    if (quizData && quizData.id) {
      this.registerOrUpdateQuiz(quizData);
    }
    const quiz = quizData || this.getQuiz(quizId);
    if (!quiz) {
      throw new Error("Kuis tidak ditemukan untuk memulai sesi game.");
    }
    if (!quiz.questions || quiz.questions.length === 0) {
      throw new Error("Kuis belum memiliki soal. Tambahkan minimal satu soal sebelum memulai.");
    }

    // Generate unique 5-digit PIN
    const code = String(Math.floor(10000 + Math.random() * 90000));
    const gameId = `game_${Date.now()}`;

    const games = this.getGames();
    const newGame = {
      id: gameId,
      code,
      quizId: quiz.id,
      quizTitle: quiz.title,
      status: 'lobby', // 'lobby' | 'question' | 'feedback' | 'finished'
      currentQuestionIndex: 0,
      totalQuestions: quiz.questions.length,
      questions: (quiz.questions || []).map((q, idx) => ({
        ...q,
        id: q.id !== undefined && q.id !== null ? String(q.id) : (q.question_id ? String(q.question_id) : `q_${idx + 1}`),
        question: q.question || q.question_text || '',
        timeLimit: Number(q.timeLimit !== undefined ? q.timeLimit : (q.time_limit !== undefined && Number(q.time_limit) <= 300 ? q.time_limit : 20)) || 20,
      })),
      players: [],
      answers: {}, // { [questionIndex]: { [playerId]: { optionId, isCorrect, pointsEarned, submittedAt } } }
      createdAt: new Date().toISOString()
    };

    games[gameId] = newGame;
    this.saveGames(games);

    return {
      id: newGame.id,
      code: newGame.code,
      status: newGame.status
    };
  }

  findGameByCode(code) {
    const games = this.getGames();
    for (const id in games) {
      if (games[id].code === String(code).trim()) {
        return games[id];
      }
    }
    return null;
  }

  getGameById(gameId) {
    const games = this.getGames();
    return games[gameId] || null;
  }

  getGameInfoByCode(code) {
    const game = this.findGameByCode(code);
    if (!game) return null;
    return {
      id: game.id,
      code: game.code,
      status: game.status,
      quizTitle: game.quizTitle,
      totalQuestions: game.totalQuestions,
      currentQuestionIndex: game.currentQuestionIndex,
      players: game.players.map(p => ({
        id: p.id,
        nickname: p.nickname
      }))
    };
  }

  joinGame(code, nickname) {
    const games = this.getGames();
    let targetGame = null;
    for (const id in games) {
      if (games[id].code === String(code).trim()) {
        targetGame = games[id];
        break;
      }
    }

    if (!targetGame) {
      return { error: { code: 'GAME_NOT_FOUND', message: 'Kode game tidak ditemukan. Coba periksa kembali.' } };
    }

    if (targetGame.status === 'finished') {
      return { error: { code: 'GAME_FINISHED', message: 'Sesi kuis ini sudah selesai.' } };
    }

    const cleanNickname = nickname.trim();
    if (!cleanNickname) {
      return { error: { code: 'INVALID_NICKNAME', message: 'Nickname tidak boleh kosong.' } };
    }

    // Check if nickname already taken in this session
    const existing = targetGame.players.find(p => p.nickname.toLowerCase() === cleanNickname.toLowerCase());
    let playerId = existing ? existing.id : `player_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    if (!existing) {
      targetGame.players.push({
        id: playerId,
        nickname: cleanNickname,
        score: 0,
        streak: 0,
        joinedAt: new Date().toISOString()
      });
      this.saveGames(games);
    }

    return {
      data: {
        playerId,
        nickname: cleanNickname,
        gameCode: targetGame.code,
        gameId: targetGame.id
      }
    };
  }

  startGame(gameId) {
    const games = this.getGames();
    const game = games[gameId];
    if (!game) {
      return { error: { code: 'GAME_NOT_FOUND', message: 'Sesi game tidak ditemukan.' } };
    }

    game.status = 'question';
    game.currentQuestionIndex = 0;
    this.saveGames(games);

    return {
      data: {
        status: 'question',
        questionIndex: 0
      }
    };
  }

  nextQuestion(gameId) {
    const games = this.getGames();
    const game = games[gameId];
    if (!game) {
      return { error: { code: 'GAME_NOT_FOUND', message: 'Sesi game tidak ditemukan.' } };
    }

    const nextIndex = game.currentQuestionIndex + 1;
    if (nextIndex >= game.totalQuestions) {
      game.status = 'finished';
      this.saveGames(games);
      return {
        data: {
          status: 'finished',
          questionIndex: game.currentQuestionIndex,
          finished: true,
          question: null
        }
      };
    }

    game.currentQuestionIndex = nextIndex;
    game.status = 'question';
    this.saveGames(games);

    const nextQ = game.questions[nextIndex];
    return {
      data: {
        status: 'question',
        questionIndex: nextIndex,
        finished: false,
        question: nextQ ? {
          id: nextQ.id || `q_${nextIndex}`,
          index: nextIndex,
          totalQuestions: game.questions.length,
          type: nextQ.type || 'multiple_choice',
          question: nextQ.question || nextQ.question_text || '',
          options: (nextQ.options || []).map((o) => ({ id: o.id, text: o.text })),
          timeLimit: Number(nextQ.timeLimit) || 20,
          points: nextQ.points || 100,
          correctOptionId: nextQ.correctOptionId || nextQ.correct_answer,
          correct_answer: nextQ.correct_answer || nextQ.correctOptionId,
          gameStatus: game.status,
          finished: false,
        } : null
      }
    };
  }

  setQuestionStatus(gameId, status) {
    const games = this.getGames();
    const game = games[gameId];
    if (!game) return null;
    game.status = status; // e.g. 'feedback'
    this.saveGames(games);
    return game;
  }

  getCurrentQuestion(gameId, isTeacher = false) {
    const game = this.getGameById(gameId);
    if (!game) {
      return { error: { code: 'GAME_NOT_FOUND', message: 'Sesi game tidak ditemukan.' } };
    }

    if (game.status === 'finished') {
      return {
        data: {
          finished: true,
          status: 'finished'
        }
      };
    }

    const q = game.questions[game.currentQuestionIndex];
    if (!q) {
      return { error: { code: 'NO_ACTIVE_QUESTION', message: 'Tidak ada soal aktif.' } };
    }

    // Question for student: MUST NOT expose correctOptionId!
    const questionPayload = {
      id: q.id,
      index: game.currentQuestionIndex,
      totalQuestions: game.totalQuestions,
      type: q.type,
      question: q.question,
      options: q.options,
      timeLimit: q.timeLimit,
      gameStatus: game.status
    };

    if (isTeacher) {
      questionPayload.correctOptionId = q.correctOptionId;
      questionPayload.points = q.points;
    }

    return { data: questionPayload };
  }

  submitAnswer(gameId, { playerId, questionId, optionId, responseTimeSeconds = 0 }) {
    const games = this.getGames();
    const game = games[gameId];
    if (!game) {
      return { error: { code: 'GAME_NOT_FOUND', message: 'Sesi game tidak ditemukan.' } };
    }

    const currentQ = game.questions[game.currentQuestionIndex];
    if (!currentQ || currentQ.id !== questionId) {
      return { error: { code: 'QUESTION_MISMATCH', message: 'Soal sudah berganti atau kedaluwarsa.' } };
    }

    game.answers = game.answers || {};
    game.answers[game.currentQuestionIndex] = game.answers[game.currentQuestionIndex] || {};

    const existingAnswer = game.answers[game.currentQuestionIndex][playerId];
    if (existingAnswer) {
      return {
        data: {
          accepted: false,
          alreadyAnswered: true,
          correct: existingAnswer.isCorrect,
          points: existingAnswer.pointsEarned
        }
      };
    }

    const cleanSubmitted = String(optionId || '').trim().toLowerCase();
    const cleanExpected = String(currentQ.correctOptionId || currentQ.correct_answer || '').trim().toLowerCase();
    const isCorrect = cleanSubmitted === cleanExpected;
    let points = 0;
    if (isCorrect) {
      // Speed bonus: max points if fast, min 50% points if near time limit
      const timeLimit = currentQ.timeLimit || 20;
      const speedFactor = Math.max(0.5, 1 - (responseTimeSeconds / (timeLimit * 2)));
      points = Math.round((currentQ.points || 100) * speedFactor);
    }

    // Update player
    const player = game.players.find(p => p.id === playerId);
    if (player) {
      player.score = (player.score || 0) + points;
      if (isCorrect) {
        player.streak = (player.streak || 0) + 1;
      } else {
        player.streak = 0;
      }
    }

    game.answers[game.currentQuestionIndex][playerId] = {
      optionId,
      isCorrect,
      pointsEarned: points,
      submittedAt: new Date().toISOString()
    };

    this.saveGames(games);

    return {
      data: {
        accepted: true,
        correct: isCorrect,
        points: points
      }
    };
  }

  getGameAnswersStats(gameId, questionIndex) {
    const game = this.getGameById(gameId);
    if (!game || !game.answers || !game.answers[questionIndex]) {
      return { totalAnswers: 0, optionCounts: {} };
    }

    const answers = game.answers[questionIndex];
    const optionCounts = {};
    let total = 0;

    for (const pId in answers) {
      const opt = answers[pId].optionId;
      optionCounts[opt] = (optionCounts[opt] || 0) + 1;
      total++;
    }

    return {
      totalAnswers: total,
      optionCounts
    };
  }

  getResults(gameId) {
    const game = this.getGameById(gameId);
    if (!game) {
      return { error: { code: 'GAME_NOT_FOUND', message: 'Sesi game tidak ditemukan.' } };
    }

    // Sort players by score descending
    const sorted = [...game.players].sort((a, b) => (b.score || 0) - (a.score || 0));
    const rankedPlayers = sorted.map((p, idx) => ({
      playerId: p.id,
      nickname: p.nickname,
      score: p.score || 0,
      streak: p.streak || 0,
      rank: idx + 1
    }));

    return {
      data: {
        quizTitle: game.quizTitle,
        totalQuestions: game.totalQuestions,
        players: rankedPlayers
      }
    };
  }

  // Helper for demo simulation: add a mock bot player to test lobby
  addDemoPlayer(gameId, nickname) {
    const games = this.getGames();
    const game = games[gameId];
    if (!game) return null;

    const playerId = `bot_${Date.now()}_${Math.floor(Math.random() * 100)}`;
    const newPlayer = {
      id: playerId,
      nickname,
      score: Math.floor(Math.random() * 500) + 200,
      streak: 1,
      joinedAt: new Date().toISOString()
    };
    game.players.push(newPlayer);
    this.saveGames(games);
    return newPlayer;
  }
}

export const mockStore = new MockStore();
