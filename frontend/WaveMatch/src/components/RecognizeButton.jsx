import { useState } from "react";

export default function RecognizeButton({ onClick, disabled = false }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || loading) return;

    setLoading(true);

    try {
      await onClick?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-pink px-6 text-sm font-semibold tracking-wide text-white shadow-[0_0_25px_rgba(224,85,158,0.2)] transition-all duration-200 hover:bg-[#ed6eae] hover:shadow-[0_0_30px_rgba(224,85,158,0.35)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Recognizing...
        </>
      ) : (
        <>
          <span>Recognize</span>
          <span aria-hidden="true">→</span>
        </>
      )}
    </button>
  );
}