
function formatConfidence(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return `${Math.max(0, Math.min(100, value)).toFixed(1)}%`;
}

function SongArtwork({ src, large = false }) {
  return (
    <div
      className={`shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#49223e] to-[#211321] ${
        large ? "size-28 max-sm:size-24" : "size-[76px]"
      }`}
    >
      {src ? (
        <img
          src={src}
          alt="Album artwork"
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-3xl text-pink-300">
          ♫
        </div>
      )}
    </div>
  );
}

function Confidence({ value }) {
  const confidence = formatConfidence(value);

  if (!confidence) return null;

  return (
    <div className="mt-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-white/50">Match Confidence</span>
        <span className="text-xs font-semibold text-pink-300">
          {confidence}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#c34b91] to-[#f08ac1]"
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
          }}
        />
      </div>
    </div>
  );
}

function SongLink({ url }) {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-pink-300 transition-colors hover:text-pink-200"
    >
      <span>Listen to song</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}

function RecognizedSongCard({ result }) {
  const { song, matchDetails } = result;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-pink-400/30 bg-gradient-to-br from-[#351c32] to-[#211321] p-4 shadow-[0_0_35px_rgba(224,85,158,0.08)]">
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold tracking-wider text-emerald-300">
          MATCH FOUND
        </span>

        <span className="text-emerald-300">✓</span>
      </div>

      <div className="flex items-center gap-4">
        <SongArtwork src={song.coverImage} large />

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-semibold text-white">
            {song.title || "Unknown song"}
          </h2>

          <p className="mt-1 truncate text-sm text-white/65">
            {song.artist || "Unknown artist"}
          </p>

          <p className="mt-1 truncate text-xs text-white/40">
            {song.album || "Unknown album"}
          </p>
        </div>
      </div>

      <Confidence value={matchDetails?.temporalCoverage} />

      <SongLink url={song.audioUrl} />
    </div>
  );
}

function CandidateCard({ candidate }) {
  const { song, matchDetails } = candidate;

  return (
    <div className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3 transition-colors hover:border-pink-400/20 hover:bg-white/[0.05]">
      <div className="flex items-center gap-3">
        <SongArtwork src={song.coverImage} />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-white">
            {song.title || "Unknown song"}
          </h3>

          <p className="mt-1 truncate text-xs text-white/60">
            {song.artist || "Unknown artist"}
          </p>

          <p className="mt-1 truncate text-[11px] text-white/40">
            {song.album || "Unknown album"}
          </p>
        </div>
      </div>

      <Confidence value={matchDetails?.temporalCoverage} />

      <SongLink url={song.audioUrl} />
    </div>
  );
}

export default function RecognitionResults({ result }) {
  if (!result) return null;

  const isRecognized = result.success === true;
  const match = result.data?.match;
  const candidates = result.data?.candidates || [];

  // Avoid showing the recognized song twice in the candidate list.
  const otherCandidates = isRecognized
    ? candidates.filter(
        (candidate) => candidate.song?._id !== match?.song?._id
      )
    : candidates;

  if (!match && otherCandidates.length === 0) {
    return (
      <div className="mt-6 w-full rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-center">
        <p className="text-sm text-white/60">
          No matching songs found.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-7 flex w-full flex-col gap-5">
      {isRecognized && match && (
        <RecognizedSongCard result={match} />
      )}

      {otherCandidates.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
              {isRecognized
                ? "Other possible matches"
                : "Possible matches"}
            </h3>

            <span className="text-[11px] text-white/35">
              {otherCandidates.length}{" "}
              {otherCandidates.length === 1 ? "result" : "results"}
            </span>
          </div>

          {otherCandidates.map((candidate, index) => (
            <CandidateCard
              key={candidate.song?._id || index}
              candidate={candidate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
