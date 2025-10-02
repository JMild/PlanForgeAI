import React from "react";

type TextareaProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
};

const TextArea: React.FC<TextareaProps> = ({
  label,
  value,
  onChange,
  placeholder = "",
  className = "",
  id,
  name,
  disabled = false,
  required = false,
  rows = 2,
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <textarea
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={`
          block w-full rounded-md border px-3 py-2 text-sm
          focus:outline-none focus:ring-2
          text-slate-900 placeholder:text-slate-400
          bg-white border-slate-300
          focus:border-sky-500 focus:ring-sky-500/30
          dark:text-slate-100 dark:placeholder:text-slate-500
          dark:bg-slate-900 dark:border-slate-700
          dark:focus:border-sky-500 dark:focus:ring-sky-500/40
          disabled:opacity-60 disabled:cursor-not-allowed
        `}
      />
    </div>
  );
};

export default TextArea;
