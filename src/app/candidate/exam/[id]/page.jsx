"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { AlertTriangle } from "lucide-react";
import ErrorScreen from "@/components/candidate/exam/ErrorScreen";
import ExamFooter from "@/components/candidate/exam/ExamFooter";
import ExamHeader from "@/components/candidate/exam/ExamHeader";
import ExamQuestionCard from "@/components/candidate/exam/ExamQuestionCard";
import InstructionScreen from "@/components/candidate/exam/InstructionScreen";
import LoadingScreen from "@/components/candidate/exam/LoadingScreen";
import ResultScreen from "@/components/candidate/exam/ResultScreen";
import useExamSessionStore from "@/store/useExamSessionStore";
import useAuthStore from "@/store/useAuthStore";
import { toast } from "@/components/ui/Toast";
import ToastContainer from "@/components/ui/Toast";

export default function ExamPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);
  const [phase, setPhase] = useState("loading");
  const [loadError, setLoadError] = useState(null);

  const {
    exam,
    answers,
    currentQuestion,
    timeLeft,
    warningMessage,
    tabSwitchCount,
    isSubmitting,
    isSubmitted,
    submissionResult,
    initSession,
    setAnswer,
    setCurrentQuestion,
    tickTimer,
    setFullscreen,
    logBehavior,
    saveAnswers,
    submitExam,
    setSubmittedResult,
  } = useExamSessionStore();

  //   Load exam + start submission
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [examRes, subRes] = await Promise.all([
          axios.get(`/api/exams/${id}`, { withCredentials: true }),
          axios.post(
            "/api/submissions",
            { examId: id },
            { withCredentials: true }
          ),
        ]);
        if (cancelled) return;

        initSession(examRes.data.exam, subRes.data.submission);

        if (subRes.data.submission?.status === "submitted") {
          setSubmittedResult(subRes.data.submission);
          setPhase("complete");
          return;
        }

        setPhase("instructions");
      } catch (err) {
        if (cancelled) return;
        setLoadError(err.response?.data?.error || "Failed to load exam");
        setPhase("error");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, initSession, setSubmittedResult]);

  //   Fullscreen listener
  useEffect(() => {
    const onFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setFullscreen(isFs);
      if (!isFs && phase === "exam") {
        logBehavior("fullscreen_exit");
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [phase, logBehavior, setFullscreen]);

  //   Tab switch / visibility listener
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && phase === "exam") {
        logBehavior("tab_switch");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [phase, logBehavior]);

  //   Prevent copy/paste
  useEffect(() => {
    if (phase !== "exam") return;
    const prevent = (e) => e.preventDefault();
    document.addEventListener("copy", prevent);
    document.addEventListener("paste", prevent);
    document.addEventListener("contextmenu", prevent);
    return () => {
      document.removeEventListener("copy", prevent);
      document.removeEventListener("paste", prevent);
      document.removeEventListener("contextmenu", prevent);
    };
  }, [phase]);

  //   Timer
  useEffect(() => {
    if (phase !== "exam" || isSubmitted) return;

    timerRef.current = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase, isSubmitted, tickTimer]);

  useEffect(() => {
    if (phase === "exam" && timeLeft === 0 && !isSubmitted && !isSubmitting) {
      submitExam(true).then(() => {
        if (useExamSessionStore.getState().isSubmitted) {
          setPhase("complete");
        }
      });
    }
  }, [timeLeft, phase, isSubmitted, isSubmitting, submitExam]);

  useEffect(() => {
    if (phase !== "exam" || isSubmitted) return;
    autoSaveRef.current = setInterval(() => {
      saveAnswers();
    }, 30000);
    return () => clearInterval(autoSaveRef.current);
  }, [phase, isSubmitted, saveAnswers]);

  const handleStart = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      toast.error(
        "Could not enter fullscreen. Please allow it in your browser."
      );
    }
    setPhase("exam");
  }, []);

  const handleManualSubmit = async () => {
    const answered = Object.keys(answers).filter((k) => {
      const a = answers[k];
      return (
        a !== undefined &&
        a !== null &&
        a !== "" &&
        !(Array.isArray(a) && a.length === 0)
      );
    }).length;
    const total = exam?.questions?.length || 0;
    const unanswered = total - answered;

    if (unanswered > 0) {
      const ok = window.confirm(
        `You have ${unanswered} unanswered question${
          unanswered > 1 ? "s" : ""
        }. Submit anyway?`
      );
      if (!ok) return;
    }
    await submitExam(false);
    if (useExamSessionStore.getState().isSubmitted) {
      setPhase("complete");
    }
  };

  const currentQ = exam?.questions?.[currentQuestion];
  const totalQ = exam?.questions?.length || 0;

  const handleAnswerChange = (questionId, value, type) => {
    if (type === "checkbox") {
      const current = Array.isArray(answers[questionId])
        ? answers[questionId]
        : [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setAnswer(questionId, updated);
    } else {
      setAnswer(questionId, value);
    }
  };

  const handleSkip = () => {
    if (currentQuestion < totalQ - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSaveContinue = () => {
    if (currentQuestion < totalQ - 1) {
      setCurrentQuestion(currentQuestion + 1);
      return;
    }
    handleManualSubmit();
  };

  if (phase === "loading") {
    return <LoadingScreen />;
  }

  if (phase === "error") {
    return (
      <ErrorScreen
        message={loadError}
        onBack={() => router.push("/candidate/dashboard")}
      />
    );
  }

  if (phase === "instructions") {
    return (
      <>
        <ToastContainer />
        <InstructionScreen exam={exam} onStart={handleStart} />
      </>
    );
  }

  if (phase === "complete") {
    return (
      <>
        <ToastContainer />
        <ResultScreen
          result={submissionResult}
          exam={exam}
          user={user}
          onBack={() => router.push("/candidate/dashboard")}
        />
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-[#F7F7F7] flex flex-col select-none">
        {warningMessage && (
          <div className="bg-red-600 text-white text-sm py-2 px-4 text-center font-medium z-50 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {warningMessage}
          </div>
        )}

        <ExamHeader user={user} />

        <main className="flex-1 flex flex-col justify-end pt-20">
          <ExamQuestionCard
            currentQuestion={currentQuestion}
            totalQuestions={totalQ}
            currentQ={currentQ}
            answers={answers}
            timeLeft={timeLeft}
            tabSwitchCount={tabSwitchCount}
            isSubmitting={isSubmitting}
            onSetTextAnswer={setAnswer}
            onAnswerChange={handleAnswerChange}
            onSkip={handleSkip}
            onSaveContinue={handleSaveContinue}
          />
        </main>

        <ExamFooter />
      </div>
    </>
  );
}
