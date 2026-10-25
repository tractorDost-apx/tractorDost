'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Dialog({
  open,
  onOpenChange,
  children,
  title,
  description,
  maxWidth = 'md',
}: DialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const widthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Card */}
      <div
        className={`relative z-10 w-full ${widthClass} overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200`}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close modal"
          className="absolute right-5 top-5 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {title && (
          <div className="mb-4 pr-8">
            <h3 className="text-lg font-extrabold tracking-tight text-foreground">{title}</h3>
            {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
          </div>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
}

export default Dialog;
