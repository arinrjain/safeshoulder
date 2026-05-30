export function Illustrations({ dark }: { dark: boolean }) {
  const d = dark;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">

      {/* Left — person sitting cross-legged, calm and present */}
      <svg
        className={`absolute bottom-0 left-2 h-64 w-auto transition-opacity ${d ? "opacity-20" : "opacity-[0.13]"}`}
        viewBox="0 0 200 260"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="illu-lg-l" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={d ? "#818cf8" : "#6366f1"} />
            <stop offset="1" stopColor={d ? "#c084fc" : "#a855f7"} />
          </linearGradient>
        </defs>
        <ellipse cx="100" cy="38" rx="28" ry="32" fill="url(#illu-lg-l)" />
        <rect x="90" y="66" width="20" height="18" rx="8" fill="url(#illu-lg-l)" />
        <path d="M55 84 C42 88 38 110 38 130 C38 148 50 156 68 156 L100 158 L132 156 C150 156 162 148 162 130 C162 110 158 88 145 84 C136 79 118 76 100 76 C82 76 64 79 55 84 Z" fill="url(#illu-lg-l)" />
        <path d="M55 102 C40 114 26 126 20 144 C16 156 22 164 32 162 C40 160 46 148 52 136 C58 122 62 110 62 104 Z" fill="url(#illu-lg-l)" />
        <path d="M145 102 C160 114 174 126 180 144 C184 156 178 164 168 162 C160 160 154 148 148 136 C142 122 138 110 138 104 Z" fill="url(#illu-lg-l)" />
        <ellipse cx="26" cy="164" rx="13" ry="9" fill="url(#illu-lg-l)" />
        <ellipse cx="174" cy="164" rx="13" ry="9" fill="url(#illu-lg-l)" />
        <path d="M40 154 C30 170 24 192 30 212 C34 226 48 232 60 226 C70 220 74 204 78 188 C82 172 82 158 82 158 Z" fill="url(#illu-lg-l)" />
        <path d="M160 154 C170 170 176 192 170 212 C166 226 152 232 140 226 C130 220 126 204 122 188 C118 172 118 158 118 158 Z" fill="url(#illu-lg-l)" />
        <ellipse cx="100" cy="220" rx="54" ry="17" fill="url(#illu-lg-l)" />
        <path d="M93 10 C93 6 97 2 100 6 C103 2 107 6 107 10 C107 14 100 20 100 20 C100 20 93 14 93 10 Z" fill={d ? "#f9a8d4" : "#ec4899"} opacity="0.9" />
      </svg>

      {/* Right — person standing, arms open wide */}
      <svg
        className={`absolute bottom-0 right-2 h-72 w-auto transition-opacity ${d ? "opacity-20" : "opacity-[0.13]"}`}
        viewBox="0 0 220 300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="illu-lg-r" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={d ? "#a78bfa" : "#7c3aed"} />
            <stop offset="1" stopColor={d ? "#818cf8" : "#4f46e5"} />
          </linearGradient>
        </defs>
        <ellipse cx="110" cy="38" rx="30" ry="34" fill="url(#illu-lg-r)" />
        <rect x="99" y="70" width="22" height="20" rx="9" fill="url(#illu-lg-r)" />
        <path d="M72 92 C65 96 60 112 60 130 L60 192 C60 200 66 206 74 206 L146 206 C154 206 160 200 160 192 L160 130 C160 112 155 96 148 92 C140 87 122 84 110 84 C98 84 80 87 72 92 Z" fill="url(#illu-lg-r)" />
        <path d="M72 102 C56 93 38 82 22 70 C12 62 10 50 18 44 C26 38 38 44 50 56 C62 68 70 84 74 98 Z" fill="url(#illu-lg-r)" />
        <ellipse cx="14" cy="46" rx="13" ry="10" fill="url(#illu-lg-r)" />
        <path d="M148 102 C164 93 182 82 198 70 C208 62 210 50 202 44 C194 38 182 44 170 56 C158 68 150 84 146 98 Z" fill="url(#illu-lg-r)" />
        <ellipse cx="206" cy="46" rx="13" ry="10" fill="url(#illu-lg-r)" />
        <path d="M76 204 C70 222 66 244 68 264 C70 276 80 282 90 278 C98 274 100 258 102 244 C104 230 104 212 100 208 Z" fill="url(#illu-lg-r)" />
        <ellipse cx="80" cy="278" rx="19" ry="9" fill="url(#illu-lg-r)" />
        <path d="M144 204 C150 222 154 244 152 264 C150 276 140 282 130 278 C122 274 120 258 118 244 C116 230 116 212 120 208 Z" fill="url(#illu-lg-r)" />
        <ellipse cx="140" cy="278" rx="19" ry="9" fill="url(#illu-lg-r)" />
        <circle cx="12" cy="32" r="4" fill={d ? "#fde68a" : "#f59e0b"} opacity="0.9" />
        <circle cx="6" cy="46" r="2.5" fill={d ? "#fde68a" : "#f59e0b"} opacity="0.7" />
        <circle cx="208" cy="32" r="4" fill={d ? "#fde68a" : "#f59e0b"} opacity="0.9" />
        <circle cx="214" cy="46" r="2.5" fill={d ? "#fde68a" : "#f59e0b"} opacity="0.7" />
      </svg>

      {/* Center — two figures side by side, one comforting the other */}
      <svg
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-44 w-auto transition-opacity ${d ? "opacity-10" : "opacity-[0.07]"}`}
        viewBox="0 0 280 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="illu-lg-c" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={d ? "#c4b5fd" : "#4f46e5"} />
            <stop offset="1" stopColor={d ? "#818cf8" : "#7c3aed"} />
          </linearGradient>
        </defs>
        <ellipse cx="76" cy="28" rx="22" ry="25" fill="url(#illu-lg-c)" />
        <path d="M48 58 C42 66 40 82 40 98 L40 160 C40 166 45 170 52 170 L100 170 C107 170 112 166 112 160 L112 98 C112 82 110 66 104 58 C97 53 86 50 76 50 C66 50 55 53 48 58 Z" fill="url(#illu-lg-c)" />
        <path d="M48 72 C36 82 28 98 26 116 C24 128 30 136 38 134 C44 132 48 120 52 106 C56 92 56 78 54 70 Z" fill="url(#illu-lg-c)" />
        <path d="M104 68 C118 63 140 60 158 60 C168 60 172 67 170 75 C168 81 158 83 148 83 C136 83 120 78 108 75 Z" fill="url(#illu-lg-c)" />
        <path d="M52 168 C48 180 46 196 50 200 L70 200 L72 168 Z" fill="url(#illu-lg-c)" />
        <path d="M100 168 C104 180 106 196 102 200 L82 200 L80 168 Z" fill="url(#illu-lg-c)" />
        <ellipse cx="196" cy="32" rx="22" ry="25" fill="url(#illu-lg-c)" />
        <path d="M166 62 C160 70 158 86 158 102 L158 162 C158 168 163 172 170 172 L220 172 C227 172 232 168 232 162 L232 102 C232 86 230 70 224 62 C217 57 206 54 196 54 C186 54 175 57 166 62 Z" fill="url(#illu-lg-c)" />
        <path d="M166 74 C154 84 146 100 144 118 C142 130 148 138 156 136 C162 134 166 122 168 108 C172 94 172 80 170 72 Z" fill="url(#illu-lg-c)" />
        <path d="M224 74 C236 84 244 100 246 118 C248 130 242 138 234 136 C228 134 224 122 222 108 C218 94 218 80 220 72 Z" fill="url(#illu-lg-c)" />
        <path d="M168 170 C164 182 162 198 166 200 L186 200 L188 170 Z" fill="url(#illu-lg-c)" />
        <path d="M216 170 C220 182 222 198 218 200 L198 200 L196 170 Z" fill="url(#illu-lg-c)" />
      </svg>
    </div>
  );
}
