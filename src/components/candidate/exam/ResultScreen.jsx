"use client";

import { CheckCircle2, Clock3, XCircle } from "lucide-react";

export default function ResultScreen({ result, exam, user, onBack }) {
  const isTimeout = Boolean(result?.autoSubmitted);
  const title = isTimeout ? "Timeout!" : "Test Completed";
  const message = isTimeout
    ? `Dear ${user?.name || "Candidate"}, Your exam time has been finished. Thank you for participating.`
    : `Congratulations! ${user?.name || "Candidate"}, You have completed your ${exam?.title || "exam"}. Thank you for participating.`;

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 ${
        isTimeout ? "bg-black/35" : "bg-[#f4f4f4]"
      }`}
    >
      <div
        className={`bg-white border border-[#e9edf3] w-full text-center px-8 py-10 ${
          isTimeout
            ? "max-w-[460px] rounded-2xl shadow-2xl"
            : "max-w-[920px] rounded-2xl shadow-sm"
        }`}
      >
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center relative">
          {isTimeout ? (
            <>
              <Clock3 className="w-11 h-11 text-[#3f6ea3]" strokeWidth={1.7} />
              <span className="absolute right-1 bottom-1 w-5 h-5 rounded-full bg-[#ef5b6b] flex items-center justify-center">
                <XCircle className="w-3 h-3 text-white fill-white" />
              </span>
            </>
          ) : (
            <CheckCircle2 className="w-12 h-12 text-[#4a90e2] fill-[#4a90e2]" />
          )}
        </div>
        <h1 className="text-[28px] font-semibold text-[#2f3b4a] mb-4">{title}</h1>
        <p className="text-[13px] leading-6 text-[#738399] max-w-[720px] mx-auto mb-8">
          {message}
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center min-w-36 px-5 py-2.5 rounded-lg border border-[#d9e1ea] bg-white text-[#39495d] text-sm font-medium cursor-pointer hover:bg-[#f8fafc] transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
