'use client';

import React, { useState, useCallback } from 'react';
import { useDealerInventory } from '@/hooks/dealers/use-dealer-inventory';
import { useMyUsedListings } from '@/hooks/used-listings/use-used-listings';
import { InventoryStatsCards } from './components/InventoryStatsCards';
import { InventoryTable } from './components/InventoryTable';
import { InventoryFormModal } from './components/InventoryFormModal';
import { DeleteInventoryModal } from './components/DeleteInventoryModal';
import { CreateDealerUsedListingModal } from '../used-listings/components/CreateDealerUsedListingModal';
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
  Tag,
} from 'lucide-react';

function cleanString(str?: string | null): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isTractorListed(
  item: DealerInventoryItem,
  listings: Array<{
    tractorId?: number | null;
    tractorBrand?: string | null;
    tractorModel?: string | null;
    listingStatus?: string;
  }>
): boolean {
  return listings.some((l) => {
    // Only consider live or pending listings (ignore rejected, sold, expired)
    const isLive = l.listingStatus === 'ACTIVE' || l.listingStatus === 'PENDING_APPROVAL';
    if (!isLive) return false;

    // 1. Exact catalog tractorId match
    if (item.tractorId && l.tractorId && item.tractorId === l.tractorId) {
      return true;
    }

    // 2. Model & Brand matching
    const itemModel = cleanString(item.tractorName || item.customModel);
    const listingModel = cleanString(l.tractorModel);

    if (!itemModel || !listingModel) return false;

    const modelMatches =
      itemModel === listingModel ||
      itemModel.includes(listingModel) ||
      listingModel.includes(itemModel);

    const itemBrand = cleanString(item.brand);
    const listingBrand = cleanString(l.tractorBrand);

    if (itemBrand && listingBrand) {
      const brandMatches =
        itemBrand === listingBrand ||
        itemBrand.includes(listingBrand) ||
        listingBrand.includes(itemBrand);
      return modelMatches && brandMatches;
    }

    return modelMatches;
  });
}

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
  const [isListForSaleOpen, setIsListForSaleOpen] = useState<boolean>(false);
  const [itemToListForSale, setItemToListForSale] = useState<DealerInventoryItem | null>(null);

  // Fetch dealer's used listings to know which inventory tractors are already live on marketplace
  const { data: usedListingsData, reload: reloadUsedListings } = useMyUsedListings({
    page: 1,
    limit: 100,
  });
  const [recentlyListedInventoryIds, setRecentlyListedInventoryIds] = useState<number[]>([]);

  const isItemListed = useCallback(
    (item: DealerInventoryItem) => {
      if (recentlyListedInventoryIds.includes(item.inventoryId)) {
        return true;
      }

      const listings = usedListingsData?.data ?? [];
      return isTractorListed(item, listings);
    },
    [recentlyListedInventoryIds, usedListingsData]
  );

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
        `Availability for "${item.tractorName || item.customModel}" updated to ${nextState ? 'Active' : 'Disabled'
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 size={36} className="animate-spin text-[var(--color-brand-green)]" />
        <p className="text-muted text-sm font-bold">Resolving dealership credentials...</p>
      </div>
    );
  }

  // 2. Dealer Error State (No dealer profile linked)
  if (dealerError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 text-center">
        <div className="glass-panel w-full max-w-lg space-y-4 rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-500">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-foreground text-xl font-bold">Dealership Required</h2>
          <p className="text-muted text-sm leading-relaxed font-medium">{dealerError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`animate-slide-in fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border p-4 text-xs font-bold shadow-2xl ${toastMessage.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle size={18} className="shrink-0 text-rose-500" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="shrink-0 rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-2.5 text-[var(--color-brand-green)]">
            <Tractor size={26} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                Inventory Stock
              </h1>
              {dealerName && (
                <span className="rounded-full border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-3 py-1 text-xs font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                  {dealerName}
                </span>
              )}
            </div>
            <p className="text-muted mt-0.5 text-xs font-bold sm:text-sm">
              Manage your tractor stock, availability status, and upcoming stock arrivals.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setItemToListForSale(null);
              setIsListForSaleOpen(true);
            }}
            className="flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-4 py-2.5 text-xs font-bold tracking-wider text-[var(--color-brand-green)] uppercase shadow-sm transition-all hover:bg-[var(--color-brand-green)] hover:text-white active:scale-95 sm:self-auto"
            title="List a used tractor directly on marketplace"
          >
            <Tag size={16} /> List Used Tractor for Sale
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[var(--color-brand-green)] px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-md transition-all hover:opacity-90 active:scale-95 sm:self-auto"
          >
            <Plus size={18} className="stroke-[3]" /> Add Inventory Item
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <InventoryStatsCards stats={stats} loading={loadingData} />

      {/* Filter & Search Bar */}
      <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={18} className="text-muted absolute top-3 left-3.5" />
          <input
            type="text"
            placeholder="Search tractor name, brand, or custom model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-foreground/5 text-foreground w-full rounded-xl border border-[var(--border-subtle)] py-2 pr-4 pl-10 text-xs font-medium transition-colors focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="bg-foreground/5 flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs">
            <Filter size={14} className="text-muted shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-foreground cursor-pointer bg-transparent font-bold focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="COMING_SOON">Coming Soon</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>

          {/* Sort Selection */}
          <div className="bg-foreground/5 flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs">
            <ArrowUpDown size={14} className="text-muted shrink-0" />
            <select
              value={queryParams.sortBy || 'updatedAt'}
              onChange={(e) => setQueryParams({ ...queryParams, sortBy: e.target.value as any })}
              className="text-foreground cursor-pointer bg-transparent font-bold focus:outline-none"
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
            className="bg-foreground/5 text-muted hover:text-foreground flex items-center justify-center rounded-xl border border-[var(--border-subtle)] p-2.5 transition-all hover:border-[var(--color-brand-green)]/30 disabled:opacity-50"
            title="Refresh Inventory"
          >
            <RefreshCw
              size={16}
              className={loadingData ? 'animate-spin text-[var(--color-brand-green)]' : ''}
            />
          </button>
        </div>
      </div>

      {/* Data Error Banner */}
      {dataError && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-bold text-rose-500">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{dataError}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="bg-foreground/10 text-foreground hover:bg-foreground/20 rounded-lg px-3 py-1 transition-colors"
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
        onListForSale={(item) => {
          setItemToListForSale(item);
          setIsListForSaleOpen(true);
        }}
        isItemListed={isItemListed}
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
      {isListForSaleOpen && (
        <CreateDealerUsedListingModal
          isOpen={isListForSaleOpen}
          onClose={() => {
            setIsListForSaleOpen(false);
            setItemToListForSale(null);
          }}
          onSuccess={(msg: string) => {
            showToast('success', msg);
            setIsListForSaleOpen(false);
            if (itemToListForSale) {
              setRecentlyListedInventoryIds((prev) => [...prev, itemToListForSale.inventoryId]);
            }
            setItemToListForSale(null);
            reloadUsedListings();
          }}
          initialData={
            itemToListForSale
              ? {
                  brand: itemToListForSale.brand,
                  tractorName: itemToListForSale.tractorName,
                  customModel: itemToListForSale.customModel,
                  hp: itemToListForSale.hp,
                  tractorId: itemToListForSale.tractorId,
                  inventoryId: itemToListForSale.inventoryId,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
