"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";

export default function ExamHeader({ user }) {
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((namePart) => namePart[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";
  const refId = user?._id
    ? String(user._id).slice(-8).toUpperCase()
    : "1234134";

  return (
    <header className="h-[58px] bg-white flex items-center justify-between px-12 flex-shrink-0 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="w-44 flex items-center">
        <Image
          src="/images/logo.png"
          alt="Akij Resource"
          width={104}
          height={32}
          priority
        />
      </div>

      <h1 className="text-[#252B42] text-base font-semibold tracking-wide hidden md:block">
        Akij Resource
      </h1>

      <div className="w-44 flex items-center justify-end gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#E9E9E9] flex items-center justify-center text-[11px] font-semibold text-[#555]">
          {initials}
        </div>
        <div className="min-w-0 text-right">
          <p className="text-[11px] leading-tight text-[#1A1A1A] font-medium truncate max-w-24">
            {user?.name || "Jhon Smit Doe..."}
          </p>
          <p className="text-[9px] leading-tight text-[#9A9A9A]">
            Ref ID: {refId}
          </p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-[#777]" />
      </div>
    </header>
  );
}
