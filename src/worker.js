// Cloudflare Worker for Yahoot! Live Multiplayer Game API & SPA Asset Serving
// Fully synchronized via Katib Central LMS Storage (Quiz Record #9) to guarantee
// cross-device, cross-isolate persistence for all students and teachers.

const KATIB_BASE = 'https://ngodingai-lms-api.up.railway.app';
const KATIB_TOKEN = 'DpacnJf3uEQeM7HN';
const KATIB_RECORD_ID = 9;

// In-memory cache for ultra-fast same-isolate responses
const games = new Map();
const gamesByCode = new Map();

// Fetch all active games from Katib centralized database
async function fetchCentralGames() {
  try {
    const res = await fetch(`${KATIB_BASE}/detail/yahoot_quiz/${KATIB_RECORD_ID}?_t=${Date.now()}`, {
      headers: {
        'Authorization': `Bearer ${KATIB_TOKEN}`,
        'Accept': 'application/json',
      },
    });
    if (!res.ok) return {};
    const json = await res.json();
    const desc = json.data?.quiz?.description || json.quiz?.description;
    if (!desc) return {};
    const parsed = JSON.parse(desc);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    console.warn('Central fetch error:', err.message);
    return {};
  }
}

// Persist active games to Katib centralized database
async function saveCentralGames(gamesObj) {
  try {
    // Keep only games created in the last 24 hours to prevent bloated database records
    const now = Date.now();
    const pruned = {};
    for (const [key, g] of Object.entries(gamesObj)) {
      const createdTime = g.createdAt ? new Date(g.createdAt).getTime() : now;
      if (now - createdTime < 24 * 60 * 60 * 1000) {
        pruned[key] = g;
      }
    }

    await fetch(`${KATIB_BASE}/update/yahoot_quiz/${KATIB_RECORD_ID}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${KATIB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        owner_id: 4409,
        title: '__YAHOOT_ACTIVE_GAMES__',
        description: JSON.stringify(pruned),
        passing_score: 75,
        time_limit: 30,
        status: 'draft',
      }),
    });
  } catch (err) {
    console.warn('Central save error:', err.message);
  }
}

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Always fetch freshest state from centralized storage so every isolate and device
// sees newly joined players and status changes immediately without reload
async function getGameSession(codeOrId) {
  const clean = String(codeOrId || '').trim();
  if (!clean) return null;

  // Always refresh from central Katib store, but NEVER overwrite newer local state
  const central = await fetchCentralGames();
  for (const [id, g] of Object.entries(central)) {
    const local = games.get(id);
    const shouldUpdate =
      !local ||
      (local.updatedAt && g.updatedAt
        ? g.updatedAt >= local.updatedAt
        : !local.updatedAt);

    if (shouldUpdate) {
      games.set(id, g);
      if (g.code) {
        gamesByCode.set(String(g.code).trim(), g);
      }
    }
  }

  return gamesByCode.get(clean) || games.get(clean) || null;
}

// Persist single game to both local memory and centralized storage
async function persistGameSession(game) {
  if (!game || !game.id) return;
  game.updatedAt = Date.now();

  games.set(game.id, game);
  if (game.code) {
    gamesByCode.set(String(game.code).trim(), game);
  }

  // Update central store
  const central = await fetchCentralGames();
  const existingCentral = central[game.id];
  if (!existingCentral || !existingCentral.updatedAt || game.updatedAt >= existingCentral.updatedAt) {
    central[game.id] = game;
  }
  await saveCentralGames(central);
}

// Helper to generate a unique 5-digit PIN
async function generateUniquePin() {
  const central = await fetchCentralGames();
  for (let i = 0; i < 50; i++) {
    const pin = String(Math.floor(10000 + Math.random() * 90000));
    const inCentral = Object.values(central).some(g => String(g.code) === pin);
    if (!gamesByCode.has(pin) && !inCentral) {
      return pin;
    }
  }
  return String(Math.floor(10000 + Math.random() * 90000));
}

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

    // Route /api/games and /games requests: Try Native LMS API Backend first, fallback to worker logic
    if (url.pathname.startsWith('/api/games') || url.pathname.startsWith('/games')) {
      try {
        const targetPath = url.pathname.replace(/^\/api/, '');
        const backendUrl = `${KATIB_BASE}${targetPath}${url.search}`;
        const clonedReq = request.clone();
        const fwdRes = await fetch(backendUrl, {
          method: request.method,
          headers: {
            'Authorization': `Bearer ${KATIB_TOKEN}`,
            'Content-Type': request.headers.get('Content-Type') || 'application/json',
            'Accept': 'application/json',
          },
          body: ['POST', 'PUT', 'PATCH'].includes(request.method) ? await clonedReq.text() : undefined,
        });

        if (fwdRes.ok) {
          const resText = await fwdRes.text();
          return new Response(resText, {
            status: fwdRes.status,
            headers: {
              ...CORS_HEADERS,
              'Content-Type': 'application/json',
            },
          });
        }
      } catch (err) {
        // Fallback to Worker API logic if remote backend 404 or network hiccup
      }

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

  // 0. GET /api/games/history -> List past game sessions for teacher history & recap
  if (method === 'GET' && (path === '/history' || path === '/history/')) {
    const gamesObj = await getCentralGames();
    const list = Object.values(gamesObj).map((g) => ({
      id: g.id,
      gameId: g.id,
      pinCode: g.code,
      quizId: g.quizId,
      quizTitle: g.quizTitle || 'Yahoot! Quiz',
      status: g.status,
      totalQuestions: g.totalQuestions || (g.questions || []).length || 0,
      totalPlayers: (g.players || []).length,
      createdAt: g.createdAt || new Date().toISOString(),
      updatedAt: g.updatedAt || Date.now(),
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return jsonResponse({ data: list });
  }

  // 1. POST /api/games -> Create game session
  if (method === 'POST' && (path === '' || path === '/')) {
    const body = await request.json().catch(() => ({}));
    const quiz = body.quiz || null;
    const quizId = body.quizId || quiz?.id;

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      return errorResponse('Kuis harus memiliki minimal 1 butir soal untuk membuat sesi permainan.', 'INVALID_QUIZ');
    }

    const code = await generateUniquePin();
    const gameId = `game_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newGame = {
      id: gameId,
      code,
      quizId,
      quizTitle: quiz.title || 'Yahoot! Quiz',
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
      answers: {},
      createdAt: new Date().toISOString(),
      updatedAt: Date.now(),
      questionStartedAt: null,
    };

    await persistGameSession(newGame);

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
    const game = await getGameSession(param);

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
        players: (game.players || []).map((p) => ({
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
    const game = await getGameSession(param);

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

    // Check duplicate nickname in this session
    const exists = (game.players || []).some(
      (p) => p.nickname.toLowerCase() === cleanNick.toLowerCase()
    );
    if (exists) {
      return errorResponse(
        `Nickname "${cleanNick}" sudah digunakan di sesi ini. Silakan gunakan nama lain.`,
        'NICKNAME_TAKEN',
        400
      );
    }

    const playerId = `player_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newPlayer = {
      id: playerId,
      playerId,
      nickname: cleanNick,
      score: 0,
      joinedAt: new Date().toISOString(),
    };

    game.players = game.players || [];
    game.players.push(newPlayer);

    await persistGameSession(game);

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
    const game = await getGameSession(gameId);

    if (!game) {
      return errorResponse('Game tidak ditemukan.', 'GAME_NOT_FOUND', 404);
    }

    game.status = 'question';
    game.currentQuestionIndex = 0;
    game.questionStartedAt = Date.now();

    await persistGameSession(game);

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
    const game = await getGameSession(gameId);

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
    if (!currentQ) {
      return jsonResponse({
        data: {
          finished: true,
          status: 'finished',
          message: 'Semua pertanyaan telah selesai.',
        },
      });
    }

    const timeLimit = Number(currentQ.timeLimit) || 20;

    const responseData = {
      id: currentQ.id || `q_${qIndex}`,
      index: qIndex,
      totalQuestions: game.questions.length,
      type: currentQ.type || 'multiple_choice',
      question: currentQ.question || currentQ.question_text || '',
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
    const game = await getGameSession(gameId);

    if (!game) {
      return errorResponse('Game tidak ditemukan.', 'GAME_NOT_FOUND', 404);
    }

    const body = await request.json().catch(() => ({}));
    const { playerId, questionIndex, questionId, answer, optionId, responseTimeSeconds } = body;

    let qIdx = game.currentQuestionIndex || 0;
    if (questionId !== undefined) {
      const foundIdx = (game.questions || []).findIndex(
        (q) => String(q.id) === String(questionId) || String(q.question_id) === String(questionId)
      );
      if (foundIdx !== -1) {
        qIdx = foundIdx;
      }
    } else if (questionIndex !== undefined) {
      qIdx = Number(questionIndex);
    }

    const currentQ = (game.questions || [])[qIdx];
    if (!currentQ) {
      return errorResponse('Pertanyaan tidak valid.', 'INVALID_QUESTION', 400);
    }

    game.answers = game.answers || {};
    game.answers[qIdx] = game.answers[qIdx] || {};

    const rawAnswer = String(optionId !== undefined ? optionId : (answer !== undefined ? answer : '')).trim();

    if (game.answers[qIdx][playerId]) {
      const existing = game.answers[qIdx][playerId];
      const p = (game.players || []).find((x) => x.id === playerId || x.playerId === playerId);
      return jsonResponse({
        data: {
          accepted: false,
          alreadyAnswered: true,
          correct: existing.isCorrect,
          isCorrect: existing.isCorrect,
          points: existing.pointsEarned,
          pointsEarned: existing.pointsEarned,
          totalScore: p?.score || 0,
          streak: p?.streak || 0,
        },
      });
    }

    const expected = String(currentQ.correctOptionId || currentQ.correct_answer || '').trim();
    const isCorrect = rawAnswer.toLowerCase() === expected.toLowerCase();

    const timeLimit = Number(currentQ.timeLimit) || 20;
    const elapsedSeconds = Number(responseTimeSeconds) || Math.max(0, (Date.now() - (game.questionStartedAt || Date.now())) / 1000);

    let pointsEarned = 0;
    if (isCorrect) {
      const speedRatio = Math.max(0, Math.min(1, 1 - (elapsedSeconds / (timeLimit * 2))));
      pointsEarned = Math.round(1000 * Math.max(0.5, speedRatio));
    }

    game.answers[qIdx][playerId] = {
      optionId: rawAnswer,
      isCorrect,
      pointsEarned,
      submittedAt: new Date().toISOString(),
    };

    const player = (game.players || []).find((p) => p.id === playerId || p.playerId === playerId);
    if (player) {
      player.score = (player.score || 0) + pointsEarned;
      player.streak = isCorrect ? (player.streak || 0) + 1 : 0;
    }

    // Competitive mode: auto-reveal when ALL registered players have submitted
    const totalAnswered = Object.keys(game.answers[qIdx] || {}).length;
    const totalPlayers = (game.players || []).length;
    if (totalPlayers > 0 && totalAnswered > 0 && totalAnswered >= totalPlayers && qIdx === game.currentQuestionIndex) {
      game.status = 'feedback';
    }

    await persistGameSession(game);

    return jsonResponse({
      data: {
        accepted: true,
        correct: isCorrect,
        isCorrect,
        points: pointsEarned,
        pointsEarned,
        totalScore: player?.score || 0,
        streak: player?.streak || 0,
      },
    });
  }

  // 7. POST /api/games/:gameId/next -> Teacher advances question
  const nextMatch = path.match(/^\/([^/]+)\/next$/);
  if (method === 'POST' && nextMatch) {
    const gameId = nextMatch[1].trim();
    const game = await getGameSession(gameId);

    if (!game) {
      return errorResponse('Game tidak ditemukan.', 'GAME_NOT_FOUND', 404);
    }

    if (game.currentQuestionIndex + 1 < game.questions.length) {
      game.currentQuestionIndex += 1;
      game.status = 'question';
      game.questionStartedAt = Date.now();
      game.updatedAt = Date.now();
      game.answers = game.answers || {};
      game.answers[game.currentQuestionIndex] = game.answers[game.currentQuestionIndex] || {};
    } else {
      game.status = 'finished';
      game.updatedAt = Date.now();
    }

    await persistGameSession(game);

    const nextQ = (game.questions || [])[game.currentQuestionIndex];
    return jsonResponse({
      data: {
        status: game.status,
        questionIndex: game.currentQuestionIndex,
        finished: game.status === 'finished',
        question: (game.status !== 'finished' && nextQ) ? {
          id: nextQ.id || `q_${game.currentQuestionIndex}`,
          index: game.currentQuestionIndex,
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
      },
    });
  }

  // 8. POST /api/games/:gameId/status -> Toggle feedback status
  const statusMatch = path.match(/^\/([^/]+)\/status$/);
  if (method === 'POST' && statusMatch) {
    const gameId = statusMatch[1].trim();
    const game = await getGameSession(gameId);

    if (!game) {
      return errorResponse('Game tidak ditemukan.', 'GAME_NOT_FOUND', 404);
    }

    const body = await request.json().catch(() => ({}));
    if (body.status) {
      game.status = body.status;
      await persistGameSession(game);
    }

    return jsonResponse({ data: { status: game.status } });
  }

  // 9. GET /api/games/:gameId/stats/:questionIndex -> Distribution of answers
  const statsMatch = path.match(/^\/([^/]+)\/stats\/([^/]+)$/);
  if (method === 'GET' && statsMatch) {
    const gameId = statsMatch[1].trim();
    const qIndex = Number(statsMatch[2]);
    const game = await getGameSession(gameId);

    if (!game) {
      return errorResponse('Game tidak ditemukan.', 'GAME_NOT_FOUND', 404);
    }

    const answersForQ = (game.answers && game.answers[qIndex]) || {};
    const optionCounts = { a: 0, b: 0, c: 0, d: 0, true: 0, false: 0 };
    let totalCount = 0;

    Object.values(answersForQ).forEach((ans) => {
      const opt = String(ans.optionId !== undefined ? ans.optionId : '').trim();
      if (opt) {
        totalCount += 1;
        optionCounts[opt] = (optionCounts[opt] || 0) + 1;
        const lower = opt.toLowerCase();
        if (lower !== opt) {
          optionCounts[lower] = (optionCounts[lower] || 0) + 1;
        }
      }
    });

    return jsonResponse({
      data: {
        totalAnswers: totalCount,
        optionCounts,
      },
    });
  }

  // 10. GET /api/games/:gameId/results -> Final Leaderboard
  const resultsMatch = path.match(/^\/([^/]+)\/results$/);
  if (method === 'GET' && resultsMatch) {
    const gameId = resultsMatch[1].trim();
    const game = await getGameSession(gameId);

    if (!game) {
      return errorResponse('Game tidak ditemukan.', 'GAME_NOT_FOUND', 404);
    }

    const sortedPlayers = [...(game.players || [])]
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map((p, idx) => {
        const pId = p.id || p.playerId;
        const playerAnswers = [];
        (game.questions || []).forEach((q, qIdx) => {
          const ans = game.answers && game.answers[qIdx] && game.answers[qIdx][pId];
          if (ans) {
            playerAnswers.push({
              questionIndex: qIdx,
              questionId: q.id || `q_${qIdx}`,
              optionId: ans.optionId,
              isCorrect: Boolean(ans.isCorrect),
              pointsEarned: Number(ans.pointsEarned) || 0,
              responseTimeSeconds: Number(ans.responseTimeSeconds) || 0,
              submittedAt: ans.submittedAt,
            });
          }
        });
        const totalCorrect = playerAnswers.filter((a) => a.isCorrect).length;
        return {
          playerId: pId,
          id: pId,
          nickname: p.nickname,
          score: p.score || 0,
          streak: p.streak || 0,
          rank: idx + 1,
          totalCorrect,
          totalAnswered: playerAnswers.length,
          answers: playerAnswers,
        };
      });

    const questionsSummary = (game.questions || []).map((q, idx) => ({
      index: idx,
      id: q.id || `q_${idx}`,
      question: q.question || q.question_text || '',
      type: q.type || 'multiple_choice',
      correctAnswer: q.correct_answer || q.correctOptionId || '',
      points: Number(q.points) || 100,
      timeLimit: Number(q.timeLimit) || 20,
    }));

    return jsonResponse({
      data: {
        gameId: game.id,
        pinCode: game.code,
        quizTitle: game.quizTitle,
        totalQuestions: game.totalQuestions,
        totalPlayers: sortedPlayers.length,
        questions: questionsSummary,
        players: sortedPlayers,
      },
    });
  }

  // 11. POST /api/games/:gameId/demo-player -> Add bot student
  const demoMatch = path.match(/^\/([^/]+)\/demo-player$/);
  if (method === 'POST' && demoMatch) {
    const gameId = demoMatch[1].trim();
    const game = await getGameSession(gameId);

    if (!game) {
      return errorResponse('Game tidak ditemukan.', 'GAME_NOT_FOUND', 404);
    }

    const body = await request.json().catch(() => ({}));
    const nickname = body.nickname || `Murid Simulasi #${(game.players || []).length + 1}`;
    const newPlayer = {
      id: `bot_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      playerId: `bot_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      nickname,
      score: 0,
    };

    game.players = game.players || [];
    game.players.push(newPlayer);
    await persistGameSession(game);

    return jsonResponse({ data: newPlayer });
  }

  return errorResponse('Endpoint API tidak ditemukan', 'NOT_FOUND', 404);
}
