"use client";
// src/app/employer/create-exam/page.jsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import {
  ChevronDown,
  Pencil,
  Plus,
  Trash2,
  Circle,
  CheckSquare,
  Type,
  AlertCircle,
  Clock,
  Edit3,
  CheckCircle2,
} from "lucide-react";
import QuestionModal from "@/components/employer/QuestionModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import useExamStore from "@/store/useExamStore";
import { cn } from "@/lib/utils/helpers";

/* ─── Zod schema ─────────────────────────────────────────── */
const step1Schema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    totalCandidates: z.coerce
      .number()
      .min(1, "Must allow at least 1 candidate"),
    totalSlots: z.coerce.number().min(1, "Must have at least 1 slot"),
    questionSets: z.coerce.number().min(1).default(1),
    questionType: z.enum(["MCQ", "radio", "checkbox", "text", "mixed"]),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  })
  .refine((d) => new Date(d.endTime) > new Date(d.startTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });

const questionTypeIcons = {
  radio: Circle,
  checkbox: CheckSquare,
  text: Type,
  MCQ: Circle,
  mixed: CheckSquare,
};
const questionTypeLabels = {
  radio: "Single Choice",
  checkbox: "Multiple Choice",
  text: "Text",
  MCQ: "MCQ",
  mixed: "Mixed",
};

const TOTAL_SLOTS_OPTIONS = [1, 2, 3, 4, 5, 10, 15, 20, 25, 50];
const QUESTION_SET_OPTIONS = [1, 2, 3, 4, 5];

/* ─── Step indicator ─────────────────────────────────────── */
function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center gap-0">
      <div className="flex items-center gap-2">
        <div
          className={currentStep >= 1 ? "step-dot-active" : "step-dot-inactive"}
        >
          1
        </div>
        <span
          className={cn(
            "text-xs font-medium",
            currentStep >= 1 ? "text-[#6633FF]" : "text-gray-400"
          )}
        >
          Basic Info
        </span>
      </div>
      <div
        className={cn(
          "mx-3",
          currentStep > 1 ? "step-line-done" : "step-line-todo"
        )}
      />
      <div className="flex items-center gap-2">
        <div
          className={currentStep >= 2 ? "step-dot-active" : "step-dot-inactive"}
        >
          2
        </div>
        <span
          className={cn(
            "text-xs font-medium",
            currentStep >= 2 ? "text-[#6633FF]" : "text-gray-400"
          )}
        >
          Questions
        </span>
      </div>
    </div>
  );
}

/* ─── Select wrapper ─────────────────────────────────────── */
function SelectWrapper({ children }) {
  return (
    <div className="relative">
      {children}
      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </div>
    </div>
  );
}

/* ─── Basic Info — Edit Form ─────────────────────────────── */
function Step1EditForm({ onSaved }) {
  const { step1Data, updateStep1 } = useExamStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: { questionType: "MCQ", questionSets: 1, ...step1Data },
  });

  const onSubmit = (data) => {
    updateStep1(data);
    onSaved(); // switch to view mode
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="bg-white rounded-lg border border-[#E8E8E8] p-6">
        <h2 className="text-sm font-semibold text-[#1A1A1A] mb-5">
          Basic Information
        </h2>

        {/* Title */}
        <div className="mb-4">
          <label className="exam-label">
            Online Test Title <span className="text-red-500">*</span>
          </label>
          <input
            {...register("title")}
            className="exam-input"
            placeholder="Enter online test title"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Candidates + Slots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="exam-label">
              Total Candidates <span className="text-red-500">*</span>
            </label>
            <input
              {...register("totalCandidates")}
              type="number"
              min="1"
              className="exam-input"
              placeholder="Enter total candidates"
            />
            {errors.totalCandidates && (
              <p className="mt-1 text-xs text-red-500">
                {errors.totalCandidates.message}
              </p>
            )}
          </div>
          <div>
            <label className="exam-label">
              Total Slots <span className="text-red-500">*</span>
            </label>
            <SelectWrapper>
              <select {...register("totalSlots")} className="exam-select">
                <option value="">Select total shots</option>
                {TOTAL_SLOTS_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </SelectWrapper>
            {errors.totalSlots && (
              <p className="mt-1 text-xs text-red-500">
                {errors.totalSlots.message}
              </p>
            )}
          </div>
        </div>

        {/* Question Set + Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="exam-label">
              Total Question Set <span className="text-red-500">*</span>
            </label>
            <SelectWrapper>
              <select {...register("questionSets")} className="exam-select">
                <option value="">Select total question set</option>
                {QUESTION_SET_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </SelectWrapper>
          </div>
          <div>
            <label className="exam-label">
              Question Type <span className="text-red-500">*</span>
            </label>
            <SelectWrapper>
              <select {...register("questionType")} className="exam-select">
                <option value="">Select question type</option>
                <option value="MCQ">MCQ</option>
                <option value="radio">Single Choice (Radio)</option>
                <option value="checkbox">Multiple Choice</option>
                <option value="text">Text Answer</option>
                <option value="mixed">Mixed</option>
              </select>
            </SelectWrapper>
            {errors.questionType && (
              <p className="mt-1 text-xs text-red-500">
                {errors.questionType.message}
              </p>
            )}
          </div>
        </div>

        {/* Start Time + End Time + Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="exam-label">
              Start Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                {...register("startTime")}
                type="datetime-local"
                className="exam-input"
              />
              <Clock className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            </div>
            {errors.startTime && (
              <p className="mt-1 text-xs text-red-500">
                {errors.startTime.message}
              </p>
            )}
          </div>
          <div>
            <label className="exam-label">
              End Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                {...register("endTime")}
                type="datetime-local"
                className="exam-input"
              />
              <Clock className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            </div>
            {errors.endTime && (
              <p className="mt-1 text-xs text-red-500">
                {errors.endTime.message}
              </p>
            )}
          </div>
          <div>
            <label className="exam-label">Duration</label>
            <input
              {...register("duration")}
              type="number"
              min="1"
              className="exam-input"
              placeholder="Duration Time"
            />
            {errors.duration && (
              <p className="mt-1 text-xs text-red-500">
                {errors.duration.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          className="btn-cancel"
          onClick={() => router.push("/employer/dashboard")}
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Save &amp; Continue
        </button>
      </div>
    </form>
  );
}

/* ─── Basic Info — View Mode ─────────────────────────────── */
function Step1ViewMode({ onEdit, onContinue }) {
  const { step1Data } = useExamStore();
  const router = useRouter();
  const d = step1Data;
  const qTypeLabel = questionTypeLabels[d.questionType] || d.questionType;

  return (
    <div>
      <div className="bg-white rounded-lg border border-[#E8E8E8] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-[#1A1A1A]">
            Basic Information
          </h2>
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 text-[#6633FF] text-xs font-medium hover:opacity-80 transition-opacity"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        {/* Title */}
        <div className="mb-5">
          <p className="view-label">Online Test Title</p>
          <p className="view-value">{d.title || "—"}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 mb-4">
          <div>
            <p className="view-label">Total Candidates</p>
            <p className="view-value">
              {d.totalCandidates
                ? Number(d.totalCandidates).toLocaleString()
                : "—"}
            </p>
          </div>
          <div>
            <p className="view-label">Total Slots</p>
            <p className="view-value">{d.totalSlots || "—"}</p>
          </div>
          <div>
            <p className="view-label">Total Question Set</p>
            <p className="view-value">{d.questionSets || "—"}</p>
          </div>
          <div>
            <p className="view-label">Duration Per Slots (Minutes)</p>
            <p className="view-value">{d.duration || "—"}</p>
          </div>
        </div>

        {/* Question type */}
        <div>
          <p className="view-label">Question Type</p>
          <p className="view-value">{qTypeLabel || "—"}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          className="btn-cancel"
          onClick={() => router.push("/employer/dashboard")}
        >
          Cancel
        </button>
        <button type="button" className="btn-primary" onClick={onContinue}>
          Save &amp; Continue
        </button>
      </div>
    </div>
  );
}

/*  Step 2 — Questions  */
function Step2Questions({ onBack, onSubmit, isSubmitting }) {
  const { questions, addQuestion, updateQuestion, removeQuestion } =
    useExamStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  console.log(questions);
  const handleSave = (question) => {
    if (editingQuestion) {
      updateQuestion(editingQuestion._id, question);
      toast.success("Question updated");
    } else {
      addQuestion(question);
      toast.success("Question added");
    }
    setEditingQuestion(null);
  };

  const handleEdit = (q) => {
    setEditingQuestion(q);
    setModalOpen(true);
  };
  const handleDelete = (q) => {
    removeQuestion(q._id);
    toast.success("Question removed");
    setDeleteTarget(null);
  };

  return (
    <div>
      {questions.length !== 0 && (
        <div className="min-h-screen">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-6">
              {questions.map((q, idx) => {
                const correctSet = new Set(q.correctAnswer || []);

                return (
                  <div
                    key={q._id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6 border-b border-gray-200">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Question {idx + 1}
                      </h3>

                      <div className="flex gap-4 text-sm text-gray-600">
                        <span className="font-medium">
                          {q.type === "checkbox" ? "MCQ" : q.type}
                        </span>

                        <span className="font-medium">{q.marks} pt</span>
                      </div>
                    </div>
                    {/* Question Title */}
                    <div className="p-4 sm:p-6">
                      {q.type === "checkbox" || q.type === "radio" ? (
                        <>
                          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-6">
                            {q.title}
                          </h2>

                          {/* MCQ/Radio Options */}
                          <div className="space-y-2 mb-8">
                            {q.options?.map((opt, i) => {
                              const isCorrect = correctSet.has(String(i));

                              return (
                                <div
                                  key={i}
                                  className={`flex items-center justify-between p-3 sm:p-4 rounded transition-colors ${
                                    isCorrect
                                      ? "bg-gray-100"
                                      : "bg-gray-50 hover:bg-gray-100"
                                  }`}
                                >
                                  <span
                                    className={`text-sm sm:text-base ${
                                      isCorrect
                                        ? "font-medium text-gray-900"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {String.fromCharCode(65 + i)}. {opt}
                                  </span>

                                  {/* Icon based on type */}
                                  {isCorrect &&
                                    (q.type === "radio" ? (
                                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 fill-green-500" />
                                    ) : (
                                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    ))}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <>
                          <h2 className="text-base sm:text-lg font-semibold text-gray-900 pb-4 border-b border-gray-200 mb-6">
                            {q.title}
                          </h2>

                          {/* Text Answer Area */}
                          <div className="mb-8">
                            <div className=" p-4 bg-white min-h-32">
                              <p className="text-sm sm:text-md text-gray-700 leading-relaxed">
                                {q.correctAnswer}
                              </p>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Footer Actions */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-gray-200">
                        <button
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors text-sm sm:text-base font-medium"
                          onClick={() => handleEdit(q)}
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors text-sm sm:text-base font-medium"
                          onClick={() => handleDelete(q)}
                        >
                          Remove From Exam
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center">
        <button
          type="button"
          className="btn-primary w-full"
          onClick={() => setModalOpen(true)}
        >
          Add First Question
        </button>
      </div>

      {questions.length === 0 && (
        <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            Add at least one question before publishing.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <button type="button" className="btn-cancel" onClick={onBack}>
          Cancel
        </button>
        <div className="flex items-center gap-3">
          {/* <button
            type="button"
            className="btn-cancel"
            onClick={() => onSubmit("draft")}
            disabled={!!isSubmitting}
          >
            {isSubmitting === "draft" ? "Saving…" : "Save as Draft"}
          </button> */}
          <button
            type="button"
            className="btn-primary"
            onClick={() => onSubmit("publish")}
            disabled={questions.length === 0 || !!isSubmitting}
          >
            {isSubmitting === "publish" ? "Publishing…" : "Save & Continue"}
          </button>
        </div>
      </div>

      <QuestionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleSave}
        initialData={editingQuestion}
      />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget)}
        title="Delete Question?"
        message="This question will be permanently removed."
        confirmLabel="Delete"
      />
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function CreateExamPage() {
  const router = useRouter();
  const { currentStep, step1Data, questions, setStep, reset } = useExamStore();
  const [submitting, setSubmitting] = useState(null);

  // 3 UI states for step 1: 'edit' | 'view'
  const [step1Mode, setStep1Mode] = useState("edit");

  // Called when form validates & saves → show view mode
  const handleStep1Saved = () => setStep1Mode("view");

  // Called from Edit button in view mode → back to edit
  const handleStep1Edit = () => setStep1Mode("edit");

  // Called from "Save & Continue" in view mode → go to step 2
  const handleGoToQuestions = () => setStep(2);

  // Called from Cancel in step 2 → back to step 1 view mode
  const handleBackToBasicInfo = () => {
    setStep(1);
    setStep1Mode("view");
  };

  const handleSubmit = async (action) => {
    setSubmitting(action);
    try {
      const payload = {
        ...step1Data,
        questions: questions.map(({ _id, ...q }) => q),
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
      <div className="flex-1 px-6 md:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Step header card */}
          <div className="bg-white rounded-lg border border-[#E8E8E8] p-6 mb-6">
            <h1 className="text-sm font-bold text-[#1A1A1A] mb-5">
              Manage Online Test
            </h1>
            <div className="flex items-center justify-between">
              <StepIndicator currentStep={currentStep} />
              <button
                type="button"
                onClick={() => router.push("/employer/dashboard")}
                className="text-xs font-medium text-[#1A1A1A] border border-[#D1D5DB] rounded px-4 py-1.5 hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Step 1 — Edit */}
          <div className="max-w-5xl mx-auto">
            {currentStep === 1 && step1Mode === "edit" && (
              <Step1EditForm onSaved={handleStep1Saved} />
            )}

            {/* Step 1 — View */}
            {currentStep === 1 && step1Mode === "view" && (
              <Step1ViewMode
                onEdit={handleStep1Edit}
                onContinue={handleGoToQuestions}
              />
            )}

            {/* Step 2 — Questions only, no BasicInfoView */}
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
