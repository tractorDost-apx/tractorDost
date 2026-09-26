'use client';

import React from 'react';
import { DealerInventoryItem } from '@/types/models/dealerInventory';
import {
  Tractor,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Package,
  Tag,
} from 'lucide-react';

interface InventoryTableProps {
  items: DealerInventoryItem[];
  loading: boolean;
  onEdit: (item: DealerInventoryItem) => void;
  onDelete: (item: DealerInventoryItem) => void;
  onToggleAvailability: (item: DealerInventoryItem) => void;
  onAddClick: () => void;
  onListForSale?: (item: DealerInventoryItem) => void;
}

export function InventoryTable({
  items,
  loading,
  onEdit,
  onDelete,
  onToggleAvailability,
  onAddClick,
  onListForSale,
}: InventoryTableProps) {
  const getStockStatus = (item: DealerInventoryItem) => {
    if (!item.isAvailable) {
      return {
        label: 'Unavailable',
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        icon: Ban,
      };
    }
    if (item.stockCount > 0) {
      return {
        label: 'In Stock',
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        icon: CheckCircle2,
      };
    }
    if (item.expectedArrival) {
      return {
        label: 'Coming Soon',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        icon: Clock,
      };
    }
    return {
      label: 'Out of Stock',
      color: 'text-muted bg-foreground/5 border-[var(--border-subtle)]',
      icon: XCircle,
    };
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Loading Skeletons
  if (loading) {
    return (
      <div className="bg-foreground/5 p-6 rounded-3xl border border-[var(--border-subtle)] space-y-4">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-xs text-muted uppercase tracking-wider">
                <th className="py-3 px-4">Tractor / Model</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4">Expected Arrival</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-[var(--border-subtle)] animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-4 bg-foreground/10 rounded w-48 mb-1" />
                    <div className="h-3 bg-foreground/5 rounded w-24" />
                  </td>
                  <td className="py-4 px-4"><div className="h-4 bg-foreground/10 rounded w-20" /></td>
                  <td className="py-4 px-4"><div className="h-6 bg-foreground/10 rounded-full w-16" /></td>
                  <td className="py-4 px-4"><div className="h-6 bg-foreground/10 rounded-full w-24" /></td>
                  <td className="py-4 px-4"><div className="h-4 bg-foreground/10 rounded w-24" /></td>
                  <td className="py-4 px-4 text-right"><div className="h-8 bg-foreground/10 rounded-xl w-20 ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Empty State
  if (items.length === 0) {
    return (
      <div className="bg-foreground/5 p-12 rounded-3xl border border-[var(--border-subtle)] text-center max-w-xl mx-auto space-y-5 my-6">
        <div className="h-16 w-16 rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 flex items-center justify-center mx-auto">
          <Package size={32} />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-xl font-black text-foreground tracking-tight">No Inventory Items Found</h3>
          <p className="text-sm text-muted font-medium leading-relaxed">
            Your tractor inventory list is currently empty. Add catalog tractors or custom stock items to start managing your dealership availability.
          </p>
        </div>
        <button
          onClick={onAddClick}
          className="px-6 py-3 bg-[var(--color-brand-green)] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all shadow-md inline-flex items-center gap-2"
        >
          <Tractor size={18} /> + Add Inventory Item
        </button>
      </div>
    );
  }

  return (
    <div className="bg-foreground/5 p-4 sm:p-6 rounded-3xl border border-[var(--border-subtle)]">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] text-xs font-bold text-muted uppercase tracking-wider">
              <th className="py-3.5 px-4">Tractor / Model</th>
              <th className="py-3.5 px-4">Brand / Specs</th>
              <th className="py-3.5 px-4">Stock Count</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Expected Arrival</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)] text-sm font-medium">
            {items.map((item) => {
              const status = getStockStatus(item);
              const StatusIcon = status.icon;
              const title = item.tractorName || item.customModel || 'Unnamed Model';
              const isCatalog = Boolean(item.tractorId);

              return (
                <tr
                  key={item.inventoryId}
                  className="hover:bg-foreground/5 transition-colors group"
                >
                  {/* Model Name */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[var(--color-brand-green)]/10 border border-[var(--color-brand-green)]/20 flex items-center justify-center text-[var(--color-brand-green)] shrink-0">
                        <Tractor size={20} />
                      </div>
                      <div>
                        <div className="font-black text-foreground tracking-tight flex items-center gap-2">
                          <span>{title}</span>
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                              isCatalog
                                ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border-[var(--color-brand-green)]/20'
                                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                            }`}
                          >
                            {isCatalog ? 'Catalog' : 'Custom'}
                          </span>
                        </div>
                        <div className="text-xs text-muted font-mono mt-0.5">
                          ID #{item.inventoryId}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Brand / Specs */}
                  <td className="py-4 px-4">
                    <div className="space-y-0.5">
                      <div className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                        <Layers size={13} className="text-muted" />
                        {item.brand || 'N/A'}
                      </div>
                      {item.hp && (
                        <div className="text-xs text-muted flex items-center gap-1">
                          <Zap size={12} className="text-amber-500" />
                          {item.hp} HP
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Stock Count */}
                  <td className="py-4 px-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-foreground/5 border border-[var(--border-subtle)] font-mono font-black text-foreground">
                      <span className="text-[var(--color-brand-green)]">{item.stockCount}</span>
                      <span className="text-xs text-muted font-normal">units</span>
                    </div>
                  </td>

                  {/* Status & Availability Toggle */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${status.color}`}
                      >
                        <StatusIcon size={13} />
                        {status.label}
                      </span>

                      <button
                        onClick={() => onToggleAvailability(item)}
                        title={item.isAvailable ? 'Click to disable availability' : 'Click to enable availability'}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-colors ${
                          item.isAvailable
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-foreground/10 text-muted border border-[var(--border-subtle)]'
                        }`}
                      >
                        {item.isAvailable ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                  </td>

                  {/* Expected Arrival */}
                  <td className="py-4 px-4">
                    <div className="text-xs text-muted flex items-center gap-1.5">
                      <Calendar size={13} className="text-muted/70" />
                      <span>{formatDate(item.expectedArrival)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isCatalog && onListForSale && (
                        <button
                          onClick={() => onListForSale(item)}
                          className="px-3 py-1.5 rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)] hover:text-white transition-all border border-[var(--color-brand-green)]/20 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm"
                          title="List this inventory tractor for sale on Used Marketplace"
                        >
                          <Tag size={14} /> List for Sale
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-xl bg-foreground/5 hover:bg-[var(--color-brand-green)]/10 text-muted hover:text-[var(--color-brand-green)] transition-colors border border-[var(--border-subtle)]"
                        title="Edit inventory item"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="p-2 rounded-xl bg-foreground/5 hover:bg-rose-500/10 text-muted hover:text-rose-500 transition-colors border border-[var(--border-subtle)]"
                        title="Remove inventory item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-4">
        {items.map((item) => {
          const status = getStockStatus(item);
          const StatusIcon = status.icon;
          const title = item.tractorName || item.customModel || 'Unnamed Model';
          const isCatalog = Boolean(item.tractorId);

          return (
            <div
              key={item.inventoryId}
              className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 space-y-4 hover:border-[var(--color-brand-green)]/30 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[var(--color-brand-green)]/10 border border-[var(--color-brand-green)]/20 flex items-center justify-center text-[var(--color-brand-green)] shrink-0">
                    <Tractor size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground text-base leading-tight">
                      {title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-muted">
                        {item.brand || 'No Brand'}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                          isCatalog
                            ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border-[var(--color-brand-green)]/20'
                            : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                        }`}
                      >
                        {isCatalog ? 'Catalog' : 'Custom'}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${status.color}`}
                >
                  <StatusIcon size={12} />
                  {status.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-y border-[var(--border-subtle)] py-3">
                <div>
                  <span className="text-muted block text-[10px] uppercase font-bold">Stock Count</span>
                  <span className="font-black text-[var(--color-brand-green)] text-sm">{item.stockCount} units</span>
                </div>
                <div>
                  <span className="text-muted block text-[10px] uppercase font-bold">Expected Arrival</span>
                  <span className="font-medium text-foreground">{formatDate(item.expectedArrival)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => onToggleAvailability(item)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    item.isAvailable
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-foreground/10 text-muted border border-[var(--border-subtle)]'
                  }`}
                >
                  {item.isAvailable ? 'Availability Active' : 'Availability Disabled'}
                </button>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {isCatalog && onListForSale && (
                    <button
                      onClick={() => onListForSale(item)}
                      className="px-3 py-1.5 rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)] hover:text-white font-bold text-xs flex items-center gap-1 transition-all border border-[var(--color-brand-green)]/20"
                    >
                      <Tag size={14} /> List for Sale
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(item)}
                    className="px-3 py-1.5 rounded-xl bg-foreground/10 hover:bg-[var(--color-brand-green)]/20 text-foreground hover:text-[var(--color-brand-green)] font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
