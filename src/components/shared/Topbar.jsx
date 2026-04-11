"use client";
import { Bell } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";

export default function Topbar({ title, subtitle }) {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
     
    </header>
  );
}
