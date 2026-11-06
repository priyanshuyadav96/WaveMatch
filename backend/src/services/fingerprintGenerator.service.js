
const { encodeFingerprint } = require("../utils/fingerprint.utils");
const { TARGET_ZONE, FAN_OUT } = require("../config/audio.config");

// Pairs each anchor peak with the strongest peaks in the following TARGET_ZONE frames

function generateFingerprintHashes(allPeaks, targetZone = TARGET_ZONE, fanOut = FAN_OUT) {
    const hashes = [];
    const anchorFrames = [];

    for (let i = 0; i < allPeaks.length; i++) {
        const anchorFrame = allPeaks[i];
        if (anchorFrame.peaks.length === 0) continue;

        const targets = [];
        for (let j = i + 1; j <= i + targetZone && j < allPeaks.length; j++) {
            const delta = allPeaks[j].frameIndex - anchorFrame.frameIndex;
            for (const t of allPeaks[j].peaks) {
                targets.push({ bin: t.bin, delta, magnitude: t.magnitude });
            }
        }
        if (targets.length === 0) continue;

        targets.sort((a, b) => b.magnitude - a.magnitude);
        const chosen = targets.slice(0, fanOut);

        for (const anchor of anchorFrame.peaks) {
            for (const t of chosen) {
                hashes.push(encodeFingerprint(anchor.bin, t.bin, t.delta));
                anchorFrames.push(anchorFrame.frameIndex);
            }
        }
    }

    return {
        hashes: Uint32Array.from(hashes),
        anchorFrames: Uint32Array.from(anchorFrames)
    };
}

module.exports = { generateFingerprintHashes };