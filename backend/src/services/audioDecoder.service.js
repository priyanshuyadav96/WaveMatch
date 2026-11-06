

const { spawn } = require("child_process");
const {
    SAMPLE_RATE,
    MAX_DURATION_SECONDS,
    FFMPEG_TIMEOUT_MS
} = require("../config/audio.config");

const decodeAudio = (filePath) => {
    return new Promise((resolve, reject) => {
        let settled = false;
        let timer = null;

        const finish = (fn, value) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            fn(value);
        };

        const ffmpeg = spawn("ffmpeg", [
            "-hide_banner",
            "-loglevel", "error",
            "-nostdin",
            "-i", filePath,
            "-map", "0:a:0",
            "-vn",
            "-ac", "1",
            "-ar", String(SAMPLE_RATE),
            "-t", String(MAX_DURATION_SECONDS),   // cap decoded length (memory safety)
            "-f", "f32le",
            "-acodec", "pcm_f32le",
            "pipe:1"
        ]);

        timer = setTimeout(() => {
            ffmpeg.kill("SIGKILL");
            finish(reject, new Error("FFmpeg timed out"));
        }, FFMPEG_TIMEOUT_MS);

        const chunks = [];
        let errorOutput = "";

        ffmpeg.stdout.on("data", (chunk) => chunks.push(chunk));
        ffmpeg.stderr.on("data", (chunk) => { errorOutput += chunk.toString(); });

        ffmpeg.on("error", (error) =>
            finish(reject, new Error(`Failed to start FFmpeg: ${error.message}`))
        );

        ffmpeg.on("close", (code) => {
            if (code !== 0) {
                return finish(reject, new Error(errorOutput || `FFmpeg exited with code ${code}`));
            }

            const pcmBuffer = Buffer.concat(chunks);

            if (pcmBuffer.length === 0 || pcmBuffer.length % 4 !== 0) {
                return finish(reject, new Error("Invalid or empty PCM audio data"));
            }

            // slice() copies, so the Float32Array is correctly aligned
            const samples = new Float32Array(
                pcmBuffer.buffer.slice(
                    pcmBuffer.byteOffset,
                    pcmBuffer.byteOffset + pcmBuffer.byteLength
                )
            );
            
            finish(resolve, {
                samples,
                sampleRate: SAMPLE_RATE,
                duration: samples.length / SAMPLE_RATE
            });
        });
    });
};

module.exports = { decodeAudio };