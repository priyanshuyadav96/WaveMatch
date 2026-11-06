const express = require("express");
const upload = require("../middleware/upload.middleware.js");
const { uploadAudio, recognizeAudio } = require("../controllers/audio.controller.js");

const router = express.Router();

// Upload a new song and its fingerprints.
router.post("/upload", upload.single("audio"), uploadAudio);

// Recognize an uploaded audio recording.
router.post("/recognize", upload.single("audio"), recognizeAudio);

module.exports = router;