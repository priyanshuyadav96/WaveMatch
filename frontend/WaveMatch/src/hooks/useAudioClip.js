import { useCallback, useEffect, useRef, useState } from "react";

const MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

/**
 * Owns the "current clip" (uploaded or recorded) and the recording state.
 * `clip.file` is a real File, ready to append to FormData when you add the API call.
 *
 * startMic / stopMic come from useAudioAnalyser so the waves can react to the mic.
 */
export function useAudioClip({ startMic, stopMic }) {
  const [clip, setClip] = useState(null); // { url, name, file }
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const recorderRef = useRef(null);
  const chunks = useRef([]);

  // Free the previous object URL whenever the clip changes (and on unmount)
  useEffect(() => {
    return () => {
      if (clip?.url) URL.revokeObjectURL(clip.url);
    };
  }, [clip]);

  const setFile = useCallback((file) => {
    setError("");
    setClip({ url: URL.createObjectURL(file), name: file.name, file });
  }, []);

  const start = useCallback(async () => {
    try {
      setError("");
      const stream = await startMic();
      const mimeType = MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      chunks.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      rec.onstop = () => {
        const type = rec.mimeType;
        const file = new File(chunks.current, `recording.${type.includes("mp4") ? "m4a" : "webm"}`, { type });
        setClip({ url: URL.createObjectURL(file), name: "Recorded audio", file });
      };

      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch (err) {
      console.error(err);
      stopMic(); // don't leave the microphone open if setup failed half-way
      setError("Microphone access failed. Please check your permissions.");
    }
  }, [startMic, stopMic]);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
    stopMic();
    setRecording(false);
  }, [stopMic]);

  const toggleRecording = useCallback(() => (recording ? stop() : start()), [recording, start, stop]);

  const clear = useCallback(() => {
    if (recording) stop();
    setClip(null);
    setError("");
  }, [recording, stop]);

  return { clip, recording, error, setFile, toggleRecording, clear };
}