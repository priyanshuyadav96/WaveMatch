import AudioWaves from "./AudioWaves";

export default function VisualizerBackground({ analyser, active }) {
  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[min(440px,55vh)] w-full -translate-x-1/2 -translate-y-[62%] max-md:h-[360px] max-md:w-[115%] max-[480px]:h-[300px] max-[480px]:w-[145%] max-[480px]:-translate-y-[70%]">
      <div className="absolute inset-x-[10%] inset-y-[15%] rounded-full bg-[rgba(190,48,135,0.12)] blur-[100px]" />

      <AudioWaves analyser={analyser} active={active} />

      {!active && (
        <div className="absolute inset-x-0 top-1/2 h-px bg-[rgba(234,126,190,0.16)] shadow-[0_0_18px_rgba(234,126,190,0.25)]">
          <span className="mx-auto -mt-[2px] block size-[5px] rounded-full bg-pink shadow-[0_0_15px_#ed77b9]" />
        </div>
      )}
    </div>
  );
}