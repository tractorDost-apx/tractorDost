'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { DealerInventoryItem } from '@/types/models/dealerInventory';

interface DeleteInventoryModalProps {
  item: DealerInventoryItem;
  onClose: () => void;
  onConfirm: (inventoryId: number) => Promise<any>;
}

export function DeleteInventoryModal({
  item,
  onClose,
  onConfirm,
}: DeleteInventoryModalProps) {
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/25 dark:bg-black/60 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[var(--background)] text-foreground border border-rose-500/20 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6 text-center relative [backdrop-filter:none]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-muted hover:text-foreground hover:bg-foreground/10 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="h-16 w-16 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
          <AlertTriangle size={32} />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-foreground tracking-tight">
            Remove Inventory Item?
          </h3>
          <p className="text-sm text-muted font-medium leading-relaxed">
            Are you sure you want to remove <span className="font-bold text-foreground">&quot;{title}&quot;</span> from your dealership stock?
          </p>
          <p className="text-xs text-rose-500 font-bold pt-1">
            This action cannot be undone.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold">
            {error}
          </div>
        )}

        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-muted hover:text-foreground hover:bg-foreground/10 transition-colors w-1/2"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleDelete}
            className="px-5 py-2.5 bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-rose-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 w-1/2"
          >
            <Trash2 size={16} />
            {submitting ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}
