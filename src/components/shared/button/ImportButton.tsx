'use client';

import { useRef, useState } from 'react';
import clsx from 'clsx';
import { Download } from 'lucide-react';
import IconButton from '@/src/components/shared/button/IconButton';

type Props = {
  label?: string;
  accept?: string;
  multiple?: boolean;
  showFilename?: boolean;
  onFilesSelected?: (files: FileList) => void;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
};

export default function ImportButton({
  label = 'Import',
  accept = '.csv,.xlsx,.xls',
  multiple = false,
  showFilename = true,
  onFilesSelected,
  className = '',
  disabled = false,
  children,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [filename, setFilename] = useState<string>('');

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files;
    if (files?.length) {
      const first = files[0].name;
      const extra = files.length > 1 ? ` +${files.length - 1}` : '';
      setFilename(first + extra);
      onFilesSelected?.(files);
      e.target.value = '';
    }
  };

  return (
    <div className={clsx('inline-flex items-center', className)}>
      <IconButton label='Import' onClick={openPicker} disabled={disabled}>
        {children || <Download size={18} />}
      </IconButton>

      {showFilename && filename && (
        <span
          className="ml-3 text-xs text-gray-500 truncate max-w-[200px]"
          title={filename}
        >
          {filename}
        </span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}
