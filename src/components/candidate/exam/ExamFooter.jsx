"use client";

import Image from "next/image";
import { Mail, Phone } from "lucide-react";

export default function ExamFooter() {
  return (
    <footer className="h-[65px] bg-[#120D2C] text-white flex items-center justify-between px-12 flex-shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/85">Powered by</span>
        <Image
          src="/images/logo-white.png"
          alt="Akij Resource"
          width={96}
          height={26}
        />
      </div>

      <div className="flex items-center gap-4 text-xs text-white/85">
        <span>Helpline</span>
        <span className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5" />
          +88 0112020505
        </span>
        <span className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" />
          support@akij.work
        </span>
      </div>
    </footer>
  );
}
