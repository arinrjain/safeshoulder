export function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left person — head */}
      <circle cx="34" cy="18" r="12" fill="currentColor" />
      {/* Right person — head */}
      <circle cx="66" cy="18" r="12" fill="currentColor" />

      {/* Left outer arm */}
      <path
        d="M10 42 C10 38 14 35 18 36 L34 40 L34 52 L16 50 C12 49 10 46 10 42 Z"
        fill="currentColor"
      />
      {/* Right outer arm */}
      <path
        d="M90 42 C90 38 86 35 82 36 L66 40 L66 52 L84 50 C88 49 90 46 90 42 Z"
        fill="currentColor"
      />

      {/* Shared body — two figures merged at center with arms around each other */}
      <path
        d="M22 38 C22 35 27 32 34 32 L34 32 C38 32 42 34 44 37 L50 44 L56 37 C58 34 62 32 66 32 C73 32 78 35 78 38 L78 72 C78 76 75 78 72 78 L62 78 L62 65 C62 62 56 60 50 60 C44 60 38 62 38 65 L38 78 L28 78 C25 78 22 76 22 72 Z"
        fill="currentColor"
      />

      {/* Left leg */}
      <rect x="28" y="76" width="14" height="20" rx="7" fill="currentColor" />
      {/* Right leg */}
      <rect x="58" y="76" width="14" height="20" rx="7" fill="currentColor" />

      {/* Left inner leg gap */}
      <rect x="40" y="76" width="20" height="20" rx="0" fill="currentColor" />

      {/* Center gap between legs */}
      <rect x="46" y="80" width="8" height="18" rx="4" fill="white" />
      <rect x="36" y="80" width="8" height="18" rx="4" fill="white" />

      {/* Arms crossing behind each other — right person's arm over left */}
      <path
        d="M66 40 C66 40 60 44 50 44 C40 44 34 40 34 40"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function LogoWithName({ size = 32, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`rounded-xl p-1.5 ${dark ? "bg-white/15" : "bg-white/20"}`}>
        <Logo size={size} className="text-white" />
      </div>
      <div>
        <p className="text-white font-bold text-xl leading-none tracking-tight">SafeShoulder</p>
        <p className="text-white/60 text-xs mt-0.5 leading-none">Here for you, always</p>
      </div>
    </div>
  );
}
