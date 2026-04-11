"use client";

import { AlertTriangle, BookOpen, Clock } from "lucide-react";
import { formatDuration } from "@/lib/utils/helpers";

export default function CandidateExamCard({ exam, onStart }) {
  const duration = exam.duration;
  const questions =
    exam.questionCount ?? exam.questions?.length ?? exam.questionSets;
  const negativeMark = exam.negativeMark ?? 0;
  const now = new Date();
  const start = new Date(exam.startTime);
  const end = new Date(exam.endTime);
  const isCompleted = Boolean(exam.hasCompleted);
  const isActive = !isCompleted && now >= start && now <= end;
  const actionLabel = isCompleted
    ? "Completed"
    : now < start
      ? "Starts Soon"
      : now > end
        ? "Ended"
        : "Start Exam";

  return (
    <div className="bg-white rounded-lg border border-[#E8E8E8] p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      <h3 className="text-[#1A1A1A] text-sm font-semibold leading-snug line-clamp-2">
        {exam.title}
      </h3>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#888]" />
          <span className="text-[11px] text-[#888]">Duration:</span>
          <span
            className={`text-[11px] font-semibold ${
              duration ? "text-[#FF6B00]" : "text-[#888]"
            }`}
          >
            {duration ? formatDuration(duration) : "Not Set"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#888]" />
          <span className="text-[11px] text-[#888]">Question:</span>
          <span
            className={`text-[11px] font-semibold ${
              questions ? "text-[#1A1A1A]" : "text-[#888]"
            }`}
          >
            {questions != null ? questions : "Not Set"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-[#888]" />
          <span className="text-[11px] text-[#888]">Negative Mark:</span>
          <span className="text-[11px] font-semibold text-[#1A1A1A]">
            {negativeMark}
          </span>
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => onStart(exam._id)}
          disabled={!isActive}
          className="
    px-5 py-2 rounded-lg
    border border-primary
    text-primary text-sm font-medium

    transition-all duration-200 ease-in-out

    hover:bg-primary hover:!text-white hover:shadow-md

    active:scale-95

    disabled:opacity-50
    disabled:cursor-not-allowed
    disabled:hover:bg-transparent
    disabled:hover:text-primary
    disabled:hover:shadow-none
    disabled:active:scale-100
  "
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
