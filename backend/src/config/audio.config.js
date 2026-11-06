// Single source of truth for every audio/fingerprint constant.
// NOTE: changing any of these invalidates stored fingerprints -> re-register songs.

const SAMPLE_RATE = 11025;
const FRAME_SIZE = 1024;          // must be a power of two
const HOP_SIZE = 512;

const TARGET_ZONE = 15;           // frames after the anchor to look for targets (max 31, 5-bit delta)
const FAN_OUT = 5;                // max pairs generated per anchor peak

// Peak picking (tunable)
const MIN_PEAK_MAGNITUDE = 0.5;   
const PEAK_MEAN_RATIO = 0.5;      // keep band peaks >= mean(band peaks of frame) * ratio

// Decoding safety
const MAX_DURATION_SECONDS = 600; // longest audio we will decode
const FFMPEG_TIMEOUT_MS = 60_000;

// Matching / accept-reject (tunable against your own test clips)
const MIN_VOTES = 15;
const MIN_VOTE_MARGIN = 1.5;      // best must have >= 1.5x the runner-up's votes
const MIN_WINDOW_COVERAGE_PCT = 30;
const WINDOW_SECONDS = 1;
const STRONG_WINDOW_MIN_VOTES = 10;
const LOOKUP_BATCH_SIZE = 5000;

if (TARGET_ZONE > 31) 
    throw new Error("TARGET_ZONE must be <= 31 (5-bit time delta)");
if ((FRAME_SIZE & (FRAME_SIZE - 1)) !== 0) 
    throw new Error("FRAME_SIZE must be a power of two");
if (FRAME_SIZE / 2 > 512) 
    throw new Error("FRAME_SIZE/2 must be <= 512 (9-bit bin in hash)");

const FRAMES_PER_SECOND = SAMPLE_RATE / HOP_SIZE;

module.exports = {
    SAMPLE_RATE, FRAME_SIZE, HOP_SIZE, TARGET_ZONE, FAN_OUT,
    MIN_PEAK_MAGNITUDE, PEAK_MEAN_RATIO,
    MAX_DURATION_SECONDS, FFMPEG_TIMEOUT_MS,
    MIN_VOTES, MIN_VOTE_MARGIN, MIN_WINDOW_COVERAGE_PCT,
    WINDOW_SECONDS, STRONG_WINDOW_MIN_VOTES, LOOKUP_BATCH_SIZE,
    FRAMES_PER_SECOND
};