import { Users, BookOpen, LayoutGrid } from "lucide-react";

export default function ExamCard({ exam, onViewCandidates }) {
  const candidates = exam.totalCandidates ?? exam.totalCandidates;
  const questionSets = exam.questionSets ?? exam.questionSets;
  const examSlots = exam.totalSlots ?? exam.totalSlots;

  return (
    <div className="bg-white rounded-lg border border-[#E8E8E8] p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      <h3 className="text-[#1A1A1A] text-md md:text-lg font-semibold leading-snug line-clamp-2">
        {exam.title}
      </h3>

      <div className="flex items-center gap-4 flex-wrap">
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

      <div>
        <button
          onClick={() => onViewCandidates(exam._id)}
          className="
    px-5 py-2 rounded-lg
    border border-primary
    text-primary text-sm font-medium
    cursor-pointer
    hover:bg-primary hover:!text-white
    transition-colors duration-150
  "
        >
          View Candidates
        </button>
      </div>
    </div>
  );
}
