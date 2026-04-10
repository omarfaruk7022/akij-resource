"use client";
// src/components/shared/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import { toast } from "@/components/ui/Toast";
import Image from "next/image";

export default function Navbar({ activePage = "Dashboard" }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  // Ref ID mock — use user._id or a fallback
  const refId = user?._id
    ? `Ref. ID : ${String(user._id).slice(-8).toUpperCase()}`
    : "Ref. ID : 16101121";

  return (
    <header className="h-[60px] bg-white flex items-center justify-between px-6 md:px-12 flex-shrink-0 w-full z-40">
      {/* Logo */}
      <div className="flex items-center gap-0 select-none">
        <Image src="/images/logo.png" alt="Logo" width={100} height={100} />
      </div>

      {/* Center — active page label */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden sm:block">
        <span className="text-white text-sm font-medium">{activePage}</span>
      </div>

      {/* Right — user info */}
      {user && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#E05A3A] flex items-center justify-center flex-shrink-0 shadow">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            {/* Name + Ref */}
            <div className="text-right hidden sm:block">
              <p className=" text-xs font-semibold leading-tight">
                {user?.name || "Arif Hossain"}
              </p>
              <p className="text-gray-400 text-[10px] leading-tight">{refId}</p>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-11 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-800">
                  {user?.name || "User"}
                </p>
                <p className="text-[11px] text-gray-400 truncate">
                  {user?.email || ""}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 cursor-pointer transition-colors font-medium"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
