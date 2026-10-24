import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, Loader2, X } from 'lucide-react';

interface QuickCreateDialogProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  submitLabel: string;
  submitting: boolean;
  error: string | null;
  onSubmit: () => void;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Small dialog stacked on top of the employee form (role / department creation). It is rendered from
 * inside that form, so the form keeps its state while this is open.
 */
export function QuickCreateDialog({
  title,
  subtitle,
  icon: Icon,
  submitLabel,
  submitting,
  error,
  onSubmit,
  onClose,
  children,
}: QuickCreateDialogProps) {
  // Capture phase: handle Escape before the employee form's own listener, so only this dialog closes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      if (!submitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose, submitting]);

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div
        onClick={submitting ? undefined : onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />
      <form
        // React events bubble through portals: keep this submit away from the employee form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!submitting) onSubmit();
        }}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-create-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl"
      >
        <div className="bg-foreground/5 flex items-center justify-between border-b border-[var(--border-subtle)] p-5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl border border-lime-400/20 bg-lime-400/10 p-2 text-lime-400">
              <Icon size={18} />
            </div>
            <div>
              <h3 id="quick-create-title" className="text-foreground text-sm font-black">
                {title}
              </h3>
              <p className="text-muted text-[11px] font-medium">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-muted hover:text-foreground hover:bg-foreground/10 rounded-lg p-1.5 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {error && (
            <div
              className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400"
              role="alert"
            >
              <AlertCircle size={15} className="mt-px shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {children}
        </div>

        <div className="bg-foreground/5 flex justify-end gap-2 border-t border-[var(--border-subtle)] p-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-muted hover:text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 rounded-xl bg-lime-400 px-4 py-2 text-xs font-black tracking-wider text-black uppercase hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
