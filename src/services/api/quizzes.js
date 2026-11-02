// Quiz Service for Yahoot!
// Fully integrates endpoints from docs/QUIZ_INTEGRATION_DOCS.md and integration/2026-10-29_Yahoot_General_Quiz_Integration_Docs.md

import { lmsClient } from './client';
import { mockStore } from '../../mocks/mockStore';

export const DEFAULT_OWNER_ID = Number(import.meta.env.VITE_DEFAULT_OWNER_ID || 4409);
export const DEFAULT_COURSE_ID = Number(import.meta.env.VITE_DEFAULT_COURSE_ID || 1);

/**
 * Transforms an LMS question record into Yahoot app question format
 * Supports Tipe PILIH (Multiple Choice / True-False) and Tipe KETIK (Short Answer)
 */
export const transformLmsQuestionToApp = (q) => {
  if (!q) return null;

  const hasOptA = q.option_a !== null && q.option_a !== undefined && q.option_a !== '';
  const hasOptB = q.option_b !== null && q.option_b !== undefined && q.option_b !== '';
  const hasOptC = q.option_c !== null && q.option_c !== undefined && q.option_c !== '';
  const hasOptD = q.option_d !== null && q.option_d !== undefined && q.option_d !== '';

  const options = [];
  if (hasOptA) options.push({ id: 'a', text: String(q.option_a) });
  if (hasOptB) options.push({ id: 'b', text: String(q.option_b) });
  if (hasOptC) options.push({ id: 'c', text: String(q.option_c) });
  if (hasOptD) options.push({ id: 'd', text: String(q.option_d) });

  const rawCorrect = (q.correct_answer || '').trim();
  const lowerCorrect = rawCorrect.toLowerCase();

  let type = 'multiple_choice';
  if (!hasOptA && !hasOptB) {
    // Tipe KETIK (Isian / Jawaban Singkat)
    type = 'short_answer';
  } else if (
    options.length === 2 &&
    (options.some(o => /^(true|benar)$/i.test(o.text)) || options.some(o => /^(false|salah)$/i.test(o.text)))
  ) {
    type = 'true_false';
  }

  const qId = q.question_id || q.id;
  const storedLimit = typeof window !== 'undefined' && qId
    ? localStorage.getItem(`yahoot_q_timelimit_${qId}`)
    : null;
  const storedPoints = typeof window !== 'undefined' && qId
    ? localStorage.getItem(`yahoot_q_points_${qId}`)
    : null;

  const resolvedTimeLimit = Number(
    q.timeLimit !== undefined
      ? q.timeLimit
      : q.time_limit !== undefined && Number(q.time_limit) > 0 && Number(q.time_limit) <= 300
      ? q.time_limit
      : storedLimit || 20
  ) || 20;

  const resolvedPoints = Number(
    q.points !== undefined
      ? q.points
      : storedPoints || 100
  ) || 100;

  return {
    id: qId,
    question_id: qId,
    quiz_id: q.quiz_id,
    owner_id: q.owner_id,
    type,
    question: q.question_text || q.question || '',
    question_text: q.question_text || q.question || '',
    options,
    correctOptionId: type === 'short_answer' ? rawCorrect : lowerCorrect,
    correct_answer: rawCorrect,
    order_index: q.order_index ?? 0,
    timeLimit: resolvedTimeLimit,
    points: resolvedPoints,
  };
};

/**
 * Transforms Yahoot app question format into LMS question request payload
 * Supports PILIH (multiple choice / true-false) and KETIK (short answer)
 */
export const transformAppQuestionToLms = (quizId, q, ownerId = DEFAULT_OWNER_ID) => {
  const questionType = q.type || 'multiple_choice';

  if (questionType === 'short_answer') {
    return {
      quiz_id: Number(quizId || 0),
      owner_id: Number(ownerId || DEFAULT_OWNER_ID),
      question_text: (q.question || q.question_text || '').trim(),
      option_a: null,
      option_b: null,
      option_c: null,
      option_d: null,
      correct_answer: (q.correct_answer || q.correctOptionId || '').trim(),
      order_index: Number(q.order_index || 1),
    };
  }

  let optA = '';
  let optB = '';
  let optC = null;
  let optD = null;
  let correctAnswer = (q.correctOptionId || q.correct_answer || 'a').toLowerCase().trim();

  if (questionType === 'true_false') {
    optA = 'True';
    optB = 'False';
    if (correctAnswer === 'true' || correctAnswer === 'a' || correctAnswer === 'benar') {
      correctAnswer = 'a';
    } else {
      correctAnswer = 'b';
    }
  } else if (Array.isArray(q.options) && q.options.length > 0) {
    const findOption = (letter) => q.options.find(o => String(o.id).toLowerCase() === letter)?.text;
    optA = findOption('a') ?? q.options[0]?.text ?? '';
    optB = findOption('b') ?? q.options[1]?.text ?? '';
    optC = findOption('c') ?? q.options[2]?.text ?? null;
    optD = findOption('d') ?? q.options[3]?.text ?? null;
  } else {
    optA = q.option_a ?? '';
    optB = q.option_b ?? '';
    optC = q.option_c ?? null;
    optD = q.option_d ?? null;
  }

  return {
    quiz_id: Number(quizId || 0),
    owner_id: Number(ownerId || DEFAULT_OWNER_ID),
    question_text: (q.question || q.question_text || '').trim(),
    option_a: optA,
    option_b: optB,
    option_c: optC,
    option_d: optD,
    correct_answer: correctAnswer,
    order_index: Number(q.order_index || 1),
  };
};

/**
 * Transforms an LMS quiz record into unified Yahoot app quiz format
 */
export const transformLmsQuizToApp = (quizItem, rawQuestions = []) => {
  if (!quizItem) return null;
  const questions = (rawQuestions || []).map(transformLmsQuestionToApp);
  const quizId = quizItem.quiz_id || quizItem.id;

  const appQuiz = {
    id: quizId,
    quiz_id: quizId,
    owner_id: quizItem.owner_id ?? DEFAULT_OWNER_ID,
    course_id: quizItem.course_id !== undefined && quizItem.course_id !== null ? Number(quizItem.course_id) : null,
    course_title: quizItem.course_title ?? null,
    section_id: quizItem.section_id ?? null,
    section_name: quizItem.section_name ?? '',
    title: quizItem.title || 'Tanpa Judul',
    description: quizItem.description || '',
    passing_score: quizItem.passing_score ?? 75,
    time_limit: quizItem.time_limit ?? 30, // in minutes
    status: quizItem.status || 'draft',
    questionCount: questions.length > 0 ? questions.length : (quizItem.total_questions ?? quizItem.questionCount ?? 0),
    total_questions: questions.length > 0 ? questions.length : (quizItem.total_questions ?? quizItem.questionCount ?? 0),
    questions,
    created_at: quizItem.created_at,
    updated_at: quizItem.updated_at,
    highest_score: quizItem.highest_score ?? null,
    attempts: quizItem.attempts ?? 0,
    is_passed: quizItem.is_passed ?? 0,
  };

  // Sync to mockStore so Yahoot's multiplayer Host Game (PIN game) can play this quiz immediately
  if (questions.length > 0) {
    mockStore.registerOrUpdateQuiz(appQuiz);
  }

  return appQuiz;
};

// ========================================================
// 1. YAHOOT & COURSE QUIZ CRUD
// ========================================================

/**
 * Get quizzes table for teacher
 * Priority: GET /table/yahoot_quiz/:owner_id/:current_page?search=keyword (Section 3.3)
 * Falls back to /table/course_quiz/:course_id/:current_page if specific courseId requested
 */
export const getQuizzes = async (params = {}) => {
  const ownerId = params.ownerId ?? DEFAULT_OWNER_ID;
  const page = params.page ?? 1;
  const search = params.search ?? '';
  const query = search ? `?search=${encodeURIComponent(search)}` : '';

  let endpoint = `/table/yahoot_quiz/${ownerId}/${page}${query}`;

  // If specifically targeting a course table
  if (params.courseId && params.useCourseTable) {
    endpoint = `/table/course_quiz/${params.courseId}/${page}${query}`;
  }

  let response;
  try {
    response = await lmsClient.get(endpoint);
  } catch (err) {
    // If yahoot_quiz endpoint is unavailable, gracefully try course_quiz or fallback
    if (!endpoint.includes('/table/course_quiz')) {
      const fallbackCourseId = params.courseId ?? DEFAULT_COURSE_ID;
      response = await lmsClient.get(`/table/course_quiz/${fallbackCourseId}/${page}${query}`);
    } else {
      throw err;
    }
  }

  const rawList = response.tableData || [];
  const transformedList = rawList
    .filter(item => !String(item.title || '').startsWith('__YAHOOT_'))
    .map(item => transformLmsQuizToApp(item));

  if (params.returnFullResponse) {
    return {
      tableData: transformedList,
      totalRecords: response.totalRecords ?? transformedList.length,
      totalPages: response.totalPages ?? 1,
      currentPage: response.currentPage ?? page,
    };
  }

  return transformedList;
};

/**
 * Get full quiz detail with questions list
 * GET /detail/yahoot_quiz/:quiz_id (Section 3.4)
 */
export const getQuiz = async (quizId) => {
  const cacheBuster = `_t=${Date.now()}`;
  let response;
  try {
    response = await lmsClient.get(`/detail/yahoot_quiz/${quizId}?${cacheBuster}`, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
  } catch {
    // Alias fallback: /detail/course_quiz/:quiz_id
    response = await lmsClient.get(`/detail/course_quiz/${quizId}?${cacheBuster}`, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
  }

  const quizData = response.data?.quiz || response.quiz || response.data || {};
  const questionsData = response.data?.questions || response.questions || [];

  return transformLmsQuizToApp(quizData, questionsData);
};

/**
 * Add a new quiz (Section 3.1)
 * Supports:
 * - Mode 1: PILIH (course_id provided)
 * - Mode 2: KETIK (course_title provided, course_id null)
 * - Mode 3: Cuma-cuma / Bebas (course_id null, course_title null)
 * - One-shot create with questions array
 * POST /add/yahoot_quiz (Alias: /add/course_quiz)
 */
export const createQuiz = async (data) => {
  const payload = {
    owner_id: Number(data.owner_id || DEFAULT_OWNER_ID),
    title: (data.title || '').trim(),
    description: (data.description || '').trim(),
    passing_score: Number(data.passing_score ?? 75),
    time_limit: Number(data.time_limit ?? 30),
    status: data.status === 'publish' ? 'publish' : 'draft',
  };

  // Determine course mode
  if (data.course_id) {
    // Mode 1: Terikat Kursus LMS
    payload.course_id = Number(data.course_id);
    if (data.section_id) {
      payload.section_id = Number(data.section_id);
    }
  } else if (data.course_title && data.course_title.trim()) {
    // Mode 2: Custom Kursus / Topik KETIK
    payload.course_title = data.course_title.trim();
  }
  // Mode 3: Neither course_id nor course_title are sent (both null in DB)

  // One-shot questions array if provided
  if (Array.isArray(data.questions) && data.questions.length > 0) {
    payload.questions = data.questions.map((q, idx) => {
      const lmsQ = transformAppQuestionToLms(0, q, payload.owner_id);
      lmsQ.order_index = idx + 1;
      return lmsQ;
    });
  }

  let response;
  try {
    response = await lmsClient.post('/add/yahoot_quiz', payload);
  } catch {
    // Alias fallback: /add/course_quiz
    response = await lmsClient.post('/add/course_quiz', payload);
  }

  const newQuizId = response.quiz_id;

  const newQuiz = {
    id: newQuizId,
    quiz_id: newQuizId,
    ...payload,
    questionCount: payload.questions?.length || 0,
    questions: payload.questions ? payload.questions.map(transformLmsQuestionToApp) : [],
  };

  mockStore.registerOrUpdateQuiz(newQuiz);
  return newQuiz;
};

/**
 * Update quiz information
 * PUT /update/course_quiz/:quiz_id
 */
export const updateQuiz = async (quizId, data) => {
  const payload = {};
  if (data.title !== undefined) payload.title = data.title.trim();
  if (data.description !== undefined) payload.description = data.description.trim();
  if (data.passing_score !== undefined) payload.passing_score = Number(data.passing_score);
  if (data.time_limit !== undefined) payload.time_limit = Number(data.time_limit);
  if (data.section_id !== undefined) payload.section_id = data.section_id ? Number(data.section_id) : null;
  if (data.course_title !== undefined) payload.course_title = data.course_title ? data.course_title.trim() : null;

  const response = await lmsClient.put(`/update/course_quiz/${quizId}`, payload);
  return response;
};

/**
 * Update quiz publication status (Section 3.7)
 * PUT /update/yahoot_quiz/status/:quiz_id (Alias: /update/course_quiz/status/:quiz_id)
 */
export const updateQuizStatus = async (quizId, status) => {
  const normalizedStatus = status === 'publish' || status === 'published' ? 'publish' : 'draft';
  let response;
  try {
    response = await lmsClient.put(`/update/yahoot_quiz/status/${quizId}`, {
      status: normalizedStatus,
    });
  } catch {
    response = await lmsClient.put(`/update/course_quiz/status/${quizId}`, {
      status: normalizedStatus,
    });
  }
  return response;
};

/**
 * Delete a quiz (soft delete)
 * DELETE /delete/course_quiz/:quiz_id
 */
export const deleteQuiz = async (quizId) => {
  const response = await lmsClient.delete(`/delete/course_quiz/${quizId}`);
  mockStore.deleteQuiz(quizId);
  return response;
};

// ========================================================
// 2. QUIZ QUESTIONS CRUD & BULK IMPORT
// ========================================================

/**
 * Add a single question to quiz
 * POST /add/course_quiz_question
 */
export const createQuestion = async (quizId, questionData) => {
  const payload = transformAppQuestionToLms(quizId, questionData, questionData.owner_id || DEFAULT_OWNER_ID);
  const response = await lmsClient.post('/add/course_quiz_question', payload);

  const qId = response.question_id;
  if (typeof window !== 'undefined' && qId) {
    if (questionData.timeLimit) localStorage.setItem(`yahoot_q_timelimit_${qId}`, String(questionData.timeLimit));
    if (questionData.points) localStorage.setItem(`yahoot_q_points_${qId}`, String(questionData.points));
  }

  const createdQuestion = transformLmsQuestionToApp({
    ...payload,
    ...questionData,
    question_id: response.question_id,
    timeLimit: questionData.timeLimit !== undefined ? questionData.timeLimit : 20,
    points: questionData.points !== undefined ? questionData.points : 100,
  });

  return createdQuestion;
};

/**
 * Bulk Import Questions (Section 3.2)
 * POST /import/course_quiz_questions
 * (Alias: /import/course_quiz_question, /import/yahoot_quiz_questions, /import/quiz_questions)
 */
export const bulkImportQuestions = async ({ quizId, ownerId = DEFAULT_OWNER_ID, questions = [] }) => {
  const transformedQuestions = questions.map((q, idx) => {
    const lmsQ = transformAppQuestionToLms(quizId, q, ownerId);
    lmsQ.order_index = q.order_index ? Number(q.order_index) : idx + 1;
    return lmsQ;
  });

  const payload = {
    quiz_id: Number(quizId),
    owner_id: Number(ownerId),
    questions: transformedQuestions,
  };

  let response;
  try {
    response = await lmsClient.post('/import/course_quiz_questions', payload);
  } catch {
    response = await lmsClient.post('/import/yahoot_quiz_questions', payload);
  }

  // Convert transformed questions into app questions format
  const appQuestions = transformedQuestions.map((tq, idx) =>
    transformLmsQuestionToApp({
      ...tq,
      question_id: tq.question_id || `import_${Date.now()}_${idx}`,
    })
  );

  // Sync to mockStore so live game / mock mode immediately includes imported questions
  const storedQuiz = mockStore.getQuiz(quizId);
  if (storedQuiz) {
    const existingQ = storedQuiz.questions || [];
    mockStore.registerOrUpdateQuiz({
      ...storedQuiz,
      questions: [...existingQ, ...appQuestions],
      questionCount: existingQ.length + appQuestions.length,
      total_questions: existingQ.length + appQuestions.length,
    });
  }

  return {
    ...response,
    importedQuestions: appQuestions,
  };
};

/**
 * Get question detail
 * GET /detail/course_quiz_question/:question_id
 */
export const getQuestion = async (questionId) => {
  const response = await lmsClient.get(`/detail/course_quiz_question/${questionId}`);
  const qData = response.data || {};
  return transformLmsQuestionToApp(qData);
};

/**
 * Update question
 * PUT /update/course_quiz_question/:question_id
 */
export const updateQuestion = async (quizIdOrQuestionId, maybeQuestionIdOrData, maybeData) => {
  let questionId = quizIdOrQuestionId;
  let data = maybeQuestionIdOrData;
  let quizId = null;

  if (maybeData !== undefined) {
    quizId = quizIdOrQuestionId;
    questionId = maybeQuestionIdOrData;
    data = maybeData;
  }

  const payload = transformAppQuestionToLms(quizId || 0, data);
  delete payload.quiz_id;
  delete payload.owner_id;

  if (typeof window !== 'undefined' && questionId) {
    if (data.timeLimit !== undefined) localStorage.setItem(`yahoot_q_timelimit_${questionId}`, String(data.timeLimit));
    if (data.points !== undefined) localStorage.setItem(`yahoot_q_points_${questionId}`, String(data.points));
  }

  const response = await lmsClient.put(`/update/course_quiz_question/${questionId}`, payload);
  return transformLmsQuestionToApp({
    ...payload,
    ...data,
    question_id: questionId,
    timeLimit: data.timeLimit !== undefined ? data.timeLimit : 20,
    points: data.points !== undefined ? data.points : 100,
  });
};

/**
 * Delete question
 * DELETE /delete/course_quiz_question/:question_id
 */
export const deleteQuestion = async (quizIdOrQuestionId, maybeQuestionId) => {
  const questionId = maybeQuestionId !== undefined ? maybeQuestionId : quizIdOrQuestionId;
  const response = await lmsClient.delete(`/delete/course_quiz_question/${questionId}`);
  return response;
};

// ========================================================
// 3. CURRICULUM SECTIONS & COURSES
// ========================================================

/**
 * Get course sections dropdown
 * GET /list/course_sections/:course_id
 */
export const getCourseSections = async (courseId = DEFAULT_COURSE_ID) => {
  try {
    const response = await lmsClient.get(`/list/course_sections/${courseId}`);
    return response.listData || [];
  } catch (err) {
    console.warn('Could not load course sections:', err.message);
    return [];
  }
};

/**
 * Get courses table for teacher
 * GET /table/all_course/:owner_id/:current_page
 */
export const getCourses = async (ownerId = DEFAULT_OWNER_ID, page = 1) => {
  try {
    const response = await lmsClient.get(`/table/all_course/${ownerId}/${page}`);
    return response.tableData || [];
  } catch (err) {
    console.warn('Could not load courses list:', err.message);
    return [];
  }
};

// ========================================================
// 4. STUDENT QUIZ LIST & SUBMISSION & RESULTS
// ========================================================

/**
 * Yahoot Student Quiz List (Section 3.5)
 * GET /list/yahoot_quiz/:customer_id or GET /list/yahoot_quiz
 */
export const getYahootStudentQuizzes = async (customerId = null) => {
  const endpoint = customerId ? `/list/yahoot_quiz/${customerId}` : '/list/yahoot_quiz';
  const response = await lmsClient.get(endpoint);
  const list = response.listData || [];
  return list
    .filter(item => !String(item.title || '').startsWith('__YAHOOT_'))
    .map(item => transformLmsQuizToApp(item));
};

/**
 * Submit Yahoot quiz answers (Section 3.6)
 * POST /submit/yahoot_quiz (Alias: /submit/course_quiz)
 */
export const submitYahootQuiz = async ({ quizId, customerId, answers }) => {
  const payload = {
    quiz_id: Number(quizId),
    customer_id: Number(customerId),
    answers,
  };

  let response;
  try {
    response = await lmsClient.post('/submit/yahoot_quiz', payload);
  } catch {
    response = await lmsClient.post('/submit/course_quiz', payload);
  }
  return response;
};

/**
 * Course-specific Student Quiz List (Legacy Section 3.6)
 * GET /list/course_quiz/:course_id/:customer_id
 */
export const getStudentQuizzes = async (courseId = DEFAULT_COURSE_ID, customerId) => {
  const response = await lmsClient.get(`/list/course_quiz/${courseId}/${customerId}`);
  return response.listData || [];
};

/**
 * Submit course quiz answers (Legacy Section 5.1)
 * POST /submit/course_quiz
 */
export const submitQuiz = async ({ quizId, customerId, courseId = DEFAULT_COURSE_ID, answers }) => {
  return submitYahootQuiz({ quizId, customerId, answers });
};

/**
 * Instructor results table for a quiz
 * GET /table/course_quiz_results/:quiz_id/:current_page?search=keyword
 */
export const getQuizResultsTable = async (quizId, page = 1, search = '') => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  const response = await lmsClient.get(`/table/course_quiz_results/${quizId}/${page}${query}`);
  return response;
};

/**
 * Detail result for a specific customer
 * GET /detail/course_quiz_result/:quiz_id/:customer_id
 */
export const getQuizResultByCustomer = async (quizId, customerId) => {
  const response = await lmsClient.get(`/detail/course_quiz_result/${quizId}/${customerId}`);
  return response.data;
};

