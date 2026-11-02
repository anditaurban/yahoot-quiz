// Cloudflare Worker for Yahoot! Live Multiplayer Game API & SPA Asset Serving
// Strictly implements docs/04-API-SPEC.md for cross-device game sessions

// In-memory game store (persists across requests to the worker instance)
const games = new Map();
const gamesByCode = new Map();

// Helper to generate a unique 5-digit PIN
function generateGamePin() {
  for (let i = 0; i < 50; i++) {
    const pin = String(Math.floor(10000 + Math.random() * 90000));
    if (!gamesByCode.has(pin)) {
      return pin;
    }
  }
  return String(Math.floor(10000 + Math.random() * 90000));
}

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS,
  });
}

function errorResponse(message, code = 'API_ERROR', status = 400) {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: CORS_HEADERS,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Only route /api/games requests to Worker API logic
    if (url.pathname.startsWith('/api/games')) {
      try {
        return await handleGameApi(request, url);
      } catch (err) {
        return errorResponse(err.message || 'Internal Server Error', 'SERVER_ERROR', 500);
      }
    }

    // Fallback to static SPA assets (HTML, JS, CSS)
    return env.ASSETS.fetch(request);
  },
};

async function handleGameApi(request, url) {
  const method = request.method;
  const path = url.pathname.replace(/^\/api\/games/, '');

  // 1. POST /api/games -> Create game session
  if (method === 'POST' && (path === '' || path === '/')) {
    const body = await request.json().catch(() => ({}));
    const quiz = body.quiz || null;
    const quizId = body.quizId || quiz?.id;

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      return errorResponse('Kuis harus memiliki minimal 1 soal pertanyaan untuk membuat game.', 'INVALID_QUIZ');
    }

    const code = generateGamePin();
    const gameId = `game_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newGame = {
      id: gameId,
      code,
      quizId,
      quizTitle: quiz.title || 'Yahoot! Quiz',
      status: 'lobby', // 'lobby' | 'question' | 'feedback' | 'finished'
      currentQuestionIndex: 0,
      totalQuestions: quiz.questions.length,
      questions: quiz.questions,
      players: [],
      answers: {}, // { [questionIndex]: { [playerId]: { optionId, isCorrect, pointsEarned, submittedAt } } }
      createdAt: new Date().toISOString(),
      questionStartedAt: null,
    };

    games.set(gameId, newGame);
    gamesByCode.set(code, newGame);

    return jsonResponse({
      data: {
        id: newGame.id,
        code: newGame.code,
        status: newGame.status,
      },
    }, 201);
  }

  // 2. GET /api/games/:codeOrId -> Get game info
  const getGameMatch = path.match(/^\/([^/]+)$/);
  if (method === 'GET' && getGameMatch) {
    const param = getGameMatch[1].trim();
    const game = gamesByCode.get(param) || games.get(param);

    if (!game) {
      return errorResponse('Kode game tidak ditemukan. Coba periksa kembali.', 'GAME_NOT_FOUND', 404);
    }

    return jsonResponse({
      data: {
        id: game.id,
        code: game.code,
        status: game.status,
        quizTitle: game.quizTitle,
        totalQuestions: game.totalQuestions,
        currentQuestionIndex: game.currentQuestionIndex,
        players: game.players.map((p) => ({
          id: p.id,
          playerId: p.id,
          nickname: p.nickname,
          score: p.score || 0,
        })),
      },
    });
  }

  // 3. POST /api/games/:codeOrId/join -> Join game as student
  const joinMatch = path.match(/^\/([^/]+)\/join$/);
  if (method === 'POST' && joinMatch) {
    const param = joinMatch[1].trim();
    const game = gamesByCode.get(param) || games.get(param);

    if (!game) {
      return errorResponse('Kode game tidak ditemukan. Coba periksa kembali.', 'GAME_NOT_FOUND', 404);
    }

    if (game.status === 'finished') {
      return errorResponse('Sesi kuis ini sudah selesai.', 'GAME_FINISHED', 400);
    }

    const body = await request.json().catch(() => ({}));
    const cleanNick = (body.nickname || '').trim();

    if (!cleanNick) {
      return errorResponse('Nickname tidak boleh kosong.', 'INVALID_NICKNAME', 400);
    }

    // Check duplicate nickname
    const exists = game.players.some((p) => p.nickname.toLowerCase() === cleanNick.toLowerCase());
    if (exists) {
      return errorResponse(`Nickname "${cleanNick}" sudah digunakan di sesi ini. Gunakan nama lain.`, 'NICKNAME_TAKEN', 400);
    }

    const playerId = `player_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newPlayer = {
      id: playerId,
      playerId,
      nickname: cleanNick,
      score: 0,
      joinedAt: new Date().toISOString(),
    };

    game.players.push(newPlayer);

    return jsonResponse({
      data: {
        playerId: newPlayer.id,
        nickname: newPlayer.nickname,
        gameCode: game.code,
        gameId: game.id,
      },
    }, 201);
  }

  // 4. POST /api/games/:gameId/start -> Teacher starts game
  const startMatch = path.match(/^\/([^/]+)\/start$/);
  if (method === 'POST' && startMatch) {
    const gameId = startMatch[1].trim();
    const game = games.get(gameId) || gamesByCode.get(gameId);

    if (!game) {
      return errorResponse('Game tidak ditemukan.', 'GAME_NOT_FOUND', 404);
    }

    game.status = 'question';
    game.currentQuestionIndex = 0;
    game.questionStartedAt = Date.now();

    return jsonResponse({
      data: {
        status: 'question',
        questionIndex: 0,
      },
    });
  }

  // 5. GET /api/games/:gameId/current-question -> Fetch active question
  const curQMatch = path.match(/^\/([^/]+)\/current-question$/);
  if (method === 'GET' && curQMatch) {
    const gameId = curQMatch[1].trim();
    const game = games.get(gameId) || gamesByCode.get(gameId);

    if (!game) {
      return errorResponse('Game tidak ditemukan.', 'GAME_NOT_FOUND', 404);
    }

    const isTeacher = url.searchParams.get('isTeacher') === 'true';
    const qIndex = game.currentQuestionIndex || 0;

    if (qIndex >= game.questions.length) {
      return jsonResponse({
        data: {
          finished: true,
          status: 'finished',
          message: 'Semua pertanyaan telah selesai.',
        },
      });
    }

    const currentQ = game.questions[qIndex];
    const timeLimit = Number(currentQ.timeLimit) || 20;

    const responseData = {
      id: currentQ.id,
      index: qIndex,
      totalQuestions: game.questions.length,
      type: currentQ.type || 'multiple_choice',
      question: currentQ.question,
      options: (currentQ.options || []).map((o) => ({ id: o.id, text: o.text })),
      timeLimit,
      points: currentQ.points || 100,
      gameStatus: game.status,
      finished: false,
    };

    if (isTeacher) {
      responseData.correctOptionId = currentQ.correctOptionId || currentQ.correct_answer;
      responseData.correct_answer = currentQ.correct_answer || currentQ.correctOptionId;
    }

    return jsonResponse({ data: responseData });
  }

  // 6. POST /api/games/:gameId/answers -> Student submits answer
  const answerMatch = path.match(/^\/([^/]+)\/answers$/);
  if (method === 'POST' && answerMatch) {
    const gameId = answerMatch[1].trim();
    const game = games.get(gameId) || gamesByCode.get(gameId);

    if (!game) {
      return errorResponse('Game tidak ditemukan.', 'GAME_NOT_FOUND', 404);
    }

    const body = await request.json().catch(() => ({}));
    const { playerId, questionIndex, answer } = body;

    const qIdx = questionIndex !== undefined ? Number(questionIndex) : game.currentQuestionIndex;
    const currentQ = game.questions[qIdx];

    if (!currentQ) {
      return errorResponse('Pertanyaan tidak valid.', 'INVALID_QUESTION', 400);
    }

    game.answers[qIdx] = game.answers[qIdx] || {};

    // Check if player already answered this question
    if (game.answers[qIdx][playerId]) {
      return errorResponse('Anda sudah mengirim jawaban untuk soal ini.', 'ALREADY_ANSWERED', 400);
    }

    const qType = currentQ.type || 'multiple_choice';
    const rawAnswer = String(answer || '').trim();
    const expected = String(currentQ.correctOptionId || currentQ.correct_answer || '').trim();

    let isCorrect = false;
    if (qType === 'short_answer') {
      isCorrect = rawAnswer.toLowerCase() === expected.toLowerCase();
    } else {
      isCorrect = rawAnswer.toLowerCase() === expected.toLowerCase();
    }

    const timeLimit = Number(currentQ.timeLimit) || 20;
    const elapsedSeconds = Math.max(0, (Date.now() - (game.questionStartedAt || Date.now())) / 1000);

    // Kahoot-style speed points: up to 1000 points, minimum 500 points for correct answers
    let pointsEarned = 0;
    if (isCorrect) {
      const speedRatio = Math.max(0, Math.min(1, 1 - (elapsedSeconds / timeLimit) * 0.5));
      pointsEarned = Math.round(1000 * Math.max(0.5, speedRatio));
    }

    game.answers[qIdx][playerId] = {
      optionId: rawAnswer,
      isCorrect,
      pointsEarned,
      submittedAt: new Date().toISOString(),
    };

    const player = game.players.find((p) => p.id === playerId);
    if (player) {
      player.score = (player.score || 0) + pointsEarned;
    }

    return jsonResponse({
      data: {
        isCorrect,
        pointsEarned,
        totalScore: player?.score || 0,
      },
    });
  }

  // 7. POST /api/games/:gameId/next -> Teacher advances question
  const nextMatch = path.match(/^\/([^/]+)\/next$/);
  if (method === 'POST' && nextMatch) {
    const gameId = nextMatch[1].trim();
    const game = games.get(gameId) || gamesByCode.get(gameId);

    if (!game) {
      return errorResponse('Game tidak ditemukan.', 'GAME_NOT_FOUND', 404);
    }

    if (game.currentQuestionIndex + 1 < game.questions.length) {
      game.currentQuestionIndex += 1;
      game.status = 'question';
      game.questionStartedAt = Date.now();
    } else {
      game.status = 'finished';
    }

    return jsonResponse({
      data: {
        status: game.status,
        questionIndex: game.currentQuestionIndex,
      },
    });
  }

  // 8. POST /api/games/:gameId/status -> Toggle feedback status
  const statusMatch = path.match(/^\/([^/]+)\/status$/);
  if (method === 'POST' && statusMatch) {
    const gameId = statusMatch[1].trim();
    const game = games.get(gameId) || gamesByCode.get(gameId);

    if (!game) {
      return errorResponse('Game tidak ditemukan.', 'GAME_NOT_FOUND', 404);
    }

    const body = await request.json().catch(() => ({}));
    if (body.status) {
      game.status = body.status;
    }

    return jsonResponse({ data: { status: game.status } });
  }

  // 9. GET /api/games/:gameId/stats/:questionIndex -> Distribution of answers
  const statsMatch = path.match(/^\/([^/]+)\/stats\/([^/]+)$/);
  if (method === 'GET' && statsMatch) {
    const gameId = statsMatch[1].trim();
    const qIndex = Number(statsMatch[2]);
    const game = games.get(gameId) || gamesByCode.get(gameId);

    if (!game) {
      return errorResponse('Game tidak ditemukan.', 'GAME_NOT_FOUND', 404);
    }

    const answersForQ = game.answers[qIndex] || {};
    const optionCounts = { a: 0, b: 0, c: 0, d: 0, true: 0, false: 0 };

    Object.values(answersForQ).forEach((ans) => {
      const opt = String(ans.optionId).toLowerCase();
      optionCounts[opt] = (optionCounts[opt] || 0) + 1;
    });

    return jsonResponse({
      data: {
        totalAnswers: Object.keys(answersForQ).length,
        optionCounts,
      },
    });
  }

  // 10. GET /api/games/:gameId/results -> Final Leaderboard
  const resultsMatch = path.match(/^\/([^/]+)\/results$/);
  if (method === 'GET' && resultsMatch) {
    const gameId = resultsMatch[1].trim();
    const game = games.get(gameId) || gamesByCode.get(gameId);

    if (!game) {
      return errorResponse('Game tidak ditemukan.', 'GAME_NOT_FOUND', 404);
    }

    const sortedPlayers = [...game.players]
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map((p, idx) => ({
        playerId: p.id,
        nickname: p.nickname,
        score: p.score || 0,
        rank: idx + 1,
      }));

    return jsonResponse({
      data: {
        quizTitle: game.quizTitle,
        totalQuestions: game.totalQuestions,
        players: sortedPlayers,
      },
    });
  }

  // 11. POST /api/games/:gameId/demo-player -> Add bot student
  const demoMatch = path.match(/^\/([^/]+)\/demo-player$/);
  if (method === 'POST' && demoMatch) {
    const gameId = demoMatch[1].trim();
    const game = games.get(gameId) || gamesByCode.get(gameId);

    if (!game) {
      return errorResponse('Game tidak ditemukan.', 'GAME_NOT_FOUND', 404);
    }

    const body = await request.json().catch(() => ({}));
    const nickname = body.nickname || `Murid Simulasi #${game.players.length + 1}`;
    const newPlayer = {
      id: `bot_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      nickname,
      score: 0,
    };

    game.players.push(newPlayer);
    return jsonResponse({ data: newPlayer });
  }

  return errorResponse('Endpoint API tidak ditemukan', 'NOT_FOUND', 404);
}
