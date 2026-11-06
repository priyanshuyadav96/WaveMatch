export default function Navbar() {
  return (
    <header className="relative z-5 flex h-[76px] items-center justify-between border-b border-white/7 bg-ink/45 px-[7%] max-md:px-[5%] max-[480px]:h-[65px] max-[480px]:px-5">
      <a
        href="/"
        className="flex items-center gap-[11px] font-display text-[21px] font-bold tracking-[-0.8px] text-white no-underline max-[480px]:text-[19px]"
      >
        <span className="grid size-[35px] place-items-center rounded-[10px] bg-linear-to-br from-[#f04caa] to-[#a34be1] shadow-[0_0_22px_rgba(220,64,161,0.3)]">
          W
        </span>
        <span>
          Wave<span className="text-brand">Match</span>
        </span>
      </a>

      <div className="flex items-center gap-[9px] text-[9px] font-bold tracking-[1.5px] text-muted max-[480px]:text-[8px] max-[480px]:tracking-[0.7px] max-[350px]:text-[7px]">
        <span className="size-[7px] rounded-full bg-[#55d6a2] shadow-[0_0_10px_rgba(85,214,162,0.7)]" />
        AUDIO RECOGNITION
      </div>
    </header>
  );
}