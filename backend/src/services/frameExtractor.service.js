
const { FRAME_SIZE, HOP_SIZE } = require("../config/audio.config");

const hannCache = new Map();

function getHannWindow(size) {
    let w = hannCache.get(size);
    if (!w) {
        w = new Float32Array(size);
        for (let n = 0; n < size; n++) {
            w[n] = 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (size - 1));
        }
        hannCache.set(size, w);
    }
    return w;
}

// Yields Hann-windowed frames one at a time (no giant frames array).
// The SAME buffer is reused for every yield: consume it before calling next().
function* frameGenerator(samples, windowSize = FRAME_SIZE, hopSize = HOP_SIZE) {
    const hann = getHannWindow(windowSize);
    const frame = new Float32Array(windowSize);

    for (let start = 0; start + windowSize <= samples.length; start += hopSize) {
        for (let n = 0; n < windowSize; n++) {
            frame[n] = samples[start + n] * hann[n];
        }
        yield frame;
    }
}

module.exports = { getHannWindow, frameGenerator };