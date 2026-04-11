"use client";

import Image from "next/image";


export default function Footer() {
  return (
    <footer className="bg-secondary min-h-[52px] flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 px-4 sm:px-6 md:px-12 py-3 sm:py-0 flex-shrink-0 w-full">
      {/* Left — Powered by + Logo */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-xs font-normal">Powered by</span>
        <div className="flex items-center gap-0 select-none">
          <Image
            src="/images/logo-white.png"
            alt="Logo"
            width={100}
            height={100}
          />
        </div>
      </div>

      {/* Right — Helpline info */}
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-5">
        <span className="text-gray-400 text-xs font-medium hidden sm:inline">
          Helpline
        </span>
        <div className="flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <span className="text-gray-300 text-xs whitespace-nowrap">+88 011020202505</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span className="text-gray-300 text-xs whitespace-nowrap">support@akij.work</span>
        </div>
      </div>
    </footer>
  );
}
