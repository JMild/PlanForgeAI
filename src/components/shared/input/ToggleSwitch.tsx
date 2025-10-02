import React from "react";

type ToggleSwitchProps = {
  label?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  onLabel?: string;
  offLabel?: string;
  className?: string;
};

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  checked,
  onChange,
  onLabel,
  offLabel,
  className = "",
}) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {label && (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </span>
      )}

      <div className="flex items-center space-x-2">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only peer"
          />
          <div
            className="w-11 h-6 rounded-full
              bg-slate-300 dark:bg-slate-600
              peer-checked:bg-emerald-500 dark:peer-checked:bg-emerald-600
              transition-all"
          ></div>
          <div
            className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white
              peer-checked:translate-x-5
              transition-transform
              dark:bg-slate-100"
          ></div>
        </label>

        <span className="text-sm text-slate-600 dark:text-slate-400">
          {checked ? onLabel : offLabel}
        </span>
      </div>
    </div>
  );
};

export default ToggleSwitch;