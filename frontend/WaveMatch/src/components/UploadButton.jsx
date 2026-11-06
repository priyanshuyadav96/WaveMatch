import { useRef } from "react";

export default function UploadButton({ disabled, onFile }) {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be picked again after removing it
    if (file) onFile(file);
  };

  return (
    <div className="mt-[45px] flex flex-col items-center gap-2.5 max-[480px]:mt-[39px]">
      <button
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="flex min-w-[190px] cursor-pointer items-center justify-center gap-[11px] rounded-[30px] border border-white/17 bg-white/[0.055] px-[23px] py-[13px] text-xs font-semibold text-[#f5e9f2] backdrop-blur-[12px] transition duration-200 enabled:hover:-translate-y-0.5 enabled:hover:border-[rgba(235,116,186,0.65)] enabled:hover:bg-[rgba(220,80,158,0.12)] disabled:cursor-not-allowed disabled:opacity-40 max-[480px]:min-w-[180px] max-[480px]:px-5 max-[480px]:py-3"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-[17px] text-[#ed83be]"
        >
          <path d="M12 16V4" />
          <path d="m7 9 5-5 5 5" />
          <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        </svg>
        <span>Upload audio</span>
      </button>

      <input ref={inputRef} type="file" accept="audio/*" hidden onChange={handleChange} />

      <span className="text-[9px] tracking-[1px] text-dim">MP3, WAV, M4A, WEBM</span>
    </div>
  );
}