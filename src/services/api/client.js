// API Client for Yahoot! & NgodingAI LMS API
// Fully integrates endpoints from docs/QUIZ_INTEGRATION_DOCS.md and docs/04-API-SPEC.md

import { mockStore } from '../../mocks/mockStore';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://ngodingai-lms-api.up.railway.app').replace(/\/$/, '');
const AUTH_TOKEN = import.meta.env.VITE_API_TOKEN || 'DpacnJf3uEQeM7HN';
const MOCK_DELAY = 100;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class ApiError extends Error {
  constructor(message, code = 'API_ERROR', status = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

// Client for NgodingAI LMS API (Course Quiz CRUD, Questions, Sections, Results)
export const lmsClient = {
  getBaseUrl() {
    return BASE_URL;
  },

  getToken() {
    return AUTH_TOKEN;
  },

  getHeaders(customHeaders = {}) {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      ...customHeaders,
    };
  },

  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = this.getHeaders(options.headers);

    try {
      const response = await fetch(url, {
        cache: 'no-store',
        ...options,
        headers,
      });

      let json;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        json = await response.json();
      } else {
        const text = await response.text();
        try {
          json = JSON.parse(text);
        } catch {
          json = { message: text || response.statusText };
        }
      }

      if (!response.ok) {
        const errorMsg = json.message || json.error?.message || `HTTP ${response.status}: Permintaan gagal`;
        const errorCode = json.code || json.error?.code || `HTTP_${response.status}`;
        throw new ApiError(errorMsg, errorCode, response.status);
      }

      return json;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        err.message || 'Gagal terhubung ke server. Pastikan koneksi internet stabil.',
        'NETWORK_ERROR',
        0
      );
    }
  },

  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  },

  async post(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    });
  },

  async put(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    });
  },

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  },
};

// Client for Yahoot game sessions (Lobby PIN & Live Multiplayer)
// Seamlessly connects to Native LMS API Backend with worker/mockStore fallback
export const apiClient = {
  getBaseUrl() {
    return BASE_URL;
  },

  async get(endpoint) {
    const sep = endpoint.includes('?') ? '&' : '?';
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // 1. Prioritas Utama: Panggil Native LMS API Backend secara langsung
    try {
      const nativeUrl = `${BASE_URL}${path}${sep}_t=${Date.now()}`;
      const res = await fetch(nativeUrl, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Authorization': `Bearer ${AUTH_TOKEN}`,
        },
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        return data;
      }
      if (data?.error && res.status !== 404) {
        throw new ApiError(data.error.message, data.error.code, res.status);
      }
      if (data?.message && res.status !== 404) {
        throw new ApiError(data.message, 'API_ERROR', res.status);
      }
    } catch (err) {
      if (err instanceof ApiError) throw err;
      // Lanjut ke fallback jika 404 atau network error
    }

    // 2. Fallback: Panggil Cloudflare Worker / Reverse Proxy Lokal
    try {
      const workerUrl = `/api${path}${sep}_t=${Date.now()}`;
      const res = await fetch(workerUrl, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        return data;
      }
      if (data?.error) {
        throw new ApiError(data.error.message, data.error.code, res.status);
      }
    } catch (err) {
      if (err instanceof ApiError) throw err;
    }

    // 3. Fallback: MockStore untuk lingkungan offline total
    await delay(MOCK_DELAY);
    return this.handleMockGet(endpoint);
  },

  async post(endpoint, data = {}) {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // 1. Prioritas Utama: Kirim ke Native LMS API Backend secara langsung
    try {
      const nativeUrl = `${BASE_URL}${path}`;
      const res = await fetch(nativeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`,
        },
        body: JSON.stringify(data),
      });

      const resData = await res.json().catch(() => null);
      if (res.ok && resData) {
        return resData;
      }
      if (resData?.error && res.status !== 404) {
        throw new ApiError(resData.error.message, resData.error.code, res.status);
      }
      if (resData?.message && res.status !== 404) {
        throw new ApiError(resData.message, 'API_ERROR', res.status);
      }
    } catch (err) {
      if (err instanceof ApiError) throw err;
      // Lanjut ke fallback jika 404 atau network error
    }

    // 2. Fallback: Kirim ke Cloudflare Worker / Reverse Proxy Lokal
    try {
      const workerUrl = `/api${path}`;
      const res = await fetch(workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const resData = await res.json().catch(() => null);
      if (res.ok && resData) {
        return resData;
      }
      if (resData?.error) {
        throw new ApiError(resData.error.message, resData.error.code, res.status);
      }
    } catch (err) {
      if (err instanceof ApiError) throw err;
    }

    // 3. Fallback: MockStore untuk lingkungan offline total
    await delay(MOCK_DELAY);
    return this.handleMockPost(endpoint, data);
  },

  handleMockGet(endpoint) {
    // GET /games/:code
    const gameCodeMatch = endpoint.match(/^\/games\/([^/]+)$/);
    if (gameCodeMatch) {
      const gameInfo = mockStore.getGameInfoByCode(gameCodeMatch[1]);
      if (!gameInfo) {
        throw new ApiError('Kode game tidak ditemukan. Coba periksa kembali.', 'GAME_NOT_FOUND', 404);
      }
      return { data: gameInfo };
    }

    // GET /games/:gameId/current-question
    const currentQuestionMatch = endpoint.match(/^\/games\/([^/]+)\/current-question(\?.*)?$/);
    if (currentQuestionMatch) {
      const gameId = currentQuestionMatch[1];
      const isTeacher = endpoint.includes('isTeacher=true');
      const res = mockStore.getCurrentQuestion(gameId, isTeacher);
      if (res.error) {
        throw new ApiError(res.error.message, res.error.code, 400);
      }
      return res;
    }

    // GET /games/:gameId/results
    const resultsMatch = endpoint.match(/^\/games\/([^/]+)\/results$/);
    if (resultsMatch) {
      const gameId = resultsMatch[1];
      const res = mockStore.getResults(gameId);
      if (res.error) {
        throw new ApiError(res.error.message, res.error.code, 400);
      }
      return res;
    }

    throw new ApiError('Endpoint tidak ditemukan', 'NOT_FOUND', 404);
  },

  handleMockPost(endpoint, body) {
    // POST /games
    if (endpoint === '/games') {
      try {
        const game = mockStore.createGame(body.quizId, body.quiz);
        return { data: game };
      } catch (err) {
        throw new ApiError(err.message, 'CREATE_GAME_FAILED', 400);
      }
    }

    // POST /games/:code/join
    const joinMatch = endpoint.match(/^\/games\/([^/]+)\/join$/);
    if (joinMatch) {
      const code = joinMatch[1];
      const res = mockStore.joinGame(code, body.nickname);
      if (res.error) {
        throw new ApiError(res.error.message, res.error.code, 400);
      }
      return res;
    }

    // POST /games/:gameId/start
    const startMatch = endpoint.match(/^\/games\/([^/]+)\/start$/);
    if (startMatch) {
      const gameId = startMatch[1];
      const res = mockStore.startGame(gameId);
      if (res.error) {
        throw new ApiError(res.error.message, res.error.code, 400);
      }
      return res;
    }

    // POST /games/:gameId/next
    const nextMatch = endpoint.match(/^\/games\/([^/]+)\/next$/);
    if (nextMatch) {
      const gameId = nextMatch[1];
      const res = mockStore.nextQuestion(gameId);
      if (res.error) {
        throw new ApiError(res.error.message, res.error.code, 400);
      }
      return res;
    }

    // POST /games/:gameId/answers
    const answerMatch = endpoint.match(/^\/games\/([^/]+)\/answers$/);
    if (answerMatch) {
      const gameId = answerMatch[1];
      const res = mockStore.submitAnswer(gameId, body);
      if (res.error) {
        throw new ApiError(res.error.message, res.error.code, 400);
      }
      return res;
    }

    throw new ApiError('Endpoint tidak ditemukan', 'NOT_FOUND', 404);
  },
};
