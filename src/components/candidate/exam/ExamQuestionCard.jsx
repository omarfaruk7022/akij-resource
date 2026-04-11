"use client";

import { AlertTriangle } from "lucide-react";
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
    <div className="w-full max-w-4xl mx-auto mb-[78px] px-4">
      {/* Tab warning */}
      {tabSwitchCount > 0 && (
        <div className="mb-4 flex items-center justify-center gap-2 text-orange-600 text-sm">
          <AlertTriangle className="w-4 h-4" />
          {tabSwitchCount} tab switch{tabSwitchCount > 1 ? "es" : ""} detected
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 bg-white rounded-[15px] border border-gray-200 px-4 sm:px-8 py-4 sm:py-6">
        <p className="text-sm sm:text-base font-semibold text-[#252B42]">
          Question ({currentQuestion + 1}/{totalQuestions})
        </p>

        <div
          className={`w-full sm:w-[200px] h-10 sm:h-12 rounded-[10px] bg-[#F3F4F6] flex items-center justify-center text-sm sm:text-base font-semibold ${
            timerDanger ? "text-red-600" : "text-[#252B42]"
          }`}
        >
          {formatTimer(timeLeft)} left
        </div>
      </div>

      {/* Main Card */}
      <section className="bg-white rounded-[15px] border border-gray-200 p-7">
        {currentQ && (
          <>
            {/* Question */}
            <p className="text-[18px] leading-7 text-[#252B42] mb-6 font-medium">
              Q{currentQuestion + 1}. {currentQ.title}
            </p>

            {/* TEXT TYPE */}
            {currentQ.type === "text" ? (
              <div className="border border-[#E3E3E3] rounded-2xl overflow-hidden">
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
              /* OPTIONS */
              <div className="space-y-4">
                {currentQ.options?.map((option, optIdx) => {
                  const isChecked =
                    currentQ.type === "checkbox"
                      ? Array.isArray(answers[currentQ._id]) &&
                        answers[currentQ._id].includes(option)
                      : answers[currentQ._id] === option;

                  return (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-4 p-5 rounded-2xl border cursor-pointer transition-all
                      ${
                        isChecked
                          ? "border-[#6C5CE7] bg-[#F4F2FF]"
                          : "border-gray-200 bg-white hover:border-[#CFC9FF]"
                      }`}
                    >
                      {/* Custom Input */}
                      <div
                        className={`flex items-center justify-center w-6 h-6 border shrink-0 ${
                          currentQ.type === "checkbox"
                            ? "rounded-md"
                            : "rounded-full"
                        } ${
                          isChecked
                            ? "border-[#6C5CE7] bg-[#6C5CE7]"
                            : "border-gray-300"
                        }`}
                      >
                        {currentQ.type === "radio" && isChecked && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full" />
                        )}

                        {currentQ.type === "checkbox" && isChecked && (
                          <svg
                            className="w-3.5 h-3.5 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Hidden input */}
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

                      {/* Option Text */}
                      <span className="text-base text-gray-800">{option}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-between mt-8 flex-col sm:flex-row gap-4">
              <button
                onClick={onSkip}
                disabled={currentQuestion === totalQuestions - 1}
                className="h-11 px-6 rounded-[12px] border border-[#E4E4E4] bg-white text-sm font-semibold hover:bg-[#FAFAFA] disabled:opacity-45"
              >
                Skip this Question
              </button>

              <button
                onClick={onSaveContinue}
                disabled={isSubmitting}
                className="h-11 px-10 rounded-[12px] bg-primary text-white text-sm font-semibold hover:bg-[#5522EE] disabled:opacity-50"
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
