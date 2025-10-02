"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";

type Props = {
  title?: React.ReactNode;
  description?: string;
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
      className={clsx(
        "py-2 z-40 overflow-visible",
        "border-b border-slate-200 dark:border-slate-700",
        "bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70",
        "dark:bg-slate-900/90 supports-[backdrop-filter]:dark:bg-slate-900/70",
        sticky && "sticky top-0",
        hasShadow ? "shadow-sm" : "shadow-none",
        className
      )}
    >
      {(title || actions) && (
        <div>
          <div className="min-w-0">
            {title && typeof title === "string" ? (
              <h1 className="text-xl md:text-2xl font-bold leading-tight">{title}</h1>
            ) : (
              title
            )}
            {description && typeof title === "string" ? (
              <p className="text-sm text-muted-foreground mt-1 truncate">{description}</p>
            ) : (
              description
            )}
          </div>
          {actions && <div className="flex items-center gap-2 min-w-0">{actions}</div>}
        </div>
      )}

      {tabs && (
        <div className="max-w-6xl mx-auto px-3 md:px-6 pb-2 overflow-x-auto">
          {tabs}
        </div>
      )}
    </header>
  );
}
