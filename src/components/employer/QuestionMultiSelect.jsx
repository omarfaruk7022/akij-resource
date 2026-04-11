import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/helpers";

export default function QuestionMultiSelect({
  options,
  register,
  watch,
  setValue,
  error,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = watch("questionType") || [];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (value) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    setValue("questionType", next, { shouldValidate: true });
  };

  // hidden inputs so react-hook-form still registers the field
  register("questionType");

  const displayLabel =
    selected.length === 0
      ? "Select question type"
      : options
          .filter((o) => selected.includes(o.value))
          .map((o) => o.label)
          .join(", ");

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "exam-input w-full flex items-center justify-between text-left",
          selected.length === 0 ? "text-gray-400" : "text-[#1A1A1A]",
        )}
      >
        <span className="truncate text-sm">{displayLabel}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 shrink-0 text-gray-400 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-[#E8E8E8] rounded-lg shadow-md py-1">
          {options.map(({ value, label }) => {
            const checked = selected.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggle(value)}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                <span
                  className={cn(
                    "w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors",
                    checked
                      ? "bg-primary border-primary"
                      : "border-gray-300 bg-white",
                  )}
                >
                  {checked && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      viewBox="0 0 10 8"
                      fill="none"
                    >
                      <path
                        d="M1 4l3 3 5-6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className="text-sm text-[#344054]">{label}</span>
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
