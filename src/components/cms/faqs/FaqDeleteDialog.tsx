'use client';

import React from 'react';
import { AlertCircle, Trash2, X, Loader2 } from 'lucide-react';
import { FAQ } from '@/lib/api/faq';

interface FaqDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  faq: FAQ | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export default function FaqDeleteDialog({
  isOpen,
  onClose,
  faq,
  onConfirm,
  isDeleting,
}: FaqDeleteDialogProps) {
  if (!isOpen || !faq) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-[var(--border-subtle)] bg-background p-6 shadow-2xl animate-scale-up">
        <div className="flex items-start gap-3.5 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500">
            <AlertCircle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-black text-foreground">Delete FAQ?</h3>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Are you sure you want to delete this FAQ? This action is permanent and
              cannot be undone.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-muted hover:text-foreground shrink-0 rounded-full p-1.5 hover:bg-foreground/5 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* FAQ preview card */}
        <div className="mb-5 rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-3.5">
          <div className="text-[10px] font-black uppercase tracking-wider text-muted mb-1">
            Question #{faq.id} ({faq.targetType})
          </div>
          <p className="text-xs font-bold text-foreground line-clamp-2">
            &ldquo;{faq.question}&rdquo;
          </p>
          {faq.slug && (
            <p className="mt-1 font-mono text-[10px] text-muted">
              /{faq.slug}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold text-foreground hover:bg-foreground/10 transition-all disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-500 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Delete FAQ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
