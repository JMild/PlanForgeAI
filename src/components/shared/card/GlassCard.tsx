import React, { PropsWithChildren, CSSProperties, ReactNode } from "react";

type GlassCardProps = PropsWithChildren<{
  className?: string;      // เพิ่ม className สำหรับปรับข้างนอก
  style?: CSSProperties;   // เพิ่ม style inline ถ้าต้องการ
  title?: ReactNode;       // title เป็น ReactNode
  subtitle?: ReactNode;    // subtitle เป็น ReactNode
}>;

export default function GlassCard({
  children,
  className = "",
  style = {},
  title,
  subtitle,
}: GlassCardProps) {
  return (
    <div
      className={[
        "relative rounded-3xl p-6",
        "bg-white/15 backdrop-blur-xl",
        "border border-white/25",
        "shadow-[0_10px_40px_-10px_rgba(0,0,0,0.45)]",
        className,
      ].join(" ")}
      style={style}
    >
      {/* highlight line */}
      <div className="pointer-events-none absolute inset-x-4 -top-0.5 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

      {/* Title / Subtitle */}
      {(title || subtitle) && (
        <div className="text-center mb-6">
          {title && <div className="text-3xl font-bold text-white mb-2 tracking-tight">{title}</div>}
          {subtitle && <div className="text-white/70">{subtitle}</div>}
        </div>
      )}

      {/* Main content */}
      {children}
    </div>
  );
}
