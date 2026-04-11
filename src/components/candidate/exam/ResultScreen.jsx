"use client";

import Image from "next/image";

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
            ? "max-w-[860px] rounded-2xl shadow-2xl"
            : "max-w-[1040px] rounded-2xl shadow-sm"
        }`}
      >
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          {isTimeout ? (
            <Image
              src="/images/timeout.png"
              alt="Exam timed out"
              width={56}
              height={56}
              priority
            />
          ) : (
            <Image
              src="/images/correct.png"
              alt="Exam submitted successfully"
              width={56}
              height={56}
              priority
            />
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
