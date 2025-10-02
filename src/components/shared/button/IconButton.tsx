import React, { useState } from "react";
import clsx from "clsx";

type IconButtonVariant =
  | "add"
  | "edit"
  | "delete"
  | "view"
  | "save"
  | "cancel"
  | "warn"
  | "default";

type IconButtonProps = {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: IconButtonVariant;
  label?: string;
  tooltip?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
};

export default function IconButton({
  children,
  icon,
  onClick = () => {},
  variant = "default",
  label,
  tooltip,
  className = "",
  buttonClassName = "",
  disabled = false,
}: IconButtonProps) {
  const [show, setShow] = useState(false);

  const tipPos = "top-full left-1/2 -translate-x-1/2 mt-1";

  const variantClass: Record<IconButtonVariant, string> = {
    add: "bg-indigo-500 hover:bg-indigo-600 text-white dark:bg-indigo-600/90 dark:hover:bg-indigo-500",
    edit: "bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600/90 dark:hover:bg-blue-500",
    warn: "bg-rose-500 hover:bg-rose-600 text-white dark:bg-rose-500/90 dark:hover:bg-rose-500",
    delete: "bg-rose-500 hover:bg-rose-600 text-white dark:bg-rose-500/90 dark:hover:bg-rose-500",
    view: "bg-slate-300 hover:bg-slate-400 text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white",
    save: "bg-green-500 hover:bg-green-600 text-white dark:bg-green-600/90 dark:hover:bg-green-500",
    cancel:
      "bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition",
    default:
      "bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100",
  };

  return (
    <div className={clsx("relative inline-block", className)}>
      <button
        type="button"
        className={clsx(
          "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClass[variant],
          buttonClassName
        )}
        onClick={onClick}
        onMouseEnter={() => !disabled && setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => !disabled && setShow(true)}
        onBlur={() => setShow(false)}
        onTouchStart={() => !disabled && setShow(true)}
        onTouchEnd={() => setShow(false)}
        aria-label={label || tooltip || "button"}
        aria-disabled={disabled || undefined}
        disabled={disabled}
      >
        {icon && <span className="flex items-center">{icon}</span>}
        {(children || label) && (
          <span className="flex items-center whitespace-nowrap gap-2">
            {children}
            {label}
          </span>
        )}
      </button>

      {tooltip && (
        <div
          className={clsx(
            "absolute z-50 pointer-events-none select-none",
            "whitespace-nowrap rounded-md px-2 py-1 text-xs shadow-md",
            "ring-1 ring-black/10 dark:ring-white/10",
            "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900",
            "transition-all duration-150",
            tipPos,
            show ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
          role="tooltip"
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}
