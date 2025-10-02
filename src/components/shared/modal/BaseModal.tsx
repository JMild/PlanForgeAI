"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { CancelButton, SaveButton } from "../button/ActionButtons";

type ModalSize = "sm" | "md" | "lg" | "xl";

export type BaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void; 
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: boolean; 
  size?: ModalSize;
  dismissOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  showClose?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  className?: string;
  ariaLabel?: string;
};

function useIsMounted() {
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function sizeClass(size: ModalSize = "md") {
  switch (size) {
    case "sm": return "max-w-md";
    case "md": return "max-w-2xl";
    case "lg": return "max-w-4xl";
    case "xl": return "max-w-6xl";
    default: return "max-w-2xl";
  }
}

export default function BaseModal({
  isOpen,
  onClose,
  onSave, // <-- รับ prop นี้
  title,
  description,
  children,
  footer,
  size = "md",
  dismissOnBackdrop = true,
  closeOnEsc = true,
  showClose = true,
  initialFocusRef,
  className,
  ariaLabel,
}: BaseModalProps) {
  const mounted = useIsMounted();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const sentinelStart = useRef<HTMLSpanElement | null>(null);
  const sentinelEnd = useRef<HTMLSpanElement | null>(null);

  // Scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Esc to close
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeOnEsc, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    const first = initialFocusRef?.current || panelRef.current;
    first?.focus();
  }, [isOpen, initialFocusRef]);

  const onBackdropClick = () => { if (dismissOnBackdrop) onClose(); };
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : "modal-title"}
      onClick={onBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Focus trap sentinels */}
      <span ref={sentinelStart} tabIndex={0} className="sr-only" />

      {/* Panel */}
      <div
        ref={panelRef}
        className={[
          "relative w-full", sizeClass(size),
          "rounded-xl bg-white text-slate-900 shadow-2xl outline-none",
          "dark:bg-slate-900 dark:text-slate-50",
          "animate-in fade-in zoom-in-95 duration-150",
          "p-0"
        ].concat(className ? [className] : []).join(" ")}
        onClick={stop}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="min-w-0">
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold leading-6 truncate">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {description}
                </p>
              )}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className="ml-4 inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 modal-scrollable">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <CancelButton onClick={onClose} />
            <SaveButton onClick={onSave} />
          </div>
        )}
      </div>

      <span ref={sentinelEnd} tabIndex={0} className="sr-only" />
    </div>,
    document.body
  );
}
