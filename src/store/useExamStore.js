'use client';
import { create } from 'zustand';

const defaultStep1 = {
  title: '',
  totalCandidates: '',
  totalSlots: '',
  questionSets: 1,
  questionType: 'radio',
  startTime: '',
  endTime: '',
  duration: '',
  negativeMark: 0,
  negativeMarking: false,
};

const useExamStore = create((set, get) => ({
  currentStep: 1,
  step1Data: { ...defaultStep1 },
  questions: [],

  isSubmitting: false,
  error: null,

  setStep: (step) => set({ currentStep: step }),

  updateStep1: (data) => set((state) => ({ step1Data: { ...state.step1Data, ...data } })),

  setQuestions: (questions) => set({ questions }),

  addQuestion: (question) =>
    set((state) => ({
      questions: [
        ...state.questions,
        {
          ...question,
          _id: `q_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        },
      ],
    })),

  updateQuestion: (id, data) =>
    set((state) => ({
      questions: state.questions.map((q) => (q._id === id ? { ...q, ...data } : q)),
    })),

  removeQuestion: (id) =>
    set((state) => ({
      questions: state.questions.filter((q) => q._id !== id),
    })),

  reorderQuestions: (questions) => set({ questions }),

  reset: () =>
    set({
      currentStep: 1,
      step1Data: { ...defaultStep1 },
      questions: [],
      isSubmitting: false,
      error: null,
    }),

  setSubmitting: (val) => set({ isSubmitting: val }),
  setError: (error) => set({ error }),
}));

export default useExamStore;
