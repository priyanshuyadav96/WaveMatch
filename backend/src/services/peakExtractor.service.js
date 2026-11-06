
const { frequencyBands } = require("../utils/frequency.utils");
const { MIN_PEAK_MAGNITUDE, PEAK_MEAN_RATIO } = require("../config/audio.config");

// Strongest bin inside one frequency band
function extractBandPeaks(magnitudes, sampleRate, frameSize, lowFreq, highFreq) {
    const binWidth = sampleRate / frameSize;

    const startBin = Math.max(1, Math.ceil(lowFreq / binWidth));
    const endBin = Math.min(magnitudes.length - 1, Math.ceil(highFreq / binWidth) - 1);

    let maxMagnitude = -Infinity;
    let maxBin = -1;

    for (let bin = startBin; bin <= endBin; bin++) {
        if (magnitudes[bin] > maxMagnitude) {
            maxMagnitude = magnitudes[bin];
            maxBin = bin;
        }
    }

    if (maxBin === -1) return null;

    return { bin: maxBin, frequency: maxBin * binWidth, magnitude: maxMagnitude };
}


function extractAllPeaks(magnitudes, sampleRate, frameSize) {
    const candidates = [];

    for (const [lowFreq, highFreq] of frequencyBands) {
        const peak = extractBandPeaks(magnitudes, sampleRate, frameSize, lowFreq, highFreq);

        // Absolute floor: silent frames must not produce hashes
        if (peak && peak.magnitude >= MIN_PEAK_MAGNITUDE) candidates.push(peak);
    }

    if (candidates.length === 0) return [];

    let sum = 0;
    for (const p of candidates) sum += p.magnitude;
    const threshold = (sum / candidates.length) * PEAK_MEAN_RATIO;

    return candidates.filter((p) => p.magnitude >= threshold);
}

module.exports = { extractBandPeaks, extractAllPeaks };