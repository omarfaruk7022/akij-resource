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

      <div className="flex items-center gap-8 flex-wrap">
        <div className="flex items-center gap-1.5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.5 11C15.5 9.067 13.933 7.5 12 7.5C10.067 7.5 8.5 9.067 8.5 11C8.5 12.933 10.067 14.5 12 14.5C13.933 14.5 15.5 12.933 15.5 11Z"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M15.4825 11.3499C15.8045 11.4475 16.146 11.5 16.4998 11.5C18.4328 11.5 19.9998 9.933 19.9998 8C19.9998 6.067 18.4328 4.5 16.4998 4.5C14.6849 4.5 13.1926 5.8814 13.0171 7.65013"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M10.9827 7.65013C10.8072 5.8814 9.31492 4.5 7.5 4.5C5.567 4.5 4 6.067 4 8C4 9.933 5.567 11.5 7.5 11.5C7.85381 11.5 8.19535 11.4475 8.51727 11.3499"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M22 16.5C22 13.7386 19.5376 11.5 16.5 11.5"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M17.5 19.5C17.5 16.7386 15.0376 14.5 12 14.5C8.96243 14.5 6.5 16.7386 6.5 19.5"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M7.5 11.5C4.46243 11.5 2 13.7386 2 16.5"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span className="text-[13px] text-[#334155]">Candidates:</span>
          <span
            className={`text-[13px] font-semibold ${
              candidates ? "text-[#FF6B00]" : "text-[#334155]"
            }`}
          >
            {candidates != null
              ? Number(candidates).toLocaleString()
              : "Not Set"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 17H16"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M8 13H12"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M13 2.5V3C13 5.82843 13 7.24264 13.8787 8.12132C14.7574 9 16.1716 9 19 9H19.5M20 10.6569V14C20 17.7712 20 19.6569 18.8284 20.8284C17.6569 22 15.7712 22 12 22C8.22876 22 6.34315 22 5.17157 20.8284C4 19.6569 4 17.7712 4 14V9.45584C4 6.21082 4 4.58831 4.88607 3.48933C5.06508 3.26731 5.26731 3.06508 5.48933 2.88607C6.58831 2 8.21082 2 11.4558 2C12.1614 2 12.5141 2 12.8372 2.11401C12.9044 2.13772 12.9702 2.165 13.0345 2.19575C13.3436 2.34355 13.593 2.593 14.0919 3.09188L18.8284 7.82843C19.4065 8.40649 19.6955 8.69552 19.8478 9.06306C20 9.4306 20 9.83935 20 10.6569Z"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span className="text-[13px] text-[#334155]">Question Set:</span>
          <span
            className={`text-[13px] font-semibold ${
              questionSets ? "text-[#1A1A1A]" : "text-[#334155]"
            }`}
          >
            {questionSets != null ? questionSets : "Not Set"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 22C13.1046 22 14 21.1046 14 20C14 18.8954 13.1046 18 12 18C10.8954 18 10 18.8954 10 20C10 21.1046 10.8954 22 12 22Z"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 2C8.96243 2 6.5 4.46243 6.5 7.5C6.5 10.0176 8.1915 12.14 10.5 12.793L12 15L13.5 12.793C15.8085 12.14 17.5 10.0176 17.5 7.5C17.5 4.46243 15.0376 2 12 2Z"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 5V7.5L13.5 8.5"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M14 20H21M10 20H3"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span className="text-[13px] text-[#334155]">Exam Slots:</span>
          <span
            className={`text-[13px] font-semibold ${
              examSlots ? "text-[#1A1A1A]" : "text-[#334155]"
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
