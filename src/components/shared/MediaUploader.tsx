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
  accept = "image/*",
  label = "Media Upload",
  description = "Upload images or documents."
}: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
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
        <h4 className="text-sm font-bold text-foreground">{label}</h4>
        {description && <p className="text-xs text-muted font-medium mt-1">{description}</p>}
      </div>

      <div 
        className={`relative w-full rounded-2xl border-2 border-dashed transition-all p-8 flex flex-col items-center justify-center gap-4 text-center cursor-pointer ${
          dragActive 
            ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/5' 
            : 'border-foreground/20 bg-foreground/5 hover:border-foreground/40'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center shadow-sm">
          <Upload size={28} className="text-[var(--color-brand-green)]" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Click to upload or drag and drop</p>
          <p className="text-xs font-medium text-muted mt-1">SVG, PNG, JPG or PDF (max. 10MB)</p>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          
          {/* Existing Media */}
          {existingMedia.map((media) => (
            <div key={media.id} className="relative group rounded-xl overflow-hidden bg-foreground/5 aspect-square border border-foreground/10">
              {media.type.includes('image') || accept.includes('image') ? (
                <img src={media.url} alt="Media" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                   <ImageIcon size={32} className="text-muted mb-2" />
                   <span className="text-[10px] font-bold text-muted break-all">Document</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  type="button"
                  onClick={() => onDeleteExisting && onDeleteExisting(media.id)}
                  className="h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-black/60 text-white tracking-wider">
                Existing
              </div>
            </div>
          ))}

          {/* New Files */}
          {files.map((file, idx) => (
            <div key={idx} className="relative group rounded-xl overflow-hidden bg-foreground/5 aspect-square border border-foreground/10">
              {file.type.includes('image') ? (
                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                   <ImageIcon size={32} className="text-muted mb-2" />
                   <span className="text-[10px] font-bold text-muted break-all">{file.name}</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-[var(--color-brand-green)]/90 text-white tracking-wider">
                New
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
