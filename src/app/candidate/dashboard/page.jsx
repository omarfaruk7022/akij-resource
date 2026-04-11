"use client";
// src/app/candidate/dashboard/page.jsx
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BookOpen } from "lucide-react";
import CandidateExamCard from "@/components/candidate/CandidateExamCard";

async function fetchAvailableExams() {
  const res = await axios.get("/api/exams", { withCredentials: true });
  return res.data.exams;
}

const ITEMS_PER_PAGE_OPTIONS = [5, 8, 10, 20];

export default function CandidateDashboard() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ["candidate-exams"],
    queryFn: fetchAvailableExams,
    refetchInterval: 30000, // refresh every 30s to catch newly started exams
  });

  const handleStart = (examId) => {
    router.push(`/candidate/exam/${examId}`);
  };

  const filteredExams = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return exams;
    return exams.filter((exam) => exam.title?.toLowerCase().includes(query));
  }, [exams, search]);

  const totalPages = Math.ceil(filteredExams.length / perPage);
  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <div className="min-h-full flex flex-col max-w-9/10 mx-auto">
      <div className="flex-1 px-6 md:px-8 py-6">
        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
          <h2 className="text-[#1A1A1A] text-base font-bold">Online Tests</h2>

          <div className="flex items-center gap-3 flex-1 max-w-sm ml-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search exam title..."
                className="w-full h-9 pl-3 pr-9 text-xs border border-[#DADADA] rounded bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
              />
              <div className="absolute right-0 top-0 h-9 w-9 flex items-center justify-center bg-primary rounded-r cursor-pointer hover:bg-[#5522EE] transition-colors">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-[#E8E8E8] h-36 animate-pulse"
              />
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 bg-[#F0EBFF] rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              No Online Tests Yet
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Check back later for assigned assessments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedExams.map((exam) => (
              <CandidateExamCard
                key={exam._id}
                exam={exam}
                onStart={handleStart}
              />
            ))}
          </div>
        )}

        {filteredExams.length > 0 && (
          <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded border border-[#DADADA] bg-white text-gray-500 cursor-pointer disabled:opacity-40 hover:border-primary hover:text-primary transition-colors text-xs"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 flex items-center justify-center rounded border text-xs font-medium cursor-pointer transition-colors ${
                    p === currentPage
                      ? "bg-primary border-primary text-white"
                      : "bg-white border-[#DADADA] text-gray-600 hover:border-primary hover:text-primary"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-7 h-7 flex items-center justify-center rounded border border-[#DADADA] bg-white text-gray-500 cursor-pointer disabled:opacity-40 hover:border-primary hover:text-primary transition-colors text-xs"
              >
                ›
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#888]">
                Online Test Per Page
              </span>
              <div className="relative">
                <select
                  value={perPage}
                  onChange={(event) => {
                    setPerPage(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-7 pl-2 pr-6 text-xs border border-[#DADADA] rounded bg-white text-gray-700 focus:outline-none focus:border-primary appearance-none cursor-pointer"
                >
                  {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
                  <svg
                    className="w-3 h-3 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
