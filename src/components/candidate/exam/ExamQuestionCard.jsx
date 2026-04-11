"use client";

import {
  AlertTriangle,
  AlignLeft,
  Bold,
  ChevronDown,
  Italic,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react";
import { formatTimer } from "@/lib/utils/helpers";
import RichEditor from "@/components/shared/RichEditor";
import { useRef } from "react";

export default function ExamQuestionCard({
  currentQuestion,
  totalQuestions,
  currentQ,
  answers,
  timeLeft,
  tabSwitchCount,
  isSubmitting,
  onSetTextAnswer,
  onAnswerChange,
  onSkip,
  onSaveContinue,
}) {
  const timerDanger = timeLeft <= 300;
  const editorRefs = useRef({});
  return (
    <div className="w-full max-w-[720px] mx-auto mb-[78px] px-4">
      {tabSwitchCount > 0 && (
        <div className="mb-3 flex items-center justify-center gap-1.5 text-orange-600 text-xs">
          <AlertTriangle className="w-3.5 h-3.5" />
          {tabSwitchCount} tab switch{tabSwitchCount > 1 ? "es" : ""} detected
        </div>
      )}

      <div className="flex items-center justify-between px-6 mb-4 bg-white rounded-lg border border-[#E9E9E9] shadow-sm p-5">
        <p className="text-sm font-medium text-[#252B42]">
          Question ({currentQuestion + 1}/{totalQuestions})
        </p>
        <div
          className={`w-[178px] h-10 rounded bg-[#F3F4F6] flex items-center justify-center text-sm font-semibold ${
            timerDanger ? "text-red-600 timer-danger" : "text-[#252B42]"
          }`}
        >
          {formatTimer(timeLeft)} left
        </div>
      </div>

      <section className="bg-white rounded-lg border border-[#E9E9E9] shadow-sm p-5">
        {currentQ && (
          <>
            <p className="text-[16px] leading-6 text-[#252B42] mb-4">
              Q{currentQuestion + 1}. {currentQ.title}
            </p>

            {currentQ.type === "text" ? (
              <div className="border border-[#E3E3E3] rounded overflow-hidden">
                {/* <div className="h-10 bg-[#FAFAFA] border-b border-[#EEEEEE] px-4 flex items-center gap-3 text-[#4E4E4E]">
                  <Undo2 className="w-3.5 h-3.5" />
                  <Redo2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Normal text</span>
                  <ChevronDown className="w-3 h-3 -ml-2" />
                  <span className="h-4 w-px bg-[#DADADA]" />
                  <AlignLeft className="w-3.5 h-3.5" />
                  <ChevronDown className="w-3 h-3 -ml-2" />
                  <Bold className="w-3.5 h-3.5" />
                  <Italic className="w-3.5 h-3.5" />
                  <Underline className="w-3.5 h-3.5" />
                </div> */}
                <RichEditor
                  contentRef={{
                    get current() {
                      return editorRefs.current[currentQ._id];
                    },
                    set current(el) {
                      editorRefs.current[currentQ._id] = el;
                    },
                  }}
                  value={answers[currentQ._id] || ""}
                  placeholder="Write your answer..."
                  onChange={(html) => onSetTextAnswer(currentQ._id, html)}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {currentQ.options?.map((option, optIdx) => {
                  const isChecked =
                    currentQ.type === "checkbox"
                      ? Array.isArray(answers[currentQ._id]) &&
                        answers[currentQ._id].includes(option)
                      : answers[currentQ._id] === option;

                  return (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
        ${
          isChecked
            ? "border-[#6C5CE7] bg-[#F4F2FF]"
            : "border-gray-200 bg-white hover:border-[#CFC9FF]"
        }`}
                    >
                      {/* Custom Input */}
                      <div
                        className={`flex items-center justify-center w-5 h-5 border shrink-0 ${
                          currentQ.type === "checkbox"
                            ? "rounded-[6px]"
                            : "rounded-full"
                        } ${
                          isChecked
                            ? "border-[#6C5CE7] bg-[#6C5CE7]"
                            : "border-gray-300"
                        }`}
                      >
                        {currentQ.type === "radio" && isChecked && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}

                        {currentQ.type === "checkbox" && isChecked && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Hidden input (for logic) */}
                      <input
                        type={
                          currentQ.type === "checkbox" ? "checkbox" : "radio"
                        }
                        name={`q-${currentQ._id}`}
                        value={option}
                        checked={isChecked}
                        onChange={() =>
                          onAnswerChange(currentQ._id, option, currentQ.type)
                        }
                        className="hidden"
                      />

                      <span className="text-sm text-gray-800">{option}</span>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={onSkip}
                disabled={currentQuestion === totalQuestions - 1}
                className="h-9 px-5 rounded border border-[#E4E4E4] bg-white text-[#252B42] text-xs font-semibold cursor-pointer hover:bg-[#FAFAFA] disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
              >
                Skip this Question
              </button>

              <button
                onClick={onSaveContinue}
                disabled={isSubmitting}
                className="h-9 px-8 rounded bg-primary text-white text-xs font-semibold cursor-pointer hover:bg-[#5522EE] disabled:opacity-50 transition-colors"
              >
                {isSubmitting
                  ? "Submitting..."
                  : currentQuestion === totalQuestions - 1
                    ? "Submit Exam"
                    : "Save & Continue"}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
