"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ToastContainer from "@/components/ui/Toast";
import useAuthStore from "@/store/useAuthStore";

function getPageLabel(pathname) {
  if (pathname.includes("/exam/")) return "Online Test";
  return "Dashboard";
}

export default function CandidateLayout({ children }) {
  const { user, token, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (user && user.role !== "candidate") {
      router.replace("/employer/dashboard");
    }
  }, [_hasHydrated, token, user, router]);

  if (!_hasHydrated) return null;

  if (!token || !user || user.role !== "candidate") {
    return <ToastContainer />;
  }

  if (pathname.includes("/exam/")) {
    return children;
  }

  return (
    <div className="flex flex-col h-screen bg-[#F5F5F5]">
      <Navbar activePage={getPageLabel(pathname)} />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <Footer />
      <ToastContainer />
    </div>
  );
}
