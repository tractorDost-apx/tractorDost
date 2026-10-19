'use client';

import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-150 dark:bg-black/75">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 dark:border-red-500/20 dark:bg-[#121814]">
        <div className="flex items-start gap-3.5 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-500">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-black text-zinc-900 dark:text-white">Delete FAQ?</h3>
            <p className="mt-1 text-xs text-zinc-600 leading-relaxed dark:text-zinc-400">
              Are you sure you want to delete this FAQ? This action is permanent and
              cannot be undone.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-all disabled:opacity-50 dark:border-transparent dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        {/* FAQ preview card */}
        <div className="mb-5 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 dark:border-white/10 dark:bg-black/40">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 dark:text-zinc-400">
            Question #{faq.id} ({faq.targetType})
          </div>
          <p className="text-xs font-semibold text-zinc-900 line-clamp-2 dark:text-white">
            &ldquo;{faq.question}&rdquo;
          </p>
          {faq.slug && (
            <p className="mt-1 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
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
            className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 transition-all disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-500 disabled:opacity-50 transition-all cursor-pointer"
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
