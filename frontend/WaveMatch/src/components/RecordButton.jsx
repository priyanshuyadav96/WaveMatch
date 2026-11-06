export default function RecordButton({ recording, onClick }) {
  return (
    <div className="flex flex-col items-center gap-[17px]">
      <button
        onClick={onClick}
        aria-label={recording ? "Stop recording" : "Start recording"}
        className={[
          "size-[108px] cursor-pointer rounded-full border p-2 transition duration-200 active:scale-[0.96] max-[480px]:size-[92px]",
          recording
            ? "animate-record-pulse border-[#ff91aa] bg-[linear-gradient(145deg,#fa587d,#b51f58)]"
            : "border-[rgba(255,156,211,0.75)] bg-[linear-gradient(145deg,#ed69b1,#a82c78)] shadow-record hover:scale-[1.06] hover:shadow-record-hover",
        ].join(" ")}
      >
        <span className="grid size-full place-items-center rounded-full border border-white/25 bg-white/8">
          {recording ? (
            <span className="size-[23px] rounded-[5px] bg-white" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-9 max-[480px]:size-[31px]"
            >
              <rect x="9" y="2" width="6" height="13" rx="3" />
              <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
              <path d="M12 19v3M8 22h8" />
            </svg>
          )}
        </span>
      </button>

      <span className="text-[10px] font-bold tracking-[2px] text-pink-soft">
        {recording ? "STOP RECORDING" : "TAP TO RECORD"}
      </span>
    </div>
  );
}