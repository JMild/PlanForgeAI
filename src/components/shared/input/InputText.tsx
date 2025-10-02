import React from "react";
import { Calendar } from "lucide-react";

type InputTextProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  type?: string; // "text" | "date" | ...
  disabled?: boolean;
  required?: boolean;
};

const InputText: React.FC<InputTextProps> = ({
  label,
  value,
  onChange,
  placeholder = "",
  className = "",
  id,
  name,
  type = "text",
  disabled = false,
  required = false,
}) => {
  const isDate = type === "date";

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={[
            // base
            "block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2",
            // light
            "text-slate-900 placeholder:text-slate-400 bg-white border-slate-300",
            "focus:border-sky-500 focus:ring-sky-500/30",
            // dark
            "dark:text-slate-100 dark:placeholder:text-slate-500 dark:bg-slate-900 dark:border-slate-700",
            "dark:focus:border-sky-500 dark:focus:ring-sky-500/40",
            // disabled
            "disabled:opacity-60 disabled:cursor-not-allowed",
            // space for the custom icon (only for date)
            isDate ? "pr-10" : "",
            // hide native calendar icon (Chromium/WebKit)
            // Tailwind arbitrary selector for pseudo-element
            isDate ? "[&::-webkit-calendar-picker-indicator]:opacity-0" : "",
            // also remove default spinner style inconsistencies
            isDate ? "[&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden" : "",
          ].join(" ")}
        />

        {/* custom calendar icon for date input */}
        {isDate && (
          <span
            className="pointer-events-none absolute inset-y-0 right-2 flex items-center"
            aria-hidden="true"
          >
            <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-400" />
          </span>
        )}
      </div>
    </div>
  );
};

export default InputText;
