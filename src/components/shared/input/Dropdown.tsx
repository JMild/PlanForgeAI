import React from "react";

type Option<T extends string> = {
  label: string;
  value: T;
  disabled?: boolean;
};

type DropdownProps<T extends string> = {
  label?: string;
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  "aria-label"?: string;
};

function Dropdown<T extends string>({
  label,
  value,
  onChange,
  options,
  placeholder,
  className = "",
  id,
  name,
  disabled = false,
  required = false,
  "aria-label": ariaLabel,
}: DropdownProps<T>) {
  return (
    <div className={`${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="
          block
          w-full
          rounded-md
          border
          px-3
          py-2
          text-sm
          focus:outline-none
          focus:ring-2

          text-slate-900 placeholder:text-slate-400
          bg-white border-slate-300
          focus:border-sky-500 focus:ring-sky-500/30

          dark:text-slate-100 dark:placeholder:text-slate-500
          dark:bg-slate-900 dark:border-slate-700
          dark:focus:border-sky-500 dark:focus:ring-sky-500/40

          disabled:opacity-60 disabled:cursor-not-allowed
          truncate
        "
        disabled={disabled}
        required={required}
        aria-label={ariaLabel}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Dropdown;
