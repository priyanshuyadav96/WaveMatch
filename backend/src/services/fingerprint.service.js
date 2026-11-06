
const { decodeAudio } = require("./audioDecoder.service.js");
const { frameGenerator } = require("./frameExtractor.service.js");
const { computeFFT } = require("./fft.service.js");
const { extractAllPeaks } = require("./peakExtractor.service.js");
const { generateFingerprintHashes } = require("./fingerprintGenerator.service");
const { SAMPLE_RATE, FRAME_SIZE } = require("../config/audio.config");

// Pure function (no I/O) - easy to unit test
function fingerprintSamples(samples) {
    const allPeaks = [];
    let frameIndex = 0;

    // Stream frame -> FFT -> peaks; only the small peak lists are kept
    for (const frame of frameGenerator(samples)) {
        const magnitudes = computeFFT(frame, FRAME_SIZE);
        allPeaks.push({
            frameIndex,
            peaks: extractAllPeaks(magnitudes, SAMPLE_RATE, FRAME_SIZE)
        });
        frameIndex++;
    }

    // anchorFrames are integer frame indices (exact, no float time drift)
    return generateFingerprintHashes(allPeaks);
}

async function generateAudioFingerprints(filePath) {
    const audio = await decodeAudio(filePath);
    const { hashes, anchorFrames } = fingerprintSamples(audio.samples);

    return {
        hashes,
        anchorFrames,
        duration: audio.duration,
        sampleRate: SAMPLE_RATE
    };
}

module.exports = { generateAudioFingerprints, fingerprintSamples };