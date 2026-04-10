"use client";
// src/app/employer/candidates/[examId]/page.jsx
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowLeft,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Award,
  Eye,
} from "lucide-react";
import Topbar from "@/components/shared/Topbar";
import Badge from "@/components/ui/Badge";
import { formatDate, formatDuration } from "@/lib/utils/helpers";

async function fetchCandidates(examId) {
  const res = await axios.get(`/api/exams/${examId}/candidates`, {
    withCredentials: true,
  });
  return res.data;
}

function ScorePill({ percentage }) {
  if (percentage >= 80) return <Badge variant="success">{percentage}%</Badge>;
  if (percentage >= 50) return <Badge variant="warning">{percentage}%</Badge>;
  return <Badge variant="danger">{percentage}%</Badge>;
}

export default function CandidatesPage() {
  const { examId } = useParams();
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["candidates", examId],
    queryFn: () => fetchCandidates(examId),
    enabled: !!examId,
  });

  const submissions = data?.submissions || [];
  const exam = data?.exam;

  const avgScore =
    submissions.length > 0
      ? Math.round(
          submissions.reduce((s, sub) => s + (sub.percentage || 0), 0) /
            submissions.length
        )
      : 0;

  const passed = submissions.filter((s) => (s.percentage || 0) >= 50).length;

  return (
    <div className="p-6 space-y-6">
      <Topbar title="Candidates" subtitle={exam?.title || "Exam results"} />

      <div className="pt-4">
        {/* Back + header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {exam?.title || "Exam"}
            </h1>
            <p className="text-sm text-gray-500">
              {submissions.length} submission
              {submissions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Stats row */}
        {!isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "Total Submitted",
                value: submissions.length,
                icon: Users,
                color: "bg-blue-50 text-blue-500",
              },
              {
                label: "Avg. Score",
                value: `${avgScore}%`,
                icon: TrendingUp,
                color: "bg-indigo-50 text-indigo-500",
              },
              {
                label: "Passed (≥50%)",
                value: passed,
                icon: CheckCircle,
                color: "bg-green-50 text-green-500",
              },
              {
                label: "Auto Submitted",
                value: submissions.filter((s) => s.autoSubmitted).length,
                icon: Clock,
                color: "bg-amber-50 text-amber-500",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}
                >
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Submission Results</h2>
          </div>

          {isLoading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              Failed to load submissions
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                <Users className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No submissions yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Candidates haven&apos;t submitted this exam yet
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {[
                      "#",
                      "Candidate",
                      "Score",
                      "Percentage",
                      "Time Spent",
                      "Submitted At",
                      "Behavior",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, idx) => (
                    <tr
                      key={sub._id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4 text-sm text-gray-400">
                        {idx + 1}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 text-xs font-bold">
                              {sub.candidate?.name?.charAt(0)?.toUpperCase() ||
                                "?"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {sub.candidate?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {sub.candidate?.email || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 font-medium">
                        {sub.score ?? "-"} / {sub.totalMarks ?? "-"}
                      </td>
                      <td className="px-5 py-4">
                        {sub.percentage != null ? (
                          <ScorePill percentage={sub.percentage} />
                        ) : (
                          <Badge variant="gray">Pending</Badge>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {sub.timeSpent
                          ? formatDuration(Math.floor(sub.timeSpent / 60))
                          : "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {sub.submittedAt ? formatDate(sub.submittedAt) : "-"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-xs">
                          {sub.tabSwitchCount > 0 ||
                          sub.fullscreenExitCount > 0 ? (
                            <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                              <AlertTriangle className="w-3 h-3" />
                              {sub.tabSwitchCount > 0 &&
                                `${sub.tabSwitchCount} tab`}
                              {sub.fullscreenExitCount > 0 &&
                                ` ${sub.fullscreenExitCount} fs`}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md">
                              <CheckCircle className="w-3 h-3" /> Clean
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {sub.autoSubmitted ? (
                          <Badge variant="warning">Auto</Badge>
                        ) : (
                          <Badge variant="success">Manual</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
