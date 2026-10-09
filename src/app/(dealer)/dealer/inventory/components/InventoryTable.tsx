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
      <div className="bg-foreground/5 space-y-4 rounded-3xl border border-[var(--border-subtle)] p-6">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="text-muted border-b border-[var(--border-subtle)] text-xs tracking-wider uppercase">
                <th className="px-2 lg:px-3 py-3">Tractor / Model</th>
                <th className="px-2 lg:px-3 py-3">Brand</th>
                <th className="px-2 lg:px-3 py-3">Stock</th>
                <th className="px-2 lg:px-3 py-3">Availability</th>
                <th className="px-2 lg:px-3 py-3">Expected Arrival</th>
                <th className="px-2 lg:px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-[var(--border-subtle)]">
                  <td className="px-2 lg:px-3 py-3">
                    <div className="bg-foreground/10 mb-1 h-4 w-48 rounded" />
                    <div className="bg-foreground/5 h-3 w-24 rounded" />
                  </td>
                  <td className="px-2 lg:px-3 py-3">
                    <div className="bg-foreground/10 h-4 w-20 rounded" />
                  </td>
                  <td className="px-2 lg:px-3 py-3">
                    <div className="bg-foreground/10 h-6 w-16 rounded-full" />
                  </td>
                  <td className="px-2 lg:px-3 py-3">
                    <div className="bg-foreground/10 h-6 w-24 rounded-full" />
                  </td>
                  <td className="px-2 lg:px-3 py-3">
                    <div className="bg-foreground/10 h-4 w-24 rounded" />
                  </td>
                  <td className="px-2 lg:px-3 py-3 text-right">
                    <div className="bg-foreground/10 ml-auto h-8 w-20 rounded-xl" />
                  </td>
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
      <div className="bg-foreground/5 mx-auto my-6 max-w-xl space-y-5 rounded-3xl border border-[var(--border-subtle)] p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
          <Package size={32} />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-foreground text-xl font-black tracking-tight">
            No Inventory Items Found
          </h3>
          <p className="text-muted text-sm leading-relaxed font-medium">
            Your tractor inventory list is currently empty. Add catalog tractors or custom stock
            items to start managing your dealership availability.
          </p>
        </div>
        <button
          onClick={onAddClick}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-3 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:opacity-90"
        >
          <Tractor size={18} /> + Add Inventory Item
        </button>
      </div>
    );
  }

  return (
    <div className="bg-foreground/5 rounded-3xl border border-[var(--border-subtle)] p-4 sm:p-6">
      {/* Desktop Table View */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="text-muted border-b border-[var(--border-subtle)] text-xs font-bold tracking-wider uppercase">
              <th className="px-2 lg:px-3 py-3">Tractor / Model</th>
              <th className="px-2 lg:px-3 py-3">Brand / Specs</th>
              <th className="px-2 lg:px-3 py-3">Stock Count</th>
              <th className="px-2 lg:px-3 py-3">Status</th>
              <th className="px-2 lg:px-3 py-3">Expected Arrival</th>
              <th className="px-2 lg:px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)] text-xs font-medium">
            {items.map((item) => {
              const status = getStockStatus(item);
              const StatusIcon = status.icon;
              const title = item.tractorName || item.customModel || 'Unnamed Model';
              const isCatalog = Boolean(item.tractorId);

              return (
                <tr
                  key={item.inventoryId}
                  className="hover:bg-foreground/5 group transition-colors"
                >
                  {/* Model Name */}
                  <td className="px-2 lg:px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                        <Tractor size={20} />
                      </div>
                      <div>
                        <div className="text-foreground flex items-center gap-2 font-black tracking-tight">
                          <span>{title}</span>
                          <span
                            className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase ${isCatalog
                              ? 'border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]'
                              : 'border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                              }`}
                          >
                            {isCatalog ? 'Catalog' : 'Custom'}
                          </span>
                        </div>
                        <div className="text-muted mt-0.5 font-mono text-xs">
                          ID #{item.inventoryId}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Brand / Specs */}
                  <td className="px-2 lg:px-3 py-3">
                    <div className="space-y-0.5">
                      <div className="text-foreground flex items-center gap-1.5 text-xs font-bold">
                        <Layers size={13} className="text-muted" />
                        {item.brand || 'N/A'}
                      </div>
                      {item.hp && (
                        <div className="text-muted flex items-center gap-1 text-xs">
                          <Zap size={12} className="text-amber-500" />
                          {item.hp} HP
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Stock Count */}
                  <td className="px-2 lg:px-3 py-3">
                    <div className="bg-foreground/5 text-foreground inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-3 py-1 font-mono font-black">
                      <span className="text-[var(--color-brand-green)]">{item.stockCount}</span>
                      <span className="text-muted text-xs font-normal">units</span>
                    </div>
                  </td>

                  {/* Status & Availability Toggle */}
                  <td className="px-2 lg:px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${status.color}`}
                      >
                        <StatusIcon size={13} />
                        {status.label}
                      </span>

                      <button
                        onClick={() => onToggleAvailability(item)}
                        title={
                          item.isAvailable
                            ? 'Click to disable availability'
                            : 'Click to enable availability'
                        }
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase transition-colors ${item.isAvailable
                          ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-foreground/10 text-muted border border-[var(--border-subtle)]'
                          }`}
                      >
                        {item.isAvailable ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                  </td>

                  {/* Expected Arrival */}
                  <td className="px-2 lg:px-3 py-3">
                    <div className="text-muted flex items-center gap-1.5 text-xs">
                      <Calendar size={13} className="text-muted/70" />
                      <span>{formatDate(item.expectedArrival)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-2 lg:px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isCatalog && onListForSale && (
                        <button
                          onClick={() => onListForSale(item)}
                          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1.5 text-xs font-bold text-[var(--color-brand-green)] shadow-sm transition-all hover:bg-[var(--color-brand-green)] hover:text-white"
                          title="List this inventory tractor for sale on Used Marketplace"
                        >
                          <Tag size={14} /> List for Sale
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(item)}
                        className="bg-foreground/5 text-muted rounded-xl border border-[var(--border-subtle)] p-2 transition-colors hover:bg-[var(--color-brand-green)]/10 hover:text-[var(--color-brand-green)]"
                        title="Edit inventory item"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="bg-foreground/5 text-muted rounded-xl border border-[var(--border-subtle)] p-2 transition-colors hover:bg-rose-500/10 hover:text-rose-500"
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
      <div className="space-y-4 md:hidden">
        {items.map((item) => {
          const status = getStockStatus(item);
          const StatusIcon = status.icon;
          const title = item.tractorName || item.customModel || 'Unnamed Model';
          const isCatalog = Boolean(item.tractorId);

          return (
            <div
              key={item.inventoryId}
              className="bg-foreground/5 space-y-4 rounded-2xl border border-[var(--border-subtle)] p-4 transition-all hover:border-[var(--color-brand-green)]/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                    <Tractor size={20} />
                  </div>
                  <div>
                    <h4 className="text-foreground text-base leading-tight font-black">{title}</h4>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-muted text-xs font-bold">
                        {item.brand || 'No Brand'}
                      </span>
                      <span
                        className={`py-0.2 rounded border px-1.5 font-mono text-[9px] uppercase ${isCatalog
                          ? 'border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]'
                          : 'border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                          }`}
                      >
                        {isCatalog ? 'Catalog' : 'Custom'}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${status.color}`}
                >
                  <StatusIcon size={12} />
                  {status.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 border-y border-[var(--border-subtle)] py-3 text-xs">
                <div>
                  <span className="text-muted block text-[10px] font-bold uppercase">
                    Stock Count
                  </span>
                  <span className="text-sm font-black text-[var(--color-brand-green)]">
                    {item.stockCount} units
                  </span>
                </div>
                <div>
                  <span className="text-muted block text-[10px] font-bold uppercase">
                    Expected Arrival
                  </span>
                  <span className="text-foreground font-medium">
                    {formatDate(item.expectedArrival)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => onToggleAvailability(item)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${item.isAvailable
                    ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-foreground/10 text-muted border border-[var(--border-subtle)]'
                    }`}
                >
                  {item.isAvailable ? 'Availability Active' : 'Availability Disabled'}
                </button>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  {isCatalog && onListForSale && (
                    <button
                      onClick={() => onListForSale(item)}
                      className="flex items-center gap-1 rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1.5 text-xs font-bold text-[var(--color-brand-green)] transition-all hover:bg-[var(--color-brand-green)] hover:text-white"
                    >
                      <Tag size={14} /> List for Sale
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(item)}
                    className="bg-foreground/10 text-foreground flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors hover:bg-[var(--color-brand-green)]/20 hover:text-[var(--color-brand-green)]"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    className="rounded-xl bg-rose-500/10 p-1.5 text-rose-500 transition-colors hover:bg-rose-500/20"
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
