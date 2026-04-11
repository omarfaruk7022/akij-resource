"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Step1EditForm,
  Step1ViewMode,
  Step2Questions,
  StepIndicator,
} from "@/components/employer/CreateExamSteps";
import { toast } from "@/components/ui/Toast";
import useExamStore from "@/store/useExamStore";

export default function CreateExamPage() {
  const router = useRouter();
  const { currentStep, step1Data, questions, setStep, reset } = useExamStore();
  const [submitting, setSubmitting] = useState(null);
  const [step1Mode, setStep1Mode] = useState("edit");

  const handleStep1Saved = () => setStep1Mode("view");
  const handleStep1Edit = () => setStep1Mode("edit");
  const handleGoToQuestions = () => setStep(2);

  const handleBackToBasicInfo = () => {
    setStep(1);
    setStep1Mode("view");
  };

  const handleSubmit = async (action) => {
    setSubmitting(action);
    try {
      const questionsPayload = questions.map((question) => {
        const payloadQuestion = { ...question };
        delete payloadQuestion._id;
        payloadQuestion.negativeMark = Number(step1Data.negativeMark) || 0;
        return payloadQuestion;
      });
      const payload = {
        ...step1Data,
        negativeMark: Number(step1Data.negativeMark) || 0,
        negativeMarking: (Number(step1Data.negativeMark) || 0) > 0,
        questions: questionsPayload,
        status: action === "publish" ? "published" : "draft",
      };
      const res = await axios.post("/api/exams", payload, {
        withCredentials: true,
      });
      const examId = res.data.exam._id;
      if (action === "publish" && questions.length > 0) {
        try {
          await axios.post(
            `/api/exams/${examId}/publish`,
            {},
            { withCredentials: true }
          );
        } catch {}
      }
      toast.success(
        action === "publish"
          ? "Exam published successfully!"
          : "Exam saved as draft"
      );
      reset();
      setStep1Mode("edit");
      router.push("/employer/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create exam");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-1 px-4 sm:px-6 md:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-[#E8E8E8] p-4 sm:p-6 mb-6">
            <h1 className="text-sm font-bold text-[#1A1A1A] mb-5">
              Manage Online Test
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <StepIndicator currentStep={currentStep} />
              <button
                type="button"
                onClick={() => router.push("/employer/dashboard")}
                className="w-full sm:w-auto text-xs font-medium text-[#1A1A1A] border border-[#D1D5DB] rounded px-4 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            {currentStep === 1 && step1Mode === "edit" && (
              <Step1EditForm onSaved={handleStep1Saved} />
            )}

            {currentStep === 1 && step1Mode === "view" && (
              <Step1ViewMode
                onEdit={handleStep1Edit}
                onContinue={handleGoToQuestions}
              />
            )}

            {currentStep === 2 && (
              <Step2Questions
                onBack={handleBackToBasicInfo}
                onSubmit={handleSubmit}
                isSubmitting={submitting}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
