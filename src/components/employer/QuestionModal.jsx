"use client";

import { useState, useRef } from "react";
import { ChevronDown, Trash2, Plus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import RichEditor from "../shared/RichEditor";
import useExamStore from "@/store/useExamStore";

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const ALL_TYPE_OPTIONS = [
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "MCQ" },
  { value: "text", label: "Text" },
];

function getCorrectAnswerIndexes(correctAnswer, optionTexts) {
  const answers = Array.isArray(correctAnswer)
    ? correctAnswer
    : correctAnswer
    ? [correctAnswer]
    : [];

  return answers
    .map((answer) => {
      const textIndex = optionTexts.findIndex((option) => option === answer);
      if (textIndex >= 0) return textIndex;

      const numericIndex = Number(answer);
      return Number.isInteger(numericIndex) &&
        numericIndex >= 0 &&
        numericIndex < optionTexts.length
        ? numericIndex
        : -1;
    })
    .filter((idx) => idx >= 0)
    .map(String);
}

function textFromHtml(value) {
  const tmp = document.createElement("div");
  tmp.innerHTML = value || "";
  return tmp.innerText?.trim() || "";
}

function OptionRow({
  type,
  letter,
  value,
  isCorrect,
  onToggleCorrect,
  onChange,
  onDelete,
  showDelete,
}) {
  const editorRef = useRef(null);

  return (
    <div className="ml-3 mt-3">
      <div className="flex items-center gap-3 px-1">
        <button
          type="button"
          className="w-7 h-7 rounded-full border border-[#98A2B3] bg-white flex items-center justify-center text-xs font-medium text-[#667085]"
        >
          {letter}
        </button>
        <label className="flex items-center gap-2 text-sm text-[#344054] cursor-pointer select-none">
          <input
            type={type === "radio" ? "radio" : "checkbox"}
            checked={isCorrect}
            onChange={onToggleCorrect}
            className="w-4 h-4 shrink-0 accent-primary"
          />
          <span>Set as correct answer</span>
        </label>
        <div className="flex-1" />
        {showDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-[#bbb] hover:text-red-500 cursor-pointer"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
      <div className=" ">
        <RichEditor
          contentRef={editorRef}
          placeholder="Type option..."
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function QuestionModalContent({ isOpen, onClose, onSave, initialData }) {
  // Read allowed question types from exam store (set during Step 1)
  const { step1Data } = useExamStore();

  // Normalize step1Data.questionType to always be an array of allowed values
  const allowedTypes = (
    Array.isArray(step1Data?.questionType)
      ? step1Data.questionType
      : step1Data?.questionType
      ? [step1Data.questionType]
      : ["checkbox", "radio", "text"] // fallback: show all if store is empty
  );

  // Filter the global options list to only those selected in Step 1
  const TYPE_OPTIONS = ALL_TYPE_OPTIONS.filter((opt) =>
    allowedTypes.includes(opt.value)
  );

  // Resolve the initial type: use initialData.type if it's still allowed,
  // otherwise fall back to the first allowed type
  const resolvedInitialType =
    initialData?.type && allowedTypes.includes(initialData.type)
      ? initialData.type
      : allowedTypes[0] || "checkbox";

  const initialOptions =
    resolvedInitialType === "text"
      ? []
      : initialData?.options?.length
      ? initialData.options
      : ["", ""];

  const [questionNum, setQuestionNum] = useState(1);
  const [score, setScore] = useState(initialData?.marks || 1);
  const [type, setType] = useState(resolvedInitialType);
  const [options, setOptions] = useState(initialOptions);
  const [correctAnswers, setCorrectAnswers] = useState(() =>
    resolvedInitialType === "text"
      ? []
      : getCorrectAnswerIndexes(initialData?.correctAnswer, initialOptions)
  );
  const [textAnswer, setTextAnswer] = useState(
    initialData?.type === "text" ? initialData.correctAnswer || "" : ""
  );

  const questionEditorRef = useRef(null);
  const textAnswerRef = useRef(null);

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
    if (options.length < 8) setOptions((p) => [...p, ""]);
  };

  const removeOption = (idx) => {
    setOptions((p) => p.filter((_, i) => i !== idx));
    setCorrectAnswers((p) =>
      p
        .map(Number)
        .filter((value) => value !== idx)
        .map((value) => (value > idx ? value - 1 : value))
        .map(String)
    );
  };

  const updateOption = (idx, value) => {
    setOptions((p) => p.map((option, i) => (i === idx ? value : option)));
  };

  const handleTypeChange = (val) => {
    setType(val);
    setCorrectAnswers([]);
    setTextAnswer("");
    if (val === "text") setOptions([]);
    else if (options.length < 2) setOptions(["", ""]);
  };

  const handleSave = (addMore) => {
    const title = questionEditorRef.current?.innerText?.trim();
    if (!title) return;

    let data = { title, type, marks: score };

    if (type === "text") {
      data.correctAnswer = textFromHtml(textAnswer);
      if (!data.correctAnswer) {
        alert("Correct answer is required.");
        return;
      }
      data.options = [];
    } else {
      if (correctAnswers.length === 0) {
        alert("Correct answer is required.");
        return;
      }
      const optionTexts = options.map(textFromHtml);
      if (optionTexts.some((option) => !option)) {
        alert("All options are required.");
        return;
      }
      data.options = optionTexts;
      data.correctAnswer =
        type === "radio"
          ? optionTexts[Number(correctAnswers[0])]
          : correctAnswers.map((idx) => optionTexts[Number(idx)]);
    }

    onSave(data);

    if (!addMore) return onClose();

    // Reset for next question
    setQuestionNum((n) => n + 1);
    setScore(1);
    // Reset type to first allowed type
    const nextType = allowedTypes[0] || "checkbox";
    setType(nextType);
    setOptions(nextType === "text" ? [] : ["", ""]);
    setCorrectAnswers([]);
    setTextAnswer("");
    if (questionEditorRef.current) questionEditorRef.current.innerHTML = "";
    if (textAnswerRef.current) textAnswerRef.current.innerHTML = "";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-gray-200 mb-4">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs border border-gray-200">
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
          className="w-10 border border-gray-200 rounded text-center text-sm"
        />

        {/* Type dropdown — only shows types allowed from Step 1 */}
        <div className="relative">
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="border border-gray-200 rounded text-xs px-2 py-1 appearance-none pr-5"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={10}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
        </div>

        <button type="button" onClick={onClose} className="cursor-pointer">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Question editor */}
      <RichEditor
        contentRef={questionEditorRef}
        placeholder="Type your question..."
        value={initialData?.title || ""}
      />

      {/* MCQ / Checkbox options */}
      {(type === "checkbox" || type === "radio") && (
        <>
          {options.map((_, idx) => (
            <OptionRow
              key={idx}
              type={type}
              letter={LETTERS[idx]}
              value={options[idx]}
              isCorrect={correctAnswers.includes(String(idx))}
              onToggleCorrect={() => toggleCorrect(idx)}
              onChange={(value) => updateOption(idx, value)}
              onDelete={() => removeOption(idx)}
              showDelete={options.length > 2}
            />
          ))}
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 mt-3 text-sm text-primary cursor-pointer"
          >
            <Plus size={14} /> Another option
          </button>
        </>
      )}

      {/* Text answer */}
      {type === "text" && (
        <div className="mt-3 ml-3">
          <button
            type="button"
            className="w-7 h-7 rounded-full border border-[#98A2B3] bg-white flex items-center justify-center text-xs font-medium text-[#667085]"
          >
            A
          </button>
          <div className="">
            <RichEditor
              contentRef={textAnswerRef}
              value={textAnswer}
              onChange={setTextAnswer}
              placeholder="Type answer..."
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => handleSave(false)}
          className="px-5 py-2 border border-gray-200 rounded text-sm cursor-pointer"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          className="px-5 py-2 bg-primary text-white rounded text-sm cursor-pointer"
        >
          Save &amp; Add More
        </button>
      </div>
    </Modal>
  );
}

export default function QuestionModal(props) {
  const modalKey = props.isOpen ? props.initialData?._id || "new" : "closed";
  return <QuestionModalContent key={modalKey} {...props} />;
}