"use client";
// src/app/employer/dashboard/page.jsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Users, BookOpen, LayoutGrid } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import { formatDate, getExamStatus } from "@/lib/utils/helpers";

async function fetchExams() {
  const res = await axios.get("/api/exams", { withCredentials: true });
  return res.data.exams;
}
async function deleteExam(id) {
  await axios.delete(`/api/exams/${id}`, { withCredentials: true });
}
async function publishExam(id) {
  const res = await axios.post(
    `/api/exams/${id}/publish`,
    {},
    { withCredentials: true }
  );
  return res.data.exam;
}

const ITEMS_PER_PAGE_OPTIONS = [5, 8, 10, 20];

function ExamCard({ exam, onViewCandidates }) {
  const candidates = exam.totalCandidates ?? exam.totalCandidates;
  const questionSets = exam.questionSets ?? exam.questionSets;
  const examSlots = exam.totalSlots ?? exam.totalSlots;

  return (
    <div className="bg-white rounded-lg border border-[#E8E8E8] p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      {/* Title */}
      <h3 className="text-[#1A1A1A] text-sm font-semibold leading-snug line-clamp-2">
        {exam.title}
      </h3>

      {/* Stats row */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Candidates */}
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[#888]" />
          <span className="text-[11px] text-[#888]">Candidates:</span>
          <span
            className={`text-[11px] font-semibold ${
              candidates ? "text-[#FF6B00]" : "text-[#888]"
            }`}
          >
            {candidates != null
              ? Number(candidates).toLocaleString()
              : "Not Set"}
          </span>
        </div>

        {/* Question Set */}
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#888]" />
          <span className="text-[11px] text-[#888]">Question Set:</span>
          <span
            className={`text-[11px] font-semibold ${
              questionSets ? "text-[#1A1A1A]" : "text-[#888]"
            }`}
          >
            {questionSets != null ? questionSets : "Not Set"}
          </span>
        </div>

        {/* Exam Slots */}
        <div className="flex items-center gap-1.5">
          <LayoutGrid className="w-3.5 h-3.5 text-[#888]" />
          <span className="text-[11px] text-[#888]">Exam Slots:</span>
          <span
            className={`text-[11px] font-semibold ${
              examSlots ? "text-[#1A1A1A]" : "text-[#888]"
            }`}
          >
            {examSlots != null ? examSlots : "Not Set"}
          </span>
        </div>
      </div>

      {/* View Candidates button */}
      <div>
        <button
          onClick={() => onViewCandidates(exam._id)}
          className="px-4 py-1.5 rounded border border-[#6633FF] text-[#6633FF] text-xs font-medium hover:bg-[#6633FF] hover:text-white transition-colors duration-150"
        >
          View Candidates
        </button>
      </div>
    </div>
  );
}

export default function EmployerDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ["exams"],
    queryFn: fetchExams,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam deleted successfully");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete exam"),
  });

  const totalPages = Math.ceil(exams.length / perPage);
  const paginatedExams = exams.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <div className="min-h-full flex flex-col max-w-9/10 mx-auto">
      {/* Page title bar */}

      {/* Content area */}
      <div className="flex-1 px-6 md:px-8 py-6">
        {/* Online Tests header */}
        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
          <h2 className="text-[#1A1A1A] text-base font-bold">Online Tests</h2>

          {/* Search bar */}
          <div className="flex items-center gap-3 flex-1 max-w-sm ml-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search exam title..."
                className="w-full h-9 pl-3 pr-9 text-xs border border-[#DADADA] rounded bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#6633FF] transition-colors"
              />
              <div className="absolute right-0 top-0 h-9 w-9 flex items-center justify-center bg-[#6633FF] rounded-r cursor-pointer hover:bg-[#5522EE] transition-colors">
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

          {/* Create Online Test button */}
          <button
            onClick={() => router.push("/employer/create-exam")}
            className="h-9 px-5 bg-[#6633FF] text-white text-xs font-semibold rounded hover:bg-[#5522EE] transition-colors whitespace-nowrap flex-shrink-0 shadow-sm"
          >
            Create Online Test
          </button>
        </div>

        {/* Grid of exam cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-[#E8E8E8] h-36 animate-pulse"
              />
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 bg-[#F0EBFF] rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-[#6633FF]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              No Online Tests Yet
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Create your first online assessment to get started.
            </p>
            <button
              onClick={() => router.push("/employer/create-exam")}
              className="px-5 py-2 bg-[#6633FF] text-white text-xs font-semibold rounded hover:bg-[#5522EE] transition-colors"
            >
              Create Online Test
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedExams.map((exam) => (
              <ExamCard
                key={exam._id}
                exam={exam}
                onViewCandidates={(id) =>
                  router.push(`/employer/candidates/${id}`)
                }
              />
            ))}
          </div>
        )}

        {/* Pagination row */}
        {exams.length > 0 && (
          <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
            {/* Page controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded border border-[#DADADA] bg-white text-gray-500 disabled:opacity-40 hover:border-[#6633FF] hover:text-[#6633FF] transition-colors text-xs"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 flex items-center justify-center rounded border text-xs font-medium transition-colors ${
                    p === currentPage
                      ? "bg-[#6633FF] border-[#6633FF] text-white"
                      : "bg-white border-[#DADADA] text-gray-600 hover:border-[#6633FF] hover:text-[#6633FF]"
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
                className="w-7 h-7 flex items-center justify-center rounded border border-[#DADADA] bg-white text-gray-500 disabled:opacity-40 hover:border-[#6633FF] hover:text-[#6633FF] transition-colors text-xs"
              >
                ›
              </button>
            </div>

            {/* Per page */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#888]">
                Online Test Per Page
              </span>
              <div className="relative">
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-7 pl-2 pr-6 text-xs border border-[#DADADA] rounded bg-white text-gray-700 focus:outline-none focus:border-[#6633FF] appearance-none cursor-pointer"
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

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?._id)}
        loading={deleteMutation.isPending}
        title="Delete Exam?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Exam"
      />
    </div>
  );
}
