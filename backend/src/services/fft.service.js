// computes fft of windows
function computeFFT(window, frameSize) {
    const N = frameSize;

    if (
        N <= 0 ||
        (N & (N - 1)) !== 0 ||
        window.length < N
    ) {
        throw new Error("Invalid FFT size or input length");
    }

    const re = new Float32Array(N);
    const im = new Float32Array(N);

    // Initialize complex input
    for (let i = 0; i < N; i++) {
        re[i] = window[i];
    }

    // Bit reversal
    for (let i = 1, j = 0; i < N; i++) {
        let bit = N >> 1;

        for (; j & bit; bit >>= 1) {
            j ^= bit;
        }

        j ^= bit;

        if (i < j) {
            [re[i], re[j]] = [re[j], re[i]];
            [im[i], im[j]] = [im[j], im[i]];
        }
    }

    // FFT butterfly stages
    for (let len = 2; len <= N; len <<= 1) {
        const ang = (-2 * Math.PI) / len;

        const wRe = Math.cos(ang);
        const wIm = Math.sin(ang);

        for (let i = 0; i < N; i += len) {
            let curRe = 1;
            let curIm = 0;

            for (let j = 0; j < len / 2; j++) {
                const evenRe = re[i + j];
                const evenIm = im[i + j];

                const oddRe = re[i + j + len / 2];
                const oddIm = im[i + j + len / 2];

                const vRe = oddRe * curRe - oddIm * curIm;
                const vIm = oddRe * curIm + oddIm * curRe;

                re[i + j] = evenRe + vRe;
                im[i + j] = evenIm + vIm;

                re[i + j + len / 2] = evenRe - vRe;
                im[i + j + len / 2] = evenIm - vIm;

                const nextRe = curRe * wRe - curIm * wIm;
                curIm = curRe * wIm + curIm * wRe;
                curRe = nextRe;
            }
        }
    }

    // Magnitude spectrum (positive frequencies)
    const magnitudes = new Float32Array(N / 2);

    for (let k = 0; k < N / 2; k++) {
        magnitudes[k] = Math.hypot(re[k], im[k]);
    }

    return magnitudes;
}

// applies above fft function to each window to return Frequency/time data
function getFrequencyData(sampleWindows, frameSize = 1024) {
    const allMagnitudes = [];

    for (const window of sampleWindows) {
        const magnitudes = computeFFT(window, frameSize);
        allMagnitudes.push(magnitudes);
    }

    return allMagnitudes;
}

module.exports = {
    computeFFT,
    getFrequencyData
};