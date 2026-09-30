'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface MediaUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  existingMedia?: { id: number; url: string; type: string }[];
  onDeleteExisting?: (id: number) => void;
  maxFiles?: number;
  accept?: string;
  label?: string;
  description?: string;
}

export default function MediaUploader({
  files,
  onFilesChange,
  existingMedia = [],
  onDeleteExisting,
  maxFiles = 10,
  accept = 'image/*',
  label = 'Media Upload',
  description = 'Upload images or documents.',
}: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const totalCurrentFiles = files.length + existingMedia.length;
    if (totalCurrentFiles + newFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files in total.`);
      const allowedNewFiles = newFiles.slice(0, maxFiles - totalCurrentFiles);
      if (allowedNewFiles.length > 0) {
        onFilesChange([...files, ...allowedNewFiles]);
      }
    } else {
      onFilesChange([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-foreground text-sm font-bold">{label}</h4>
        {description && <p className="text-muted mt-1 text-xs font-medium">{description}</p>}
      </div>

      <div
        className={`relative flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          dragActive
            ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/5'
            : 'hover:border-foreground/40 border-[var(--border-brand)] bg-[var(--border-subtle)]'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="bg-background flex h-16 w-16 items-center justify-center rounded-full shadow-sm">
          <Upload size={28} className="text-[var(--color-brand-green)]" />
        </div>
        <div>
          <p className="text-foreground text-sm font-bold">Click to upload or drag and drop</p>
          <p className="text-muted mt-1 text-xs font-medium">SVG, PNG, JPG or PDF (max. 10MB)</p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleChange}
        />
      </div>

      {/* Previews */}
      {(files.length > 0 || existingMedia.length > 0) && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {/* Existing Media */}
          {existingMedia.map((media) => (
            <div
              key={media.id}
              className="group bg-foreground/5 relative aspect-square overflow-hidden rounded-xl border border-[var(--border-subtle)]"
            >
              {media.type.includes('image') || accept.includes('image') ? (
                <img src={media.url} alt="Media" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center">
                  <ImageIcon size={32} className="text-muted mb-2" />
                  <span className="text-muted text-[10px] font-bold break-all">Document</span>
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => onDeleteExisting && onDeleteExisting(media.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white transition-transform hover:scale-110"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-white uppercase">
                Existing
              </div>
            </div>
          ))}

          {/* New Files */}
          {files.map((file, idx) => (
            <div
              key={idx}
              className="group bg-foreground/5 relative aspect-square overflow-hidden rounded-xl border border-[var(--border-subtle)]"
            >
              {file.type.includes('image') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center">
                  <ImageIcon size={32} className="text-muted mb-2" />
                  <span className="text-muted text-[10px] font-bold break-all">{file.name}</span>
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white transition-transform hover:scale-110"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="absolute top-2 left-2 rounded bg-[var(--color-brand-green)]/90 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-white uppercase">
                New
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
