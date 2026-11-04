import { apiClient } from './client';
import { mockStore } from '../../mocks/mockStore';

export const createGame = async (quizId, quiz = null) => {
  const response = await apiClient.post('/games', { quizId, quiz });
  return response.data;
};

export const getGame = async (code) => {
  const response = await apiClient.get(`/games/${code}`);
  return response.data;
};

export const getGameById = async (gameId) => {
  try {
    const response = await apiClient.get(`/games/${gameId}`);
    return response.data;
  } catch {
    return mockStore.getGameById(gameId);
  }
};

export const joinGame = async (code, data) => {
  const response = await apiClient.post(`/games/${code}/join`, data);
  return response.data;
};

export const startGame = async (gameId) => {
  const response = await apiClient.post(`/games/${gameId}/start`);
  return response.data;
};

export const nextQuestion = async (gameId) => {
  const response = await apiClient.post(`/games/${gameId}/next`);
  return response.data;
};

export const getCurrentQuestion = async (gameId, isTeacher = false) => {
  const endpoint = isTeacher
    ? `/games/${gameId}/current-question?isTeacher=true`
    : `/games/${gameId}/current-question`;
  const response = await apiClient.get(endpoint);
  return response.data;
};

export const submitAnswer = async (gameId, data) => {
  const response = await apiClient.post(`/games/${gameId}/answers`, data);
  return response.data;
};

export const getResults = async (gameId) => {
  const response = await apiClient.get(`/games/${gameId}/results`);
  return response.data;
};

export const getAnswersStats = async (gameId, questionIndex) => {
  try {
    const response = await apiClient.get(`/games/${gameId}/stats/${questionIndex}`);
    return response.data;
  } catch {
    return mockStore.getGameAnswersStats(gameId, questionIndex);
  }
};

export const addDemoPlayer = async (gameId, nickname) => {
  try {
    const response = await apiClient.post(`/games/${gameId}/demo-player`, { nickname });
    return response.data;
  } catch {
    return mockStore.addDemoPlayer(gameId, nickname);
  }
};

export const setQuestionStatus = async (gameId, status) => {
  try {
    const response = await apiClient.post(`/games/${gameId}/status`, { status });
    return response.data;
  } catch {
    return mockStore.setQuestionStatus(gameId, status);
  }
};

export const saveGameToHistory = (gameInfo) => {
  if (!gameInfo || !gameInfo.id) return;
  try {
    const raw = localStorage.getItem('yahoot_game_history');
    const list = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((g) => g.id !== gameInfo.id && g.gameId !== gameInfo.id);
    filtered.unshift({
      id: gameInfo.id,
      gameId: gameInfo.id,
      pinCode: gameInfo.pinCode || gameInfo.code || '',
      quizId: gameInfo.quizId || null,
      quizTitle: gameInfo.quizTitle || 'Yahoot! Quiz',
      status: gameInfo.status || 'finished',
      totalQuestions: Number(gameInfo.totalQuestions) || 0,
      totalPlayers: Number(gameInfo.totalPlayers) || (gameInfo.players || []).length || 0,
      createdAt: gameInfo.createdAt || new Date().toISOString(),
      updatedAt: gameInfo.updatedAt || new Date().toISOString(),
    });
    localStorage.setItem('yahoot_game_history', JSON.stringify(filtered.slice(0, 50)));
  } catch (e) {
    console.warn('Failed to save game to localStorage history:', e);
  }
};

export const getGameHistory = async () => {
  let localList = [];
  try {
    const raw = localStorage.getItem('yahoot_game_history');
    if (raw) localList = JSON.parse(raw);
  } catch {}

  try {
    const response = await apiClient.get('/games/history');
    const apiList = response.data || [];
    const map = new Map();
    apiList.forEach((item) => map.set(item.id || item.gameId, item));
    localList.forEach((item) => {
      const id = item.id || item.gameId;
      if (!map.has(id)) {
        map.set(id, item);
      }
    });
    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    try {
      localStorage.setItem('yahoot_game_history', JSON.stringify(merged.slice(0, 50)));
    } catch {}
    return merged;
  } catch {
    return localList;
  }
};
