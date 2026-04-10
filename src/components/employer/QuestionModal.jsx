"use client";

import { useState, useRef } from "react";
import { ChevronDown, Trash2, Plus } from "lucide-react";
import Modal from "@/components/ui/Modal";

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const TYPE_OPTIONS = [
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio" },
  { value: "text", label: "Text" },
];

function RichEditor({ contentRef, placeholder = "", onChange }) {
  const handleInput = () => {
    if (onChange) onChange(contentRef.current?.innerHTML || "");
  };
  const exec = (cmd) => {
    document.execCommand(cmd, false, null);
    contentRef.current?.focus();
  };

  return (
    <div className="border border-[#E5E7EB] rounded overflow-hidden mt-2">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[#E5E7EB] bg-[#FAFAFA] flex-wrap">
        <button
          type="button"
          onClick={() => exec("undo")}
          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] text-[#555] hover:bg-[#F0EBFF] hover:text-[#6633FF] transition-colors"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M3 7v6h6" />
            <path d="M3 13A9 9 0 1 0 5.27 5.27" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => exec("redo")}
          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] text-[#555] hover:bg-[#F0EBFF] hover:text-[#6633FF] transition-colors"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M21 7v6h-6" />
            <path d="M21 13A9 9 0 1 1 18.73 5.27" />
          </svg>
        </button>
        <button
          type="button"
          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] text-[#555] hover:bg-[#F0EBFF] hover:text-[#6633FF] transition-colors whitespace-nowrap"
        >
          Normal text
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <div className="w-px h-3.5 bg-[#E5E7EB] mx-0.5" />
        <button
          type="button"
          onClick={() => exec("insertUnorderedList")}
          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] text-[#555] hover:bg-[#F0EBFF] hover:text-[#6633FF] transition-colors"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <div className="w-px h-3.5 bg-[#E5E7EB] mx-0.5" />
        <button
          type="button"
          onClick={() => exec("bold")}
          className="px-1.5 py-0.5 rounded text-[13px] font-black text-[#333] hover:bg-[#F0EBFF] hover:text-[#6633FF] transition-colors"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => exec("italic")}
          className="px-1.5 py-0.5 rounded text-[13px] italic font-semibold text-[#333] hover:bg-[#F0EBFF] hover:text-[#6633FF] transition-colors"
        >
          I
        </button>
      </div>
      <div
        ref={contentRef}
        onInput={handleInput}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className="min-h-[4.5rem] px-3 py-2.5 text-[13px] text-[#1A1A1A] outline-none bg-white empty:before:content-[attr(data-placeholder)] empty:before:text-[#BABABA]"
      />
    </div>
  );
}

function OptionRow({
  letter,
  type,
  isCorrect,
  onToggleCorrect,
  onDelete,
  showDelete,
}) {
  const editorRef = useRef(null);
  return (
    <div className="mt-3">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onToggleCorrect}
          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
            isCorrect
              ? "bg-[#6633FF] text-white"
              : "bg-gray-200 text-gray-600 hover:bg-[#6633FF] hover:text-white"
          }`}
        >
          {letter}
        </button>
        <div className="flex-1" />
        {showDelete && (
          <button onClick={onDelete} className="text-[#bbb] hover:text-red-500">
            <Trash2 size={12} />
          </button>
        )}
      </div>
      <div className="border border-t-0 border-[#E5E7EB] rounded-b">
        <RichEditor contentRef={editorRef} placeholder="Type option..." />
      </div>
    </div>
  );
}

export default function QuestionModal({ isOpen, onClose, onSave }) {
  const [questionNum, setQuestionNum] = useState(1);
  const [score, setScore] = useState(1);
  const [type, setType] = useState("checkbox");
  const [options, setOptions] = useState([0, 1]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [textAnswer, setTextAnswer] = useState("");

  const questionEditorRef = useRef(null);
  const textAnswerRef = useRef(null); // ← fix: dedicated ref for text answer

  const toggleCorrect = (idx) => {
    const key = String(idx);
    if (type === "radio") {
      setCorrectAnswers([key]);
    } else {
      setCorrectAnswers((prev) =>
        prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]
      );
    }
  };

  const addOption = () => {
    if (options.length < 8) setOptions((p) => [...p, p.length]);
  };

  const removeOption = (idx) => {
    setOptions((p) => p.filter((_, i) => i !== idx));
    setCorrectAnswers((p) => p.filter((v) => v !== String(idx)));
  };

  const handleTypeChange = (val) => {
    setType(val);
    setCorrectAnswers([]);
    setTextAnswer("");
    if (val === "text") setOptions([]);
    else if (options.length < 2) setOptions([0, 1]);
  };

  const handleSave = (addMore) => {
    const title = questionEditorRef.current?.innerText?.trim();
    if (!title) return;

    let data = { title, type, marks: score };

    if (type === "text") {
      // Strip HTML tags from innerHTML to get plain text answer
      const tmp = document.createElement("div");
      tmp.innerHTML = textAnswer;
      data.correctAnswer = tmp.innerText?.trim() || "";
      data.options = [];
    } else {
      data.options = options.map((_, i) => `Option ${LETTERS[i]}`);
      data.correctAnswer = correctAnswers;
    }

    onSave(data);

    if (!addMore) return onClose();

    // Reset for next question
    setQuestionNum((n) => n + 1);
    setScore(1);
    setType("checkbox");
    setOptions([0, 1]);
    setCorrectAnswers([]); // ← fix: array not string
    setTextAnswer(""); // ← fix: reset text answer
    if (questionEditorRef.current) questionEditorRef.current.innerHTML = "";
    if (textAnswerRef.current) textAnswerRef.current.innerHTML = ""; // ← fix: clear editor
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b mb-4">
        <div className="w-6 h-6 rounded-full bg-[#6633FF] text-white flex items-center justify-center text-xs font-bold">
          {questionNum}
        </div>
        <span className="text-sm font-semibold flex-1">
          Question {questionNum}
        </span>
        <span className="text-xs text-gray-500">Score:</span>
        <input
          type="number"
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="w-10 border rounded text-center text-sm"
        />
        <div className="relative">
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="border rounded text-xs px-2 py-1 appearance-none"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={10}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
        <button onClick={onClose}>
          <Trash2 size={14} />
        </button>
      </div>

      {/* Question editor */}
      <RichEditor
        contentRef={questionEditorRef}
        placeholder="Type your question..."
      />

      {/* MCQ options */}
      {(type === "checkbox" || type === "radio") && (
        <>
          {options.map((_, idx) => (
            <OptionRow
              key={idx}
              letter={LETTERS[idx]}
              type={type}
              isCorrect={correctAnswers.includes(String(idx))}
              onToggleCorrect={() => toggleCorrect(idx)}
              onDelete={() => removeOption(idx)}
              showDelete={options.length > 2}
            />
          ))}
          <button
            onClick={addOption}
            className="flex items-center gap-1 mt-3 text-sm text-[#6633FF]"
          >
            <Plus size={14} /> Another option
          </button>
        </>
      )}

      {/* Text answer */}
      {type === "text" && (
        <div className="mt-3">
          <div className="flex items-center px-2.5 py-1.5 border border-[#E5E7EB] rounded-t bg-[#FAFAFA]">
            <div className="w-5 h-5 rounded-full bg-[#6633FF] text-white flex items-center justify-center text-[10px]">
              A
            </div>
          </div>
          <div className="border border-t-0 border-[#E5E7EB] rounded-b">
            <RichEditor
              contentRef={textAnswerRef}
              onChange={setTextAnswer}
              placeholder="Type answer..."
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-5 pt-4 border-t">
        <button
          onClick={() => handleSave(false)}
          className="px-5 py-2 border rounded text-sm"
        >
          Save
        </button>
        <button
          onClick={() => handleSave(true)}
          className="px-5 py-2 bg-[#6633FF] text-white rounded text-sm"
        >
          Save & Add More
        </button>
      </div>
    </Modal>
  );
}
