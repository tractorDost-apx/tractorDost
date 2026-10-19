'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { DealerInventoryItem } from '@/types/models/dealerInventory';

interface DeleteInventoryModalProps {
  item: DealerInventoryItem;
  onClose: () => void;
  onConfirm: (inventoryId: number) => Promise<any>;
}

export function DeleteInventoryModal({ item, onClose, onConfirm }: DeleteInventoryModalProps) {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const title = item.tractorName || item.customModel || 'this item';

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await onConfirm(item.inventoryId);
      onClose();
    } catch (err: any) {
      console.error('Error deleting inventory item:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to remove inventory item.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/25 p-4 dark:bg-black/60">
      <div className="text-foreground relative w-full max-w-md space-y-6 overflow-hidden rounded-3xl border border-rose-500/20 bg-[var(--background)] p-6 text-center shadow-2xl [backdrop-filter:none]">
        <button
          onClick={onClose}
          className="text-muted hover:text-foreground hover:bg-foreground/10 absolute top-4 right-4 rounded-xl p-2 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-500">
          <AlertTriangle size={32} />
        </div>

        <div className="space-y-2">
          <h3 className="text-foreground text-xl font-black tracking-tight">
            Remove Inventory Item?
          </h3>
          <p className="text-muted text-sm leading-relaxed font-medium">
            Are you sure you want to remove{' '}
            <span className="text-foreground font-bold">&quot;{title}&quot;</span> from your
            dealership stock?
          </p>
          <p className="pt-1 text-xs font-bold text-rose-500">This action cannot be undone.</p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs font-bold text-rose-500">
            {error}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-foreground hover:bg-foreground/10 w-1/2 rounded-xl px-5 py-2.5 text-xs font-bold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleDelete}
            className="inline-flex w-1/2 items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={16} />
            {submitting ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}
