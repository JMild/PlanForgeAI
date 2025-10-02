import React from "react";
import { Search } from "lucide-react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
};

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "ค้นหา...",
  className = "",
  id,
  name,
}) => {
  return (
    <div className={`relative w-full sm:w-64 ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="search"
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          block w-full rounded-md border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm
          text-slate-900 placeholder:text-slate-400
          focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30

          dark:border-slate-700 dark:bg-slate-800
          dark:text-slate-100 dark:placeholder:text-slate-500
          dark:focus:border-sky-600 dark:focus:ring-sky-600/30
        `}
      />
    </div>
  );
};

export default SearchInput;
