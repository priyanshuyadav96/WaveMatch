
import { useEffect, useRef, useState } from "react";

function formatTime(time) {
  if (!Number.isFinite(time)) return "0:00";

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function AudioPreview({ clip, onPlay, onStop, onRemove }) {
  const audioRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [clip.url]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch (error) {
        console.error("Playback failed:", error);
      }
    } else {
      audio.pause();
    }
  };

  const handlePlay = () => {
    setPlaying(true);
    onPlay?.(audioRef.current);
  };

  const handlePause = () => {
    setPlaying(false);
    onStop?.();
  };

  const handleEnded = () => {
    setPlaying(false);
    setCurrentTime(0);
    onStop?.();
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);

    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleRemove = () => {
    audioRef.current?.pause();
    onRemove?.();
  };

  return (
    <div className="mt-8 w-full min-w-0 overflow-hidden rounded-2xl border border-[rgba(224,110,183,0.22)] bg-[linear-gradient(145deg,rgba(48,25,44,0.96),rgba(29,17,31,0.96))] p-5 shadow-[0_15px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl max-sm:mt-6 max-sm:rounded-xl max-sm:p-3.5">

      <audio
        ref={audioRef}
        src={clip.url}
        preload="metadata"
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
      />

      {/* File information */}
      <div className="mb-5 flex min-w-0 items-center gap-3 max-sm:mb-4 max-sm:gap-2.5">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-[rgba(224,110,183,0.2)] bg-[rgba(224,110,183,0.12)] text-xl text-pink-light max-sm:size-9 max-sm:rounded-lg max-sm:text-lg">
          ♫
        </div>

        <div className="min-w-0 flex-1">
          <strong className="block truncate text-[13px] font-semibold text-[#f8eaf4] max-sm:text-xs">
            {clip.name}
          </strong>

          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={`size-1.5 shrink-0 rounded-full ${
                playing
                  ? "animate-pulse bg-[#ed77b9]"
                  : "bg-[#8b7185]"
              }`}
            />

            <span className="text-[10px] tracking-wide text-[#a991a4] max-sm:text-[9px]">
              {playing ? "NOW PLAYING" : "AUDIO READY"}
            </span>
          </div>
        </div>

        <button
          onClick={handleRemove}
          aria-label="Remove audio"
          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-transparent bg-transparent text-xl text-[#a78b9e] transition hover:border-[rgba(255,138,183,0.2)] hover:bg-[rgba(255,138,183,0.08)] hover:text-[#ff8ab7] active:scale-95 max-sm:size-8"
        >
          ×
        </button>
      </div>

      {/* Playback controls */}
      <div className="flex min-w-0 items-center gap-3 max-sm:gap-2.5">

        <button
          onClick={togglePlayback}
          aria-label={playing ? "Pause audio" : "Play audio"}
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-gradient-to-br from-[#ee83bd] to-[#c74691] text-white shadow-[0_4px_18px_rgba(215,90,159,0.3)] transition hover:scale-105 hover:shadow-[0_4px_24px_rgba(215,90,159,0.45)] active:scale-95 max-sm:size-10"
        >
          {playing ? (
            <svg viewBox="0 0 24 24" className="size-5 fill-current">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="ml-0.5 size-5 fill-current">
              <path d="M7 4.8c0-.8.9-1.3 1.6-.9l11 6.6a1.7 1.7 0 0 1 0 2.9l-11 6.7c-.7.4-1.6-.1-1.6-.9V4.8Z" />
            </svg>
          )}
        </button>

        {/* Timeline */}
        <div className="min-w-0 flex-1">
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={Math.min(currentTime, duration || 0)}
            onChange={handleSeek}
            aria-label="Seek audio"
            className="h-2 w-full cursor-pointer appearance-none rounded-full accent-[#e875b5] touch-pan-y"
            style={{
              background: `linear-gradient(to right, #e875b5 ${progress}%, rgba(255,255,255,0.12) ${progress}%)`,
            }}
          />

          <div className="mt-2 flex justify-between font-mono text-[10px] tabular-nums text-[#a991a4] max-sm:text-[9px]">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-[rgba(224,110,183,0.2)] to-transparent max-sm:mt-3" />
    </div>
  );
}
