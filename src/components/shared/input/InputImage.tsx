import React, { useRef, useState } from "react";

type InputImageProps = {
  label?: string;
  onChange: (file: File | null) => void;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
};

const InputImage: React.FC<InputImageProps> = ({
  label,
  onChange,
  className = "",
  id,
  name,
  required = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onChange(file);
    } else {
      setPreviewUrl(null);
      onChange(null);
    }
  };

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

      <div
        className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-md p-4 cursor-pointer hover:border-sky-500 transition"
        onClick={() => fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="preview"
            className="w-full h-48 object-contain rounded-md"
          />
        ) : (
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            คลิกเพื่อเลือกภาพ หรือ ลากไฟล์มาวางตรงนี้
          </div>
        )}
        <input
          type="file"
          id={id}
          name={name}
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          required={required}
        />
      </div>
    </div>
  );
};

export default InputImage;
