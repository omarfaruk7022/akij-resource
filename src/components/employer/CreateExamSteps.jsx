"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Edit3,
  Pencil,
  Trash2,
} from "lucide-react";
import QuestionModal from "@/components/employer/QuestionModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import useExamStore from "@/store/useExamStore";
import { cn } from "@/lib/utils/helpers";
import QuestionMultiSelect from "./QuestionMultiSelect";

const step1Schema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    totalCandidates: z.coerce
      .number()
      .min(1, "Must allow at least 1 candidate"),
    totalSlots: z.coerce.number().min(1, "Must have at least 1 slot"),
    questionSets: z.coerce.number().min(1).default(1),
    // Changed: array of enums instead of single enum
    questionType: z
      .array(z.enum(["checkbox", "radio", "text"]))
      .min(1, "Select at least one question type"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
    negativeMark: z.coerce
      .number()
      .min(0, "Negative mark cannot be negative")
      .default(0),
  })
  .refine((d) => new Date(d.endTime) > new Date(d.startTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });

const questionTypeLabels = {
  radio: "MCQ",
  checkbox: "Checkbox",
  text: "Text",
};

const QUESTION_TYPE_OPTIONS = [
  { value: "radio", label: "MCQ" },
  { value: "checkbox", label: "Checkbox" },
  { value: "text", label: "Text" },
];

const TOTAL_SLOTS_OPTIONS = [1, 2, 3, 4, 5, 10, 15, 20, 25, 50];
const QUESTION_SET_OPTIONS = [1, 2, 3, 4, 5];

export function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center gap-0 flex-wrap">
      <div className="flex items-center gap-2">
        <div
          className={currentStep >= 1 ? "step-dot-active" : "step-dot-inactive"}
        >
          1
        </div>
        <span
          className={cn(
            "text-xs font-medium",
            currentStep >= 1 ? "text-primary" : "text-gray-400",
          )}
        >
          Basic Info
        </span>
      </div>
      <div
        className={cn(
          "mx-3 w-8 sm:w-auto",
          currentStep > 1 ? "step-line-done" : "step-line-todo",
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
            currentStep >= 2 ? "text-primary" : "text-gray-400",
          )}
        >
          Questions
        </span>
      </div>
    </div>
  );
}

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

export function Step1EditForm({ onSaved }) {
  const { step1Data, updateStep1 } = useExamStore();
  const router = useRouter();

  // Normalize stored questionType to always be an array for defaultValues
  const normalizedQuestionType = Array.isArray(step1Data?.questionType)
    ? step1Data.questionType
    : step1Data?.questionType
      ? [step1Data.questionType]
      : ["checkbox"];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      questionSets: 1,
      ...step1Data,
      questionType: normalizedQuestionType,
    },
  });

  const onSubmit = (data) => {
    updateStep1(data);
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="bg-white rounded-lg border border-[#E8E8E8] p-6">
        <h2 className="text-sm font-semibold text-[#1A1A1A] mb-5">
          Basic Information
        </h2>

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
            <QuestionMultiSelect
              options={QUESTION_TYPE_OPTIONS}
              register={register}
              watch={watch}
              setValue={setValue}
              error={errors.questionType?.message}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
          <div>
            <label className="exam-label">Negative Mark</label>
            <input
              {...register("negativeMark")}
              type="number"
              min="0"
              step="0.25"
              className="exam-input"
              placeholder="0"
            />
            {errors.negativeMark && (
              <p className="mt-1 text-xs text-red-500">
                {errors.negativeMark.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 bg-white p-4 rounded-lg">
        <button
          type="button"
          className="btn-cancel w-full sm:w-auto cursor-pointer"
          onClick={() => router.push("/employer/dashboard")}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary w-full sm:w-auto cursor-pointer"
        >
          Save &amp; Continue
        </button>
      </div>
    </form>
  );
}

export function Step1ViewMode({ onEdit, onContinue }) {
  const { step1Data } = useExamStore();
  const router = useRouter();
  const d = step1Data;

  // Normalize to array and map to labels
  const qTypeLabels = Array.isArray(d.questionType)
    ? d.questionType.map((t) => questionTypeLabels[t] || t).join(", ")
    : questionTypeLabels[d.questionType] || d.questionType || "—";

  return (
    <div>
      <div className="bg-white rounded-lg border border-[#E8E8E8] p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <h2 className="text-sm font-semibold text-[#1A1A1A]">
            Basic Information
          </h2>
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 text-primary text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        <div className="mb-5">
          <p className="view-label">Online Test Title</p>
          <p className="view-value">{d.title || "—"}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-4 mb-4">
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
          <div>
            <p className="view-label">Negative Mark</p>
            <p className="view-value">{d.negativeMark || 0}</p>
          </div>
        </div>

        <div>
          <p className="view-label">Question Type</p>
          <p className="view-value">{qTypeLabels}</p>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 bg-white p-4 rounded-lg">
        <button
          type="button"
          className="btn-cancel w-full sm:w-auto cursor-pointer"
          onClick={() => router.push("/employer/dashboard")}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn-primary w-full sm:w-auto cursor-pointer"
          onClick={onContinue}
        >
          Save &amp; Continue
        </button>
      </div>
    </div>
  );
}

export function Step2Questions({ onBack, onSubmit, isSubmitting }) {
  const { questions, addQuestion, updateQuestion, removeQuestion } =
    useExamStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

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
        <div className="">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-6">
              {questions.map((q, idx) => {
                const correctSet = new Set(
                  q.type === "radio" && Array.isArray(q.correctAnswer)
                    ? q.correctAnswer.slice(0, 1)
                    : Array.isArray(q.correctAnswer)
                      ? q.correctAnswer
                      : q.correctAnswer
                        ? [q.correctAnswer]
                        : [],
                );

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
                          {q.type === "radio"
                            ? "MCQ"
                            : q.type === "checkbox"
                              ? "Checkbox"
                              : "Text"}
                        </span>

                        <span className="font-medium">{q.marks} pt</span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6">
                      {q.type === "checkbox" || q.type === "radio" ? (
                        <>
                          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-6">
                            {q.title}
                          </h2>

                          <div className="space-y-2 mb-8">
                            {q.options?.map((opt, i) => {
                              const isCorrect =
                                correctSet.has(opt) ||
                                correctSet.has(String(i));

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

                                  {isCorrect &&
                                    (q.type === "radio" ? (
                                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 " />
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

                          <div className="mb-8">
                            <div className="p-4 bg-white min-h-32">
                              <p className="text-sm sm:text-md text-gray-700 leading-relaxed">
                                {q.correctAnswer}
                              </p>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          className="flex items-center justify-center sm:justify-start gap-2 text-primary hover:text-blue-700 cursor-pointer transition-colors text-sm sm:text-base font-medium"
                          onClick={() => handleEdit(q)}
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="flex items-center justify-center sm:justify-start gap-2 text-red-500 hover:text-red-600 cursor-pointer transition-colors text-sm sm:text-base font-medium"
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

      <div className="flex flex-col items-center justify-center mt-5 bg-white p-4 rounded-lg">
        <button
          type="button"
          className="btn-primary w-full cursor-pointer"
          onClick={() => setModalOpen(true)}
        >
          Add Question
        </button>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 bg-white p-4 rounded-lg">
        <button
          type="button"
          className="btn-cancel w-full sm:w-auto cursor-pointer"
          onClick={onBack}
        >
          Cancel
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            className="btn-primary w-full sm:w-auto cursor-pointer"
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
