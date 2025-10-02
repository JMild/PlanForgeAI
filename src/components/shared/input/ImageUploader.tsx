// components/shared/input/ImageUploader.tsx
import React, { useRef, useState, useEffect } from "react";

type Props = {
  value?: string;
  onChange: (imageData: string) => void;
};

export default function ImageUploader({ value, onChange }: Props) {
  const [preview, setPreview] = useState<string>(value || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      setPreview(value);
    }
  }, [value]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      readFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      readFile(file);
    }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border border-dashed border-slate-300 rounded-md p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-sky-500 transition w-full max-w-xs"
    >
      {preview ? (
        <img
          src={preview}
          alt="Preview"
        />
      ) : (
        <div className="text-sm text-gray-500">Drag & drop image or click to upload</div>
      )}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
