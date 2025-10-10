"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";

type Props = {
  title?: React.ReactNode;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  sticky?: boolean;
  shadowOnScroll?: boolean;
  className?: string;
};

export default function PageHeader({
  title,
  description,
  actions,
  tabs,
  sticky = true,
  shadowOnScroll = true,
  className,
}: Props) {
  const [hasShadow, setHasShadow] = useState(false);

  useEffect(() => {
    if (!shadowOnScroll) return;
    const onScroll = () => setHasShadow(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [shadowOnScroll]);

  return (
    <header
      id="app-header-slot"
      className={clsx(
        "relative z-40 overflow-visible text-white",
        "bg-white/10 dark:bg-black/20 backdrop-blur-md",
        "supports-[backdrop-filter]:bg-white/15 dark:supports-[backdrop-filter]:bg-black/15",
        "border-b border-white/15",
        sticky && "sticky top-0",
        hasShadow
          ? // เงาโทนไซยาตอนสกรอลล์
            "shadow-[0_18px_40px_-18px_rgba(0,200,255,0.28)]"
          : "shadow-none",
        className
      )}
    >
      {(title || actions || description) && (
        <div className="max-w-7xl mx-auto pl-4 pr-6 md:pl-6 md:pr-8 py-4">
          <div className="flex items-center justify-between gap-3 flex-wrap md:flex-nowrap">
            <div className="min-w-0">
              {typeof title === "string" ? (
                <h1 className="text-xl md:text-2xl font-bold leading-tight">{title}</h1>
              ) : (
                title
              )}

              {description &&
                (typeof description === "string" ? (
                  <p className="text-sm text-white/70 mt-1 truncate">{description}</p>
                ) : (
                  <div className="mt-1 text-white/80">{description}</div>
                ))}
            </div>

            {actions && (
              // 👉 ดันไปขวาเสมอ + กันบีบ + เผื่อช่องขวา
              <div className="flex items-center gap-3 min-w-0 ml-auto shrink-0 pr-1">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {tabs && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-2">
          <div className="overflow-x-auto">
            {/* แนะนำสไตล์แท็บให้เข้าโทน:
               - inactive: text-white/85 hover:bg-cyan-500/10
               - active: bg-cyan-600/20 text-cyan-100 border border-cyan-500/30
            */}
            {tabs}
          </div>
        </div>
      )}
    </header>
  );
}
