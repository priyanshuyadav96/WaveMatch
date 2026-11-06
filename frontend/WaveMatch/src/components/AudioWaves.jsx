import { useEffect, useRef } from "react";

/**
 * Four layered sine waves on a <canvas>.
 *  - Idle (no analyser / active=false): waves drift randomly.
 *  - Live (analyser + active): each wave follows one frequency band.
 *      amplitude -> how loud that band is
 *      frequency -> where the strongest peak sits inside that band
 *      speed     -> how energetic that band is
 *
 * Props
 *  analyser  AnalyserNode from useAudioAnalyser()
 *  active    true while audio is playing or recording
 */

// Wave i listens to band i (Hz). Gain compensates for highs being quieter.
const BANDS = [
  { lo: 20, hi: 250, gain: 1.0 }, // bass
  { lo: 250, hi: 1000, gain: 1.4 }, // low-mid
  { lo: 1000, hi: 4000, gain: 1.9 }, // high-mid
  { lo: 4000, hi: 12000, gain: 2.8 }, // treble
];

const DEFAULT_COLORS = ["#e8d44d", "#8e6bd1", "#b3a08a", "#e0559e"];

const rand = (a, b) => a + Math.random() * (b - a);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const TAU = Math.PI * 2;

export default function AudioWaves({
  analyser = null,
  active = false,
  colors = DEFAULT_COLORS,
  lineWidth = 2.5,
  className,
  style,
}) {
  const canvasRef = useRef(null);
  const liveRef = useRef({ analyser, active });
  liveRef.current = { analyser, active }; // read inside the animation loop

  const colorKey = colors.join(",");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = performance.now();
    let nextIdleChange = 0;
    let buf = null;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const waves = BANDS.map((_, i) => ({
      color: colors[i % colors.length],
      amp: rand(0.15, 0.35),
      freq: rand(1, 2.5),
      speed: rand(0.4, 1),
      phase: rand(0, TAU),
      seed: rand(0, TAU),
      dir: i % 2 ? 1 : -1,
      idleAmp: 0.25,
      idleFreq: 1.5,
      idleSpeed: 0.6,
    }));

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const { analyser: an, active: isActive } = liveRef.current;
      const live = Boolean(an && isActive);

      // pick new random idle targets every few seconds
      if (now > nextIdleChange) {
        waves.forEach((wv) => {
          wv.idleAmp = rand(0.12, 0.42);
          wv.idleFreq = rand(0.8, 2.8);
          wv.idleSpeed = rand(0.3, 1.1);
        });
        nextIdleChange = now + rand(2500, 5000);
      }

      let bins = 0;
      let nyquist = 0;
      if (live) {
        bins = an.frequencyBinCount;
        nyquist = an.context.sampleRate / 2;
        if (!buf || buf.length !== bins) buf = new Uint8Array(bins);
        an.getByteFrequencyData(buf);
      }

      waves.forEach((wv, i) => {
        let tAmp, tFreq, tSpeed, k;

        if (live) {
          const { lo, hi, gain } = BANDS[i];
          const a = clamp(Math.floor((lo / nyquist) * bins), 0, bins - 1);
          const b = clamp(Math.ceil((hi / nyquist) * bins), a + 1, bins);
          let sum = 0;
          let peak = 0;
          let peakIdx = a;
          for (let n = a; n < b; n++) {
            sum += buf[n];
            if (buf[n] > peak) {
              peak = buf[n];
              peakIdx = n;
            }
          }
          const energy = sum / (b - a) / 255; // 0..1
          const peakHz = (peakIdx / bins) * nyquist;
          const t = clamp(Math.log(peakHz / lo) / Math.log(hi / lo), 0, 1);

          tAmp = clamp(Math.pow(energy, 0.9) * gain, 0.04, 1);
          tFreq = 1 + t * 3.5; // 1..4.5 cycles across the screen
          tSpeed = 0.5 + energy * 3;
          k = 1 - Math.exp(-dt * (tAmp > wv.amp ? 18 : 6)); // fast attack, slow release
        } else {
          tAmp = wv.idleAmp;
          tFreq = wv.idleFreq;
          tSpeed = wv.idleSpeed;
          k = 1 - Math.exp(-dt * 1.2);
        }

        wv.amp = lerp(wv.amp, tAmp, k);
        wv.freq = lerp(wv.freq, tFreq, k);
        wv.speed = lerp(wv.speed, tSpeed, k);
        wv.phase += dt * wv.speed * wv.dir;
      });

      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = lineWidth;
      ctx.lineJoin = "round";

      waves.forEach((wv) => {
        ctx.beginPath();
        for (let x = 0; x <= w + 3; x += 3) {
          const u = x / w;
          const env = 0.75 + 0.25 * Math.sin(u * TAU * 0.7 + wv.seed);
          const y =
            h / 2 +
            Math.sin(u * TAU * wv.freq + wv.phase) * wv.amp * h * 0.42 * env +
            Math.sin(u * TAU * wv.freq * 1.9 + wv.phase * 1.4 + wv.seed) *
              wv.amp * h * 0.08;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = wv.color;
        ctx.shadowColor = wv.color;
        ctx.shadowBlur = 8;
        ctx.stroke();
      });

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorKey, lineWidth]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}