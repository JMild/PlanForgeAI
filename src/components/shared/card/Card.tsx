import React from "react";
import clsx from "clsx";

const accents = {
  danger:  { bg: "bg-red-500/15",  text: "text-red-400",  ring: "ring-red-500/20" },
  success: { bg: "bg-emerald-500/15", text: "text-emerald-400", ring: "ring-emerald-500/20" },
  warning: { bg: "bg-amber-500/15", text: "text-amber-400", ring: "ring-amber-500/20" },
  primary: { bg: "bg-blue-500/15",  text: "text-blue-400",  ring: "ring-blue-500/20" },
  ai:      { bg: "bg-indigo-500/15",text: "text-indigo-400",ring: "ring-indigo-500/20" },
} as const;

type AccentKey = keyof typeof accents;

type Stat = { label: string; value: string };

export default function Card({
  icon,
  title,
  value,
  unit,
  subtitle,
  accent = "primary",
  diff,               // e.g. { text: "+8% vs Plan", tone: "success" | "danger" | "warning" | "primary" | "ai" }
  badgeRight,         // e.g. "12 Machines"
  footerStats,        // e.g. [{label:"Avail.", value:"88%"}, ...]
  compact = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit?: string;
  subtitle?: string;
  accent?: AccentKey;
  diff?: { text: string; tone?: AccentKey };
  badgeRight?: string;
  footerStats?: Stat[];
  compact?: boolean;
}) {
  const tone = accents[accent] ?? accents.primary;
  const diffTone = diff?.tone ? accents[diff.tone] : accents.success;

  return (
    <div
      className={clsx(
        "relative rounded-xl border border-slate-800/60 bg-slate-850 p-5 shadow-sm",
        "ring-1 ring-inset ring-slate-900/10",
        compact && "p-4",
        "kpi-card"
      )}
      // optional style hook for custom theme
      style={{ backgroundColor: "rgb(27 36 52)" }} // close to #1B2434
    >
      {/* badge right */}
      {badgeRight && (
        <div className="absolute top-3 right-3">
          <span className="rounded-full bg-slate-700/60 px-3 py-1 text-xs text-slate-200">
            {badgeRight}
          </span>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* icon box */}
        <div
          className={clsx(
            "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg",
            tone.bg,
            "ring-1",
            tone.ring
          )}
        >
          <span className={clsx("text-xl", tone.text)}>{icon}</span>
        </div>

        {/* content */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-300/80">
            {title}
          </p>

          <div className="mt-1 flex items-baseline gap-2">
            <span className={clsx(compact ? "text-2xl" : "text-3xl", "font-bold text-slate-50")}>
              {value}
            </span>
            {unit && <span className="text-sm text-slate-400">{unit}</span>}

            {/* diff pill (left of subtitle, near value) */}
            {diff?.text && (
              <span
                className={clsx(
                  "ml-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  diffTone.bg,
                  diffTone.text,
                  "ring-1",
                  diffTone.ring
                )}
              >
                {diff.text}
              </span>
            )}
          </div>

          {subtitle && (
            <p className={clsx("mt-1 text-sm", tone.text)}>{subtitle}</p>
          )}
        </div>
      </div>

      {/* footer stats */}
      {footerStats && footerStats.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {footerStats.map((s, i) => (
            <div key={i} className="rounded-lg border border-slate-800/70 bg-slate-800/40 p-3 text-center">
              <div className="text-[11px] uppercase tracking-wide text-slate-400">{s.label}</div>
              <div className="mt-0.5 text-sm font-semibold text-slate-100">{s.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Tailwind note:
   Add this to globals if not present:
   .bg-slate-850 { background-color: #1f2a3a; }  // or keep inline style above
*/
