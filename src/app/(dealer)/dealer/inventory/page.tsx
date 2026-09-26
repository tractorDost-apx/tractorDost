'use client';

import React, { useState } from 'react';
import { useDealerInventory } from '@/hooks/dealers/use-dealer-inventory';
import { InventoryStatsCards } from './components/InventoryStatsCards';
import { InventoryTable } from './components/InventoryTable';
import { InventoryFormModal } from './components/InventoryFormModal';
import { DeleteInventoryModal } from './components/DeleteInventoryModal';
import { CreateUsedListingModal } from './components/CreateUsedListingModal';
import { DealerInventoryItem } from '@/types/models/dealerInventory';
import {
  Tractor,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Filter,
  ArrowUpDown,
} from 'lucide-react';

export default function DealerInventoryPage() {
  const {
    dealerName,
    inventory,
    stats,
    loadingDealer,
    loadingData,
    dealerError,
    dataError,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    queryParams,
    setQueryParams,
    refetch,
    addInventory,
    updateInventory,
    deleteInventory,
  } = useDealerInventory();

  // Modals & Active Items state
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [itemToEdit, setItemToEdit] = useState<DealerInventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<DealerInventoryItem | null>(null);
  const [itemToListForSale, setItemToListForSale] = useState<DealerInventoryItem | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handlers
  const handleOpenAddModal = () => {
    setItemToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (item: DealerInventoryItem) => {
    setItemToEdit(item);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (item: DealerInventoryItem) => {
    setItemToDelete(item);
  };

  const handleToggleAvailability = async (item: DealerInventoryItem) => {
    try {
      const nextState = !item.isAvailable;
      await updateInventory(item.inventoryId, { isAvailable: nextState });
      showToast(
        'success',
        `Availability for "${item.tractorName || item.customModel}" updated to ${
          nextState ? 'Active' : 'Disabled'
        }.`
      );
    } catch (err: any) {
      console.error('Failed to toggle availability:', err);
      showToast('error', err?.response?.data?.message || 'Failed to update availability status.');
    }
  };

  const handleAddSubmit = async (payload: any) => {
    const res = await addInventory(payload);
    showToast('success', 'Tractor added to inventory successfully!');
    return res;
  };

  const handleUpdateSubmit = async (inventoryId: number, payload: any) => {
    const res = await updateInventory(inventoryId, payload);
    showToast('success', 'Inventory details updated successfully!');
    return res;
  };

  const handleDeleteConfirm = async (inventoryId: number) => {
    const res = await deleteInventory(inventoryId);
    showToast('success', 'Inventory item removed successfully!');
    return res;
  };

  // 1. Loading Dealer Context
  if (loadingDealer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 size={36} className="text-[var(--color-brand-green)] animate-spin" />
        <p className="text-sm font-bold text-muted">Resolving dealership credentials...</p>
      </div>
    );
  }

  // 2. Dealer Error State (No dealer profile linked)
  if (dealerError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 text-center">
        <div className="glass-panel p-8 max-w-lg w-full space-y-4 border border-rose-500/20 bg-rose-500/5 rounded-3xl">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-xl font-bold text-foreground">Dealership Required</h2>
          <p className="text-sm text-muted font-medium leading-relaxed">
            {dealerError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 p-4 rounded-2xl border shadow-2xl flex items-center gap-3 animate-slide-in text-xs font-bold ${
            toastMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-500 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 shrink-0">
            <Tractor size={26} />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Inventory Stock
              </h1>
              {dealerName && (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 uppercase tracking-wider">
                  {dealerName}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-bold text-muted mt-0.5">
              Manage your tractor stock, availability status, and upcoming stock arrivals.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-[var(--color-brand-green)] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus size={18} className="stroke-[3]" /> Add Inventory Item
        </button>
      </div>

      {/* Statistics Cards */}
      <InventoryStatsCards stats={stats} loading={loadingData} />

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-3 text-muted" />
          <input
            type="text"
            placeholder="Search tractor name, brand, or custom model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-foreground/5 border border-[var(--border-subtle)] focus:border-[var(--color-brand-green)] rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-foreground focus:outline-none transition-colors"
          />
        </div>

        {/* Filters and Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-xs">
            <Filter size={14} className="text-muted shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-foreground font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="COMING_SOON">Coming Soon</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-1.5 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-xs">
            <ArrowUpDown size={14} className="text-muted shrink-0" />
            <select
              value={queryParams.sortBy || 'updatedAt'}
              onChange={(e) =>
                setQueryParams({ ...queryParams, sortBy: e.target.value as any })
              }
              className="bg-transparent text-foreground font-bold focus:outline-none cursor-pointer"
            >
              <option value="updatedAt">Recently Updated</option>
              <option value="stockCount">Highest Stock</option>
              <option value="name">Model Name</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={loadingData}
            className="p-2.5 rounded-xl bg-foreground/5 border border-[var(--border-subtle)] text-muted hover:text-foreground hover:border-[var(--color-brand-green)]/30 transition-all disabled:opacity-50 flex items-center justify-center"
            title="Refresh Inventory"
          >
            <RefreshCw size={16} className={loadingData ? 'animate-spin text-[var(--color-brand-green)]' : ''} />
          </button>
        </div>
      </div>

      {/* Data Error Banner */}
      {dataError && (
        <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-500 text-xs font-bold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{dataError}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 bg-foreground/10 rounded-lg text-foreground hover:bg-foreground/20 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Inventory Table / Cards */}
      <InventoryTable
        items={inventory}
        loading={loadingData}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
        onToggleAvailability={handleToggleAvailability}
        onAddClick={handleOpenAddModal}
        onListForSale={(item) => setItemToListForSale(item)}
      />

      {/* Add / Edit Form Modal */}
      {isFormModalOpen && (
        <InventoryFormModal
          itemToEdit={itemToEdit}
          onClose={() => setIsFormModalOpen(false)}
          onSubmitAdd={handleAddSubmit}
          onSubmitUpdate={handleUpdateSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <DeleteInventoryModal
          item={itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Create Used Listing for Marketplace Modal */}
      {itemToListForSale && (
        <CreateUsedListingModal
          item={itemToListForSale}
          dealerName={dealerName}
          onClose={() => setItemToListForSale(null)}
          onSuccess={(msg) => showToast('success', msg)}
        />
      )}
    </div>
  );
}
