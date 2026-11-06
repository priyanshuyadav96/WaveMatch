
const Song = require("../models/song.model");
const Fingerprint = require("../models/fingerprint.model");

const BATCH_SIZE = 50000;

async function registerSong(songData, fingerprintData) {
    const title = songData.title.trim();
    const artist = songData.artist.trim();

    // Case-insensitive duplicate check
    const existing = await Song.findOne({ title, artist })
        .collation({ locale: "en", strength: 2 })
        .select("_id")
        .lean();

    if (existing) {
        const err = new Error("Song already registered");
        err.code = "DUPLICATE_SONG";
        throw err;
    }

    const { hashes, anchorFrames } = fingerprintData;

    const song = await Song.create({
        title,
        artist,
        album: songData.album || null,
        duration: fingerprintData.duration,
        fingerprintCount: hashes.length,
        coverImage: songData.coverImage || null,
        audioUrl: songData.audioUrl || null
    });

    try {
        // Build documents per batch instead of one giant array
        for (let start = 0; start < hashes.length; start += BATCH_SIZE) {
            const end = Math.min(start + BATCH_SIZE, hashes.length);
            const docs = new Array(end - start);

            for (let i = start; i < end; i++) {
                docs[i - start] = {
                    hash: hashes[i],
                    anchorFrame: anchorFrames[i],
                    songId: song._id
                };
            }

            // ordered:false is faster; we roll back everything on failure anyway
            await Fingerprint.insertMany(docs, { ordered: false });
        }

        return song;
    } catch (error) {
        await Fingerprint.deleteMany({ songId: song._id });
        await Song.findByIdAndDelete(song._id);
        throw error;
    }
}

module.exports = { registerSong };