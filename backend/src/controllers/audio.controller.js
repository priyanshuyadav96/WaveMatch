
const fs = require("fs/promises");

const { generateAudioFingerprints } = require("../services/fingerprint.service");
const { registerSong } = require("../services/song.service");
const { recognizeSong } = require("../services/matching.service");

async function removeTempFile(file) {
    if (!file?.path) return;
    try {
        await fs.unlink(file.path);
    } catch (error) {
        if (error.code !== "ENOENT") console.error("UPLOAD CLEANUP ERROR:", error);
    }
}

const uploadAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Please upload an audio file" });
        }

        const { title, artist, album, coverImage, audioUrl } = req.body;

        if (!title?.trim() || !artist?.trim()) {
            return res.status(400).json({ success: false, message: "Song title and artist are required" });
        }

        const fingerprintData = await generateAudioFingerprints(req.file.path);

        if (fingerprintData.hashes.length === 0) {
            return res.status(422).json({ success: false, message: "Audio is too short or silent to fingerprint" });
        }

        const song = await registerSong(
            { title, artist, album, coverImage, audioUrl },
            fingerprintData
        );

        return res.status(201).json({
            success: true,
            message: "Song registered successfully",
            data: { song, fingerprintCount: fingerprintData.hashes.length }
        });

    } catch (error) {
        if (error.code === "DUPLICATE_SONG") {
            return res.status(409).json({ success: false, message: "This song is already registered" });
        }

        console.error("AUDIO REGISTRATION ERROR:", error);
        return res.status(500).json({ success: false, message: "Failed to register song" });

    } finally {
        await removeTempFile(req.file);
    }
};

const recognizeAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Please upload an audio file" });
        }

        const fingerprintData = await generateAudioFingerprints(req.file.path);

        if (fingerprintData.hashes.length === 0) {
            return res.status(422).json({ success: false, message: "Recording is too short or silent" });
        }

        const { match, candidates } = await recognizeSong(
            fingerprintData.hashes,
            fingerprintData.anchorFrames,
            fingerprintData.duration
        );

        if (!match) {
            return res.status(404).json({
                success: false,
                message: "No confident match found",
                // candidates are only exposed outside production, for threshold tuning
                ...(process.env.NODE_ENV !== "production" && { data: { candidates } })
            });
        }

        return res.status(200).json({
            success: true,
            message: "Song recognized",
            data: { match, candidates }
        });

    } catch (error) {
        console.error("AUDIO RECOGNITION ERROR:", error);
        return res.status(500).json({ success: false, message: "Failed to recognize audio" });

    } finally {
        await removeTempFile(req.file);
    }
};

module.exports = { uploadAudio, recognizeAudio };