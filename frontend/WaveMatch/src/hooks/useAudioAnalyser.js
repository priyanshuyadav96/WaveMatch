import { useCallback, useEffect, useRef, useState } from "react";

export function useAudioAnalyser() {
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const elementSources = useRef(new WeakMap()); // an <audio> can only be wrapped once
  const mic = useRef(null);
  const [analyser, setAnalyser] = useState(null);

  const init = useCallback(() => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const an = ctx.createAnalyser();
      an.fftSize = 2048;
      an.smoothingTimeConstant = 0.8;
      ctxRef.current = ctx;
      analyserRef.current = an;
      setAnalyser(an);
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const connectElement = useCallback(
    (audioEl) => {
      const ctx = init();
      if (elementSources.current.has(audioEl)) return;
      const src = ctx.createMediaElementSource(audioEl);
      src.connect(analyserRef.current); // for the waves
      src.connect(ctx.destination); // so you still hear it
      elementSources.current.set(audioEl, src);
    },
    [init]
  );

  const startMic = useCallback(async () => {
    const ctx = init();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const src = ctx.createMediaStreamSource(stream);
    src.connect(analyserRef.current); // not connected to destination
    mic.current = { stream, src };
    return stream; // reuse it for MediaRecorder
  }, [init]);

  const stopMic = useCallback(() => {
    if (!mic.current) return;
    mic.current.src.disconnect();
    mic.current.stream.getTracks().forEach((t) => t.stop());
    mic.current = null;
  }, []);

  useEffect(
    () => () => {
      stopMic();
      ctxRef.current?.close();
    },
    [stopMic]
  );

  return { analyser, connectElement, startMic, stopMic };
}