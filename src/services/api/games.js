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
