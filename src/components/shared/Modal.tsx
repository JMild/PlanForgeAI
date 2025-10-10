"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  /** เนื้อหาภายในโมดัล */
  children?: React.ReactNode;            // ✅ แก้ error children
  /** ปุ่ม/แอคชันด้านล่าง */
  footer?: React.ReactNode;
  /** ขนาดโมดัล */
  size?: ModalSize;
  /** แสดงปุ่มกากบาทปิด */
  showCloseButton?: boolean;
  /** คลิกฉากหลังเพื่อปิด */
  closeOnBackdrop?: boolean;
  /** เพิ่มคลาสเอง */
  className?: string;
  /** โฟกัสเริ่มต้นเมื่อเปิดโมดัล */
  initialFocusRef?: React.RefObject<HTMLElement>;
}

const sizeMap: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
  "2xl": "max-w-5xl",
  full: "max-w-[96vw]",
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "lg",
  showCloseButton = true,
  closeOnBackdrop = true,
  className = "",
  initialFocusRef,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // mount portal เฉพาะ client
  useEffect(() => setMounted(true), []);

  // ปิดด้วย ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // ล็อกสกรอล + โฟกัสเริ่มต้น
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      if (initialFocusRef?.current) initialFocusRef.current.focus();
      else closeBtnRef.current?.focus();
    }, 20);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [open, initialFocusRef]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {/* Wrapper: คลิกนอก panel แล้วปิดได้ (ถ้าเปิด closeOnBackdrop) */}
      <div
        className="relative min-h-screen flex items-start md:items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && closeOnBackdrop) onClose();
        }}
      >
        {/* Dialog Panel */}
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          className={[
            "w-full",
            sizeMap[size],
            "glass-modal rounded-xl border border-white/15 bg-white/10 shadow-2xl",
            "translate-y-0 opacity-100 transition-all duration-200",
            className,
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              {title ? (
                <div id={titleId} className="text-white text-lg font-semibold">
                  {title}
                </div>
              ) : (
                <span />
              )}
              {showCloseButton && (
                <button
                  ref={closeBtnRef}
                  onClick={onClose}
                  aria-label="Close modal"
                  className="p-2 rounded hover:bg-white/10 text-white/80"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
