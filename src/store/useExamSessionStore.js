'use client';
// src/store/useExamSessionStore.js
import { create } from 'zustand';
import axios from 'axios';

const useExamSessionStore = create((set, get) => ({
  exam: null,
  submission: null,
  answers: {},            // { questionId: answer }
  currentQuestion: 0,
  timeLeft: 0,            // seconds
  isFullscreen: false,
  tabSwitchCount: 0,
  fullscreenExitCount: 0,
  isSubmitting: false,
  isSubmitted: false,
  submissionResult: null,
  warningMessage: null,

  initSession: (exam, submission) => {
    const now = new Date();
    const examEnd = new Date(exam.endTime);
    const durationSecs = exam.duration * 60;
    const elapsedSecs = submission.startedAt
      ? Math.floor((now - new Date(submission.startedAt)) / 1000)
      : 0;
    const timeLeft = Math.max(0, Math.min(durationSecs, Math.floor((examEnd - now) / 1000)) - 0);
    // Use the lesser of time remaining by duration or by exam end
    const byDuration = durationSecs - elapsedSecs;
    const byEnd = Math.floor((examEnd - now) / 1000);
    const actualTimeLeft = Math.max(0, Math.min(byDuration, byEnd));

    // Restore existing answers
    const existingAnswers = {};
    if (submission.answers) {
      submission.answers.forEach((a) => {
        existingAnswers[a.questionId] = a.answer;
      });
    }

    set({
      exam,
      submission,
      answers: existingAnswers,
      currentQuestion: 0,
      timeLeft: actualTimeLeft,
      isSubmitting: false,
      isSubmitted: false,
      submissionResult: null,
      tabSwitchCount: submission.tabSwitchCount || 0,
      fullscreenExitCount: submission.fullscreenExitCount || 0,
      warningMessage: null,
    });
  },

  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),

  setCurrentQuestion: (index) => set({ currentQuestion: index }),

  setSubmittedResult: (submission) =>
    set({
      isSubmitted: true,
      submissionResult: submission,
    }),

  tickTimer: () =>
    set((state) => {
      const newTime = state.timeLeft - 1;
      if (newTime <= 0) {
        return { timeLeft: 0 };
      }
      return { timeLeft: newTime };
    }),

  setFullscreen: (val) => set({ isFullscreen: val }),

  logBehavior: async (event) => {
    const { submission } = get();
    if (!submission) return;

    set((state) => ({
      tabSwitchCount: event === 'tab_switch' ? state.tabSwitchCount + 1 : state.tabSwitchCount,
      fullscreenExitCount: event === 'fullscreen_exit' ? state.fullscreenExitCount + 1 : state.fullscreenExitCount,
      warningMessage: event === 'tab_switch'
        ? `⚠️ Tab switch detected! (${get().tabSwitchCount + 1} time${get().tabSwitchCount + 1 > 1 ? 's' : ''})`
        : event === 'fullscreen_exit'
        ? '⚠️ Please stay in fullscreen mode during the exam!'
        : null,
    }));

    try {
      await axios.post(`/api/submissions/${submission._id}/behavior`, { event }, { withCredentials: true });
    } catch {}

    // Clear warning after 3s
    setTimeout(() => set({ warningMessage: null }), 3000);
  },

  saveAnswers: async () => {
    const { submission, answers } = get();
    if (!submission || !answers) return;

    const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));

    try {
      await axios.put(
        `/api/submissions/${submission._id}/answers`,
        { answers: answersArray },
        { withCredentials: true }
      );
    } catch {}
  },

  submitExam: async (autoSubmitted = false) => {
    const { submission, answers, isSubmitting, isSubmitted } = get();
    if (!submission || isSubmitting || isSubmitted) return;

    set({ isSubmitting: true });

    const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));

    const startedAt = submission.startedAt ? new Date(submission.startedAt) : new Date();
    const timeSpent = Math.floor((new Date() - startedAt) / 1000);

    try {
      const res = await axios.post(
        `/api/submissions/${submission._id}/submit`,
        { answers: answersArray, autoSubmitted, timeSpent },
        { withCredentials: true }
      );

      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      set({
        isSubmitting: false,
        isSubmitted: true,
        submissionResult: res.data.submission,
      });
    } catch (err) {
      set({ isSubmitting: false });
      console.error('Submit error:', err);
    }
  },

  clearWarning: () => set({ warningMessage: null }),

  reset: () =>
    set({
      exam: null,
      submission: null,
      answers: {},
      currentQuestion: 0,
      timeLeft: 0,
      isFullscreen: false,
      tabSwitchCount: 0,
      fullscreenExitCount: 0,
      isSubmitting: false,
      isSubmitted: false,
      submissionResult: null,
      warningMessage: null,
    }),
}));

export default useExamSessionStore;
