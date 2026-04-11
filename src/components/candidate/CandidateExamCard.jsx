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

      <div className="flex items-center gap-8 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#334155]" />
          <span className="text-[13px] text-[#334155]">Duration:</span>
          <span
            className={`text-[13px] font-semibold ${
              duration ? "" : "text-[#334155]"
            }`}
          >
            {duration ? formatDuration(duration) : "Not Set"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 17H16"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M8 13H12"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M13 2.5V3C13 5.82843 13 7.24264 13.8787 8.12132C14.7574 9 16.1716 9 19 9H19.5M20 10.6569V14C20 17.7712 20 19.6569 18.8284 20.8284C17.6569 22 15.7712 22 12 22C8.22876 22 6.34315 22 5.17157 20.8284C4 19.6569 4 17.7712 4 14V9.45584C4 6.21082 4 4.58831 4.88607 3.48933C5.06508 3.26731 5.26731 3.06508 5.48933 2.88607C6.58831 2 8.21082 2 11.4558 2C12.1614 2 12.5141 2 12.8372 2.11401C12.9044 2.13772 12.9702 2.165 13.0345 2.19575C13.3436 2.34355 13.593 2.593 14.0919 3.09188L18.8284 7.82843C19.4065 8.40649 19.6955 8.69552 19.8478 9.06306C20 9.4306 20 9.83935 20 10.6569Z"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span className="text-[13px] text-[#334155]">Question:</span>
          <span
            className={`text-[13px] font-semibold ${
              questions ? "text-[#1A1A1A]" : "text-[#334155]"
            }`}
          >
            {questions != null ? questions : "Not Set"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.0001 1.66675C14.6024 1.66675 18.3334 5.39771 18.3334 10.0001C18.3334 14.6025 14.6024 18.3334 10.0001 18.3334C5.39771 18.3334 1.66675 14.6025 1.66675 10.0001M7.42425 2.07247C6.58341 2.34548 5.80121 2.74855 5.10136 3.25792M3.25794 5.10133C2.74846 5.80131 2.34535 6.58368 2.07233 7.42468"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12.4995 12.5L7.5 7.5M7.50053 12.5L12.5 7.5"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span className="text-[13px] text-[#334155]">Negative Marking:</span>
          <span className="text-[13px] text-[#1A1A1A]">
            -{negativeMark}/Wrong
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
