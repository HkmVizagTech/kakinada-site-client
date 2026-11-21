"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { FigureName } from "@/lib/vanabhojanam/config";

/*
 * Small illustrations used on the highlight cards, the entry-pass card and the thank-you page.
 * The original site rendered these as 3D models; here they are hand-drawn SVGs in the same palette
 * (deep green, brass, ivory) that float gently and lean in when `active` (hover / touch).
 */

const BRASS = "#c9a24a";
const BRASS_LIGHT = "#f1dc9c";
const BRASS_DARK = "#966f2c";
const GREEN = "#1f5a3d";
const GREEN_DARK = "#12362a";
const IVORY = "#faf5e8";
const ROSE = "#bf7e86";

const Book = () => (
  <g>
    <ellipse cx="100" cy="132" rx="64" ry="8" fill="#000" opacity="0.28" />
    {/* cover */}
    <path d="M26 52 L100 66 L174 52 L174 120 L100 134 L26 120 Z" fill={BRASS_DARK} />
    {/* pages */}
    <path d="M32 50 Q66 42 100 58 L100 124 Q66 108 32 116 Z" fill={IVORY} />
    <path d="M168 50 Q134 42 100 58 L100 124 Q134 108 168 116 Z" fill="#efe6cd" />
    <g stroke="#b8a77a" strokeWidth="1.4" opacity="0.7" fill="none">
      {[68, 78, 88, 98].map((y) => (
        <g key={y}>
          <path d={`M42 ${y - 12} Q66 ${y - 18} 90 ${y - 6}`} />
          <path d={`M158 ${y - 12} Q134 ${y - 18} 110 ${y - 6}`} />
        </g>
      ))}
    </g>
    <path d="M100 58 L100 124" stroke={BRASS_DARK} strokeWidth="2.5" />
    {/* ribbon + sacred mark */}
    <path d="M118 60 L118 112 L124 106 L130 112 L130 62 Z" fill="#a8646f" />
    <circle cx="100" cy="30" r="14" fill={BRASS} opacity="0.22" />
    <path d="M100 20 C94 28 94 34 100 40 C106 34 106 28 100 20 Z" fill={BRASS_LIGHT} />
  </g>
);

const Ball = () => (
  <g>
    <ellipse cx="100" cy="134" rx="46" ry="7" fill="#000" opacity="0.28" />
    <circle cx="100" cy="82" r="48" fill={BRASS} />
    <circle cx="100" cy="82" r="48" fill="url(#vb-ball-shade)" />
    <g fill="none" stroke={GREEN_DARK} strokeWidth="3" strokeLinecap="round" opacity="0.85">
      <path d="M54 70 Q100 100 146 70" />
      <path d="M54 96 Q100 66 146 96" />
      <path d="M100 34 Q74 82 100 130" />
      <path d="M100 34 Q126 82 100 130" />
    </g>
    <ellipse cx="82" cy="56" rx="14" ry="8" fill="#fff" opacity="0.35" transform="rotate(-28 82 56)" />
    <defs>
      <radialGradient id="vb-ball-shade" cx="35%" cy="30%" r="75%">
        <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
        <stop offset="1" stopColor="#33250f" stopOpacity="0.45" />
      </radialGradient>
    </defs>
  </g>
);

const Mridanga = () => (
  <g>
    <ellipse cx="100" cy="136" rx="62" ry="7" fill="#000" opacity="0.28" />
    {/* body */}
    <path d="M30 80 C30 50 62 40 100 40 C138 40 170 50 170 80 C170 110 138 120 100 120 C62 120 30 110 30 80 Z" fill="#9a4b32" />
    <path d="M30 80 C30 56 62 48 100 48 C138 48 170 56 170 80" fill="none" stroke="#c4724f" strokeWidth="3" opacity="0.7" />
    {/* heads */}
    <ellipse cx="28" cy="80" rx="12" ry="26" fill={IVORY} stroke={BRASS_DARK} strokeWidth="3" />
    <ellipse cx="28" cy="80" rx="6" ry="13" fill="#2b1b12" />
    <ellipse cx="172" cy="80" rx="12" ry="26" fill={IVORY} stroke={BRASS_DARK} strokeWidth="3" />
    <ellipse cx="172" cy="80" rx="6" ry="13" fill="#2b1b12" />
    {/* straps */}
    <g stroke={BRASS_LIGHT} strokeWidth="3" strokeLinecap="round" opacity="0.9">
      {[50, 66, 82, 98, 114, 130, 146].map((x, i) => (
        <path key={x} d={i % 2 ? `M${x} 44 L${x + 14} 118` : `M${x} 118 L${x + 14} 44`} />
      ))}
    </g>
    <path d="M70 40 Q100 24 130 40" fill="none" stroke={BRASS} strokeWidth="5" strokeLinecap="round" />
  </g>
);

const Thali = () => (
  <g>
    <ellipse cx="100" cy="132" rx="66" ry="9" fill="#000" opacity="0.28" />
    <ellipse cx="100" cy="86" rx="72" ry="46" fill={BRASS_DARK} />
    <ellipse cx="100" cy="82" rx="72" ry="46" fill={BRASS} />
    <ellipse cx="100" cy="82" rx="58" ry="36" fill="none" stroke={BRASS_LIGHT} strokeWidth="2" opacity="0.8" />
    {/* rice */}
    <ellipse cx="100" cy="86" rx="22" ry="13" fill={IVORY} />
    <g fill="#efe6cd">{[[92, 82], [100, 79], [108, 83], [96, 90], [106, 90]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="4" ry="2" />)}</g>
    {/* katoris */}
    {[[54, 70, "#c46a2d"], [146, 70, "#6b8f3a"], [60, 98, "#d6b04a"], [140, 98, "#a64b32"]].map(([x, y, c], i) => (
      <g key={i}>
        <ellipse cx={x as number} cy={(y as number) + 3} rx="17" ry="9" fill={BRASS_DARK} />
        <ellipse cx={x as number} cy={y as number} rx="17" ry="9" fill={BRASS_LIGHT} />
        <ellipse cx={x as number} cy={y as number} rx="12" ry="6" fill={c as string} />
      </g>
    ))}
    {/* steam */}
    <g fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.45">
      <path d="M88 52 C82 44 94 40 88 30" />
      <path d="M104 50 C98 42 110 38 104 28" />
      <path d="M120 52 C114 44 126 40 120 30" />
    </g>
  </g>
);

const Pass = () => {
  // A decorative QR-like pattern (not scannable on purpose).
  const cells: [number, number][] = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if ((r * 7 + c * 13 + r * c) % 3 !== 0) cells.push([c, r]);
  const finder = (x: number, y: number) => (
    <g>
      <rect x={x} y={y} width="21" height="21" rx="3" fill={GREEN_DARK} />
      <rect x={x + 4} y={y + 4} width="13" height="13" rx="2" fill="#fff" />
      <rect x={x + 7.5} y={y + 7.5} width="6" height="6" rx="1" fill={GREEN_DARK} />
    </g>
  );
  return (
    <g>
      <ellipse cx="100" cy="146" rx="52" ry="6" fill="#000" opacity="0.28" />
      <rect x="46" y="14" width="108" height="130" rx="14" fill={IVORY} />
      <rect x="46" y="14" width="108" height="30" rx="14" fill={GREEN} />
      <rect x="46" y="30" width="108" height="14" fill={GREEN} />
      <circle cx="100" cy="14" r="6" fill="#0a1511" />
      <text x="100" y="35" textAnchor="middle" fontSize="11" fontWeight="700" fill={BRASS_LIGHT} letterSpacing="2">ENTRY PASS</text>
      <g transform="translate(66 56)">
        <rect width="68" height="68" rx="6" fill="#fff" />
        {finder(4, 4)}
        {finder(43, 4)}
        {finder(4, 43)}
        {cells
          .filter(([c, r]) => !(c < 3 && r < 3) && !(c > 5 && r < 3) && !(c < 3 && r > 5))
          .map(([c, r]) => (
            <rect key={`${c}-${r}`} x={4 + c * 6.7} y={4 + r * 6.7} width="5.2" height="5.2" rx="1" fill={GREEN_DARK} />
          ))}
      </g>
      <path d="M58 132 L142 132" stroke={BRASS} strokeWidth="2" strokeDasharray="4 4" />
      <path d="M92 138 L100 142 L108 138" fill="none" stroke={BRASS_DARK} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
};

const Lotus = () => {
  const petal = (angle: number, len: number, fill: string, w = 22) => (
    <path
      key={`${angle}-${len}`}
      d={`M100 118 C${100 - w} ${118 - len * 0.5} ${100 - w * 0.5} ${118 - len} 100 ${118 - len} C${100 + w * 0.5} ${118 - len} ${100 + w} ${118 - len * 0.5} 100 118 Z`}
      fill={fill}
      transform={`rotate(${angle} 100 118)`}
    />
  );
  return (
    <g>
      <ellipse cx="100" cy="132" rx="70" ry="9" fill="#0b241b" opacity="0.5" />
      <ellipse cx="100" cy="128" rx="78" ry="12" fill="#2f7a4f" opacity="0.7" />
      {[-72, -50, 50, 72].map((a) => petal(a, 58, "#c98a92", 20))}
      {[-34, 34].map((a) => petal(a, 70, ROSE, 22))}
      {[-16, 16].map((a) => petal(a, 78, "#e1b9bb", 22))}
      {petal(0, 84, "#f1d6d6", 24)}
      <circle cx="100" cy="94" r="9" fill={BRASS} />
      <g fill={BRASS_LIGHT}>{[-6, 0, 6].map((x) => <circle key={x} cx={100 + x} cy={90 + Math.abs(x) / 3} r="1.8" />)}</g>
    </g>
  );
};

const FIGURES: Record<FigureName, () => ReactNode> = { book: Book, ball: Ball, mridanga: Mridanga, thali: Thali, pass: Pass, lotus: Lotus };

/** `label` is read by screen readers; `active` makes the illustration lean in. `className` sets the size. */
export default function Figure({ name, label, active = false, className }: { name: FigureName; label: string; active?: boolean; className?: string }) {
  const Art = FIGURES[name];
  return (
    <div role="img" aria-label={label} className={cn("flex items-center justify-center", className)}>
      <svg
        viewBox="0 0 200 160"
        className={cn("h-full max-h-full w-auto max-w-full animate-vb-bob transition-transform duration-500", active && "scale-110")}
        style={{ filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.25))" }}
        aria-hidden="true"
      >
        <Art />
      </svg>
    </div>
  );
}
