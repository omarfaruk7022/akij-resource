import { Redo2, Undo2 } from "lucide-react";
import { useEffect } from "react";

export default function RichEditor({
  contentRef,
  placeholder = "",
  onChange,
  value = "",
}) {
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== value) {
      contentRef.current.innerHTML = value;
    }
  }, [contentRef, value]);

  const handleInput = () => {
    if (onChange) onChange(contentRef.current?.innerHTML || "");
  };
  const exec = (cmd) => {
    document.execCommand(cmd, false, null);
    contentRef.current?.focus();
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mt-2">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-[#FAFAFA] flex-wrap">
        <button
          type="button"
          onClick={() => exec("undo")}
          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] text-[#555] hover:bg-[#F0EBFF] hover:text-primary transition-colors cursor-pointer"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => exec("redo")}
          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] text-[#555] hover:bg-[#F0EBFF] hover:text-primary transition-colors cursor-pointer"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] text-[#555] hover:bg-[#F0EBFF] hover:text-primary transition-colors whitespace-nowrap cursor-pointer"
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
        <div className="w-px h-3.5 bg-gray-200 mx-0.5" />
        <button
          type="button"
          onClick={() => exec("insertUnorderedList")}
          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] text-[#555] hover:bg-[#F0EBFF] hover:text-primary transition-colors cursor-pointer"
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
        <div className="w-px h-3.5 bg-gray-200 mx-0.5" />
        <button
          type="button"
          onClick={() => exec("bold")}
          className="px-1.5 py-0.5 rounded text-[13px] font-black text-[#333] hover:bg-[#F0EBFF] hover:text-primary transition-colors cursor-pointer"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => exec("italic")}
          className="px-1.5 py-0.5 rounded text-[13px] italic font-semibold text-[#333] hover:bg-[#F0EBFF] hover:text-primary transition-colors cursor-pointer"
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
