const path = require("path");

const {
    generateAudioFingerprints
} = require("./src/services/fingerprint.service");

async function testFingerprintPipeline() {
    try {
        console.log("Starting fingerprint generation...\n");

        const filePath = path.join(__dirname, "../test/test_aud.mp3");

        const result = await generateAudioFingerprints(filePath);

        const fingerprintsPerTimestamp = new Map();

for (const timestamp of result.anchorTimes) {
    fingerprintsPerTimestamp.set(
        timestamp,
        (fingerprintsPerTimestamp.get(timestamp) || 0) + 1
    );
}

const counts = [...fingerprintsPerTimestamp.values()];

console.log("\nFingerprint distribution:");
console.log("Unique anchor timestamps:", counts.length);

console.log(
    "Average fingerprints per timestamp:",
    (result.hashes.length / counts.length).toFixed(2)
);

console.log("Maximum fingerprints at one timestamp:", Math.max(...counts));
console.log("Minimum fingerprints at one timestamp:", Math.min(...counts));

    } catch (error) {
        console.error("\nFingerprint generation failed:");
        console.error(error);
    }
}

testFingerprintPipeline();