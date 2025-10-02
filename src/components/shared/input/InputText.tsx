import { Calendar } from "lucide-react";
import React from "react";

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
  inputRef?: React.Ref<HTMLInputElement>; // เพิ่มตรงนี้
};

// forwardRef ยังคงทำงานได้เช่นเดิม
const InputText = React.forwardRef<HTMLInputElement, InputTextProps>(
  (
    {
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
      inputRef, // รับ prop inputRef
    },
    ref
  ) => {
    const isDate = type === "date";

    // ถ้ามีทั้ง ref และ inputRef ให้ merge
    const combinedRef = (node: HTMLInputElement) => {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;

      if (typeof inputRef === "function") inputRef(node);
      else if (inputRef) (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
    };

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={combinedRef} // ใช้ combinedRef
            type={type}
            id={id}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={[
              "block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2",
              "text-slate-900 placeholder:text-slate-400 bg-white border-slate-300",
              "focus:border-sky-500 focus:ring-sky-500/30",
              "dark:text-slate-100 dark:placeholder:text-slate-500 dark:bg-slate-900 dark:border-slate-700",
              "dark:focus:border-sky-500 dark:focus:ring-sky-500/40",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              isDate ? "pr-10" : "",
              isDate ? "[&::-webkit-calendar-picker-indicator]:opacity-0" : "",
              isDate ? "[&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden" : "",
            ].join(" ")}
          />

          {isDate && (
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center" aria-hidden="true">
              <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-400" />
            </span>
          )}
        </div>
      </div>
    );
  }
);

export default InputText;
