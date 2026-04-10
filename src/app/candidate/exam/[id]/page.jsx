'use client';
// src/app/candidate/exam/[id]/page.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Clock, ChevronLeft, ChevronRight, Send, Maximize,
  AlertTriangle, CheckCircle, Circle, CheckSquare, Type,
  Monitor, ShieldAlert
} from 'lucide-react';
import useExamSessionStore from '@/store/useExamSessionStore';
import { formatTimer } from '@/lib/utils/helpers';
import { toast } from '@/components/ui/Toast';
import ToastContainer from '@/components/ui/Toast';

// ─── Result Screen ────────────────────────────────────────────────────────────
function ResultScreen({ result, exam }) {
  const router = useRouter();
  const pct = result?.percentage ?? 0;
  const passed = pct >= 50;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 max-w-md w-full text-center">
        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
          {passed
            ? <CheckCircle className="w-10 h-10 text-green-500" />
            : <AlertTriangle className="w-10 h-10 text-red-400" />
          }
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {result?.autoSubmitted ? 'Time Up! Auto-Submitted' : 'Exam Submitted!'}
        </h1>
        <p className="text-gray-500 mb-8">{exam?.title}</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-900">{result?.score ?? '-'}</p>
            <p className="text-xs text-gray-500 mt-1">Score</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-900">{result?.totalMarks ?? '-'}</p>
            <p className="text-xs text-gray-500 mt-1">Total</p>
          </div>
          <div className={`rounded-xl p-4 ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`text-2xl font-bold ${passed ? 'text-green-600' : 'text-red-500'}`}>{pct}%</p>
            <p className="text-xs text-gray-500 mt-1">Score %</p>
          </div>
        </div>

        <div className={`px-6 py-3 rounded-xl mb-8 ${passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          <p className="font-semibold">{passed ? '🎉 Congratulations! You passed!' : '😔 Better luck next time!'}</p>
        </div>

        <button
          onClick={() => router.push('/candidate/dashboard')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

// ─── Pre-Exam Instructions Screen ─────────────────────────────────────────────
function InstructionScreen({ exam, onStart }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-lg w-full">
        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-5">
          <Monitor className="w-7 h-7 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{exam.title}</h1>
        <p className="text-gray-500 mb-6">Please read the instructions carefully before starting.</p>

        <div className="space-y-3 mb-8">
          {[
            { icon: Clock, text: `Duration: ${exam.duration} minutes`, color: 'text-amber-500 bg-amber-50' },
            { icon: CheckCircle, text: `${exam.questions?.length || 0} questions total`, color: 'text-indigo-500 bg-indigo-50' },
            { icon: AlertTriangle, text: exam.negativeMarking ? 'Negative marking enabled' : 'No negative marking', color: 'text-red-500 bg-red-50' },
            { icon: Monitor, text: 'Exam requires fullscreen mode', color: 'text-blue-500 bg-blue-50' },
            { icon: ShieldAlert, text: 'Tab switching is monitored', color: 'text-orange-500 bg-orange-50' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <span className="text-sm text-gray-700">{item.text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Maximize className="w-5 h-5" />
          Enter Fullscreen & Start Exam
        </button>
      </div>
    </div>
  );
}

// ─── Main Exam Screen ──────────────────────────────────────────────────────────
export default function ExamPage() {
  const { id } = useParams();
  const router = useRouter();
  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);
  const [phase, setPhase] = useState('loading'); // loading | instructions | exam | result
  const [loadError, setLoadError] = useState(null);

  const {
    exam, submission, answers, currentQuestion, timeLeft,
    warningMessage, tabSwitchCount, fullscreenExitCount,
    isSubmitting, isSubmitted, submissionResult,
    initSession, setAnswer, setCurrentQuestion, tickTimer,
    setFullscreen, logBehavior, saveAnswers, submitExam, reset,
  } = useExamSessionStore();

  // ── Load exam + start submission ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [examRes, subRes] = await Promise.all([
          axios.get(`/api/exams/${id}`, { withCredentials: true }),
          axios.post('/api/submissions', { examId: id }, { withCredentials: true }),
        ]);
        if (cancelled) return;

        if (subRes.data.submission?.status === 'submitted') {
          setPhase('result');
          return;
        }

        initSession(examRes.data.exam, subRes.data.submission);
        setPhase('instructions');
      } catch (err) {
        if (cancelled) return;
        setLoadError(err.response?.data?.error || 'Failed to load exam');
        setPhase('error');
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  // ── Fullscreen listener ───────────────────────────────────────────────────
  useEffect(() => {
    const onFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setFullscreen(isFs);
      if (!isFs && phase === 'exam') {
        logBehavior('fullscreen_exit');
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [phase, logBehavior, setFullscreen]);

  // ── Tab switch / visibility listener ─────────────────────────────────────
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && phase === 'exam') {
        logBehavior('tab_switch');
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [phase, logBehavior]);

  // ── Prevent copy/paste ────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'exam') return;
    const prevent = (e) => e.preventDefault();
    document.addEventListener('copy', prevent);
    document.addEventListener('paste', prevent);
    document.addEventListener('contextmenu', prevent);
    return () => {
      document.removeEventListener('copy', prevent);
      document.removeEventListener('paste', prevent);
      document.removeEventListener('contextmenu', prevent);
    };
  }, [phase]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'exam' || isSubmitted) return;

    timerRef.current = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase, isSubmitted, tickTimer]);

  // ── Auto-submit on timer end ──────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'exam' && timeLeft === 0 && !isSubmitted && !isSubmitting) {
      submitExam(true).then(() => setPhase('result'));
    }
  }, [timeLeft, phase, isSubmitted, isSubmitting, submitExam]);

  // ── Auto-save every 30s ───────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'exam' || isSubmitted) return;
    autoSaveRef.current = setInterval(() => {
      saveAnswers();
    }, 30000);
    return () => clearInterval(autoSaveRef.current);
  }, [phase, isSubmitted, saveAnswers]);

  // ── Show result when submitted ─────────────────────────────────────────────
  useEffect(() => {
    if (isSubmitted) setPhase('result');
  }, [isSubmitted]);

  // ── Enter fullscreen + start exam ─────────────────────────────────────────
  const handleStart = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      toast.error('Could not enter fullscreen. Please allow it in your browser.');
    }
    setPhase('exam');
  }, []);

  // ── Handle manual submit ──────────────────────────────────────────────────
  const handleManualSubmit = async () => {
    const answered = Object.keys(answers).filter((k) => {
      const a = answers[k];
      return a !== undefined && a !== null && a !== '' && !(Array.isArray(a) && a.length === 0);
    }).length;
    const total = exam?.questions?.length || 0;
    const unanswered = total - answered;

    if (unanswered > 0) {
      const ok = window.confirm(`You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`);
      if (!ok) return;
    }
    await submitExam(false);
  };

  // ── Question helpers ───────────────────────────────────────────────────────
  const currentQ = exam?.questions?.[currentQuestion];
  const totalQ = exam?.questions?.length || 0;

  const handleAnswerChange = (questionId, value, type) => {
    if (type === 'checkbox') {
      const current = Array.isArray(answers[questionId]) ? answers[questionId] : [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setAnswer(questionId, updated);
    } else {
      setAnswer(questionId, value);
    }
  };

  const isAnswered = (qId) => {
    const a = answers[qId];
    if (!a) return false;
    if (Array.isArray(a)) return a.length > 0;
    return a !== '';
  };

  const timerDanger = timeLeft <= 300; // last 5 minutes

  // ── Renders ────────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Cannot Load Exam</h2>
          <p className="text-gray-500 mb-6">{loadError}</p>
          <button onClick={() => router.push('/candidate/dashboard')} className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'instructions') {
    return (
      <>
        <ToastContainer />
        <InstructionScreen exam={exam} onStart={handleStart} />
      </>
    );
  }

  if (phase === 'result') {
    return (
      <>
        <ToastContainer />
        <ResultScreen result={submissionResult} exam={exam} />
      </>
    );
  }

  // ── Exam UI ────────────────────────────────────────────────────────────────
  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gray-100 flex flex-col select-none">
        {/* Warning bar */}
        {warningMessage && (
          <div className="bg-red-600 text-white text-sm py-2 px-4 text-center font-medium z-50 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {warningMessage}
          </div>
        )}

        {/* Top bar */}
        <header className="bg-[#1E1B4B] text-white px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-sm">{exam?.title}</p>
              <p className="text-indigo-300 text-xs">{totalQ} Questions</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Behavior indicators */}
            {tabSwitchCount > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-500/20 text-orange-300 px-3 py-1.5 rounded-lg text-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                {tabSwitchCount} tab switch{tabSwitchCount > 1 ? 'es' : ''}
              </div>
            )}

            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${timerDanger ? 'bg-red-500 timer-danger' : 'bg-white/10'}`}>
              <Clock className="w-5 h-5" />
              {formatTimer(timeLeft)}
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Question panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Question area */}
            <div className="flex-1 overflow-y-auto p-6">
              {currentQ && (
                <div className="max-w-3xl mx-auto">
                  {/* Question header */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold">
                        {currentQuestion + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md font-medium">
                            {currentQ.marks} mark{currentQ.marks > 1 ? 's' : ''}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md capitalize">
                            {currentQ.type === 'radio' ? 'Single Choice' : currentQ.type === 'checkbox' ? 'Multiple Choice' : 'Text Answer'}
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium text-base leading-relaxed">{currentQ.title}</p>
                      </div>
                    </div>
                  </div>

                  {/* Answer area */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    {currentQ.type === 'text' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer</label>
                        <textarea
                          value={answers[currentQ._id] || ''}
                          onChange={(e) => setAnswer(currentQ._id, e.target.value)}
                          rows={6}
                          placeholder="Type your answer here..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700 mb-3">
                          {currentQ.type === 'checkbox' ? 'Select all that apply:' : 'Select one answer:'}
                        </p>
                        {currentQ.options?.map((option, optIdx) => {
                          const isChecked = currentQ.type === 'checkbox'
                            ? (Array.isArray(answers[currentQ._id]) && answers[currentQ._id].includes(option))
                            : answers[currentQ._id] === option;
                          return (
                            <label
                              key={optIdx}
                              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                isChecked
                                  ? 'border-indigo-500 bg-indigo-50'
                                  : 'border-gray-100 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50/30'
                              }`}
                            >
                              <div className={`flex-shrink-0 w-5 h-5 border-2 flex items-center justify-center transition-colors ${
                                currentQ.type === 'checkbox' ? 'rounded' : 'rounded-full'
                              } ${isChecked ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                                {isChecked && (
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <input
                                type={currentQ.type === 'checkbox' ? 'checkbox' : 'radio'}
                                name={`q-${currentQ._id}`}
                                value={option}
                                checked={isChecked}
                                onChange={() => handleAnswerChange(currentQ._id, option, currentQ.type)}
                                className="sr-only"
                              />
                              <span className="text-sm text-gray-800">{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-6">
                    <button
                      disabled={currentQuestion === 0}
                      onClick={() => setCurrentQuestion(currentQuestion - 1)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    <span className="text-sm text-gray-500 font-medium">
                      {currentQuestion + 1} / {totalQ}
                    </span>

                    {currentQuestion < totalQ - 1 ? (
                      <button
                        onClick={() => setCurrentQuestion(currentQuestion + 1)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 rounded-xl text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleManualSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-5 py-2.5 bg-green-600 rounded-xl text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                      >
                        {isSubmitting ? (
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                        ) : <Send className="w-4 h-4" />}
                        Submit Exam
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Question navigator sidebar */}
          <div className="w-64 bg-white border-l border-gray-100 flex flex-col flex-shrink-0 overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-700">Questions</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {Object.keys(answers).filter((k) => isAnswered(k)).length} of {totalQ} answered
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-5 gap-1.5">
                {exam?.questions?.map((q, idx) => {
                  const answered = isAnswered(q._id);
                  const isCurrent = idx === currentQuestion;
                  return (
                    <button
                      key={q._id}
                      onClick={() => setCurrentQuestion(idx)}
                      className={`w-full aspect-square rounded-lg text-xs font-semibold transition-all duration-200 ${
                        isCurrent
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                          : answered
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-3 h-3 bg-green-500 rounded" /> Answered
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-3 h-3 bg-indigo-600 rounded" /> Current
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-3 h-3 bg-gray-200 rounded" /> Not answered
                </div>
              </div>
            </div>

            {/* Submit button in sidebar */}
            <div className="p-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
