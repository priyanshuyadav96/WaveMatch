
const Song = require("../models/song.model");
const Fingerprint = require("../models/fingerprint.model");
const {
    SAMPLE_RATE, HOP_SIZE, FRAMES_PER_SECOND,
    MIN_VOTES, MIN_VOTE_MARGIN, MIN_WINDOW_COVERAGE_PCT,
    WINDOW_SECONDS, STRONG_WINDOW_MIN_VOTES, LOOKUP_BATCH_SIZE
} = require("../config/audio.config");


async function collectVotes(queryHashes, queryFrames) {
    const queryHashMap = new Map();

    for (let i = 0; i < queryHashes.length; i++) {
        const h = queryHashes[i];
        let arr = queryHashMap.get(h);
        if (!arr) queryHashMap.set(h, (arr = []));
        arr.push(queryFrames[i]);
    }

    const uniqueHashes = Array.from(queryHashMap.keys());
    const songBuckets = new Map();

    for (let i = 0; i < uniqueHashes.length; i += LOOKUP_BATCH_SIZE) {
        const batch = uniqueHashes.slice(i, i + LOOKUP_BATCH_SIZE);

        const stored = await Fingerprint.find({ hash: { $in: batch } })
            .select("-_id hash songId anchorFrame")  
            .lean();

        for (const row of stored) {
            const qFrames = queryHashMap.get(row.hash);
            if (!qFrames) continue;

            const songId = row.songId.toString();
            let offsets = songBuckets.get(songId);
            if (!offsets) songBuckets.set(songId, (offsets = new Map()));

            for (const qf of qFrames) {
                const offset = row.anchorFrame - qf;  
                let bucket = offsets.get(offset);
                if (!bucket) offsets.set(offset, (bucket = { count: 0, queryFrames: [] }));
                bucket.count++;
                bucket.queryFrames.push(qf);
            }
        }
    }

    return songBuckets;
}

function pickBestOffsets(songBuckets) {
    const results = [];

    for (const [songId, offsets] of songBuckets) {
        let bestOffset = null;
        let bestVotes = 0;

        for (const [offset, bucket] of offsets) {
            const next = offsets.get(offset + 1);
            const votes = bucket.count + (next ? next.count : 0);
            if (votes > bestVotes) {
                bestVotes = votes;
                bestOffset = offset;
            }
        }

        if (bestOffset === null) continue;

        const a = offsets.get(bestOffset);
        const b = offsets.get(bestOffset + 1);

        results.push({
            songId,
            offsetFrames: bestOffset,
            votes: bestVotes,
            queryFrames: b ? a.queryFrames.concat(b.queryFrames) : a.queryFrames
        });
    }

    return results;
}

function analyzeMatchWindows(queryFrames, queryDuration) {
    const totalWindows = Math.max(1, Math.ceil(queryDuration / WINDOW_SECONDS));
    const framesPerWindow = FRAMES_PER_SECOND * WINDOW_SECONDS;
    const windowVotes = new Array(totalWindows).fill(0);

    for (const frame of queryFrames) {
        const idx = Math.floor(frame / framesPerWindow);
        if (idx >= 0 && idx < totalWindows) windowVotes[idx]++;
    }

    let matchedWindows = 0, strongWindows = 0, total = 0;
    for (const c of windowVotes) {
        if (c > 0) matchedWindows++;
        if (c >= STRONG_WINDOW_MIN_VOTES) strongWindows++;
        total += c;
    }

    return {
        matchedWindows,
        strongWindows,
        windowCoverage: (matchedWindows / totalWindows) * 100,
        averageVotesPerWindow: total / totalWindows
    };
}

function scoreMatches(candidates, totalQueryFingerprints, queryDuration) {
    return candidates
        .map((c) => {
            let first = Infinity, last = -Infinity;
            for (const f of c.queryFrames) {          // loop, NOT Math.min(...array) (stack overflow)
                if (f < first) first = f;
                if (f > last) last = f;
            }

            const w = analyzeMatchWindows(c.queryFrames, queryDuration);

            return {
                songId: c.songId,
                offset: (c.offsetFrames * HOP_SIZE) / SAMPLE_RATE,  // seconds into the song where query starts
                votes: c.votes,
                matchRatio: totalQueryFingerprints > 0 ? (c.votes / totalQueryFingerprints) * 100 : 0,
                temporalCoverage: queryDuration > 0
                    ? (((last - first) * HOP_SIZE) / SAMPLE_RATE / queryDuration) * 100
                    : 0,
                ...w
            };
        })
        .sort((a, b) => b.votes - a.votes);
}

function pickConfidentMatch(sorted) {
    const [best, second] = sorted;
    if (!best) return null;
    if (best.votes < MIN_VOTES) return null;
    if (best.windowCoverage < MIN_WINDOW_COVERAGE_PCT) return null;
    if (second && best.votes < second.votes * MIN_VOTE_MARGIN) return null;
    return best;
}

async function getMatchedSongs(bestMatches) {
    if (!bestMatches.length) return [];

    const songs = await Song.find({ _id: { $in: bestMatches.map((m) => m.songId) } })
        .select("title artist album duration coverImage audioUrl")
        .lean();

    const songMap = new Map(songs.map((s) => [s._id.toString(), s]));

    return bestMatches
        .map((m) => {
            const song = songMap.get(m.songId);
            if (!song) return null;
            const { songId, ...matchDetails } = m;
            return { song, matchDetails };
        })
        .filter(Boolean);
}

async function recognizeSong(queryHashes, queryFrames, queryDuration, limit = 5) {
    if (queryHashes.length === 0) return { match: null, candidates: [] };

    const songBuckets = await collectVotes(queryHashes, queryFrames);
    const sorted = scoreMatches(pickBestOffsets(songBuckets), queryHashes.length, queryDuration);

    const confident = pickConfidentMatch(sorted);
    const candidates = await getMatchedSongs(sorted.slice(0, limit));

    const match = confident
        ? candidates.find((c) => c.song._id.toString() === confident.songId) || null
        : null;

    return { match, candidates };
}

module.exports = { collectVotes, pickBestOffsets, scoreMatches, pickConfidentMatch, getMatchedSongs, recognizeSong };