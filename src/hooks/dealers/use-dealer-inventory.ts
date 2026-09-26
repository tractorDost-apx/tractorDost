'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/store/AuthContext';
import { dealerAPI } from '@/lib/api/dealers';
import { dealerInventoryAPI } from '@/lib/api/dealerInventory';
import {
  DealerInventoryItem,
  DealerInventoryStats,
  GetInventoryQueryParams,
  AddInventoryPayload,
  UpdateInventoryPayload,
  DealerInventoryPagination,
} from '@/types/models/dealerInventory';

export function useDealerInventory() {
  const { user } = useAuth();
  const [dealerId, setDealerId] = useState<number | null>(null);
  const [dealerName, setDealerName] = useState<string>('');
  
  // Data states
  const [inventory, setInventory] = useState<DealerInventoryItem[]>([]);
  const [pagination, setPagination] = useState<DealerInventoryPagination | null>(null);
  const [stats, setStats] = useState<DealerInventoryStats | null>(null);
  
  // UI states
  const [loadingDealer, setLoadingDealer] = useState<boolean>(true);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [dealerError, setDealerError] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  
  // Filter & Search states
  const [queryParams, setQueryParams] = useState<GetInventoryQueryParams>({
    page: 1,
    limit: 50,
    sortBy: 'updatedAt',
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_STOCK' | 'COMING_SOON' | 'OUT_OF_STOCK' | 'UNAVAILABLE'>('ALL');

  // Resolve Dealer ID
  useEffect(() => {
    let isMounted = true;
    
    async function resolveDealer() {
      if (!user?.id) {
        if (isMounted) setLoadingDealer(false);
        return;
      }

      setLoadingDealer(true);
      setDealerError(null);

      try {
        let id: number | null = user?.dealer?.id || null;
        let name: string = user?.dealer?.businessName || '';

        if (!id && user?.id) {
          const res = await dealerAPI.getAllDealers({ limit: 100 });
          if (res.success && res.data?.data) {
            const matched = res.data.data.find((d) => d.userId === user.id);
            if (matched) {
              id = matched.id;
              name = matched.businessName;
            }
          }
        }

        if (isMounted) {
          if (id) {
            setDealerId(id);
            setDealerName(name);
          } else {
            setDealerError('No dealership profile found linked to your account.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to resolve dealer ID:', err);
          setDealerError(err?.response?.data?.message || 'Failed to identify dealer profile.');
        }
      } finally {
        if (isMounted) {
          setLoadingDealer(false);
        }
      }
    }

    resolveDealer();

    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.dealer?.id]);

  // Fetch Inventory and Stats
  const fetchData = useCallback(async () => {
    if (!dealerId) return;

    setLoadingData(true);
    setDataError(null);

    try {
      const [invRes, statsRes] = await Promise.allSettled([
        dealerInventoryAPI.getInventoryByDealer(dealerId, queryParams),
        dealerInventoryAPI.getInventoryStats(dealerId),
      ]);

      if (invRes.status === 'fulfilled' && invRes.value.success) {
        setInventory(invRes.value.data.inventory || []);
        setPagination(invRes.value.data.pagination || null);
      } else if (invRes.status === 'rejected') {
        const err = invRes.reason;
        console.error('Error fetching inventory:', err);
        setDataError(err?.response?.data?.message || 'Failed to load inventory items.');
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setStats(statsRes.value.data);
      } else if (statsRes.status === 'rejected') {
        console.error('Error fetching inventory stats:', statsRes.reason);
      }
    } catch (err: any) {
      console.error('Unexpected error fetching inventory data:', err);
      setDataError('An error occurred while fetching inventory details.');
    } finally {
      setLoadingData(false);
    }
  }, [dealerId, queryParams]);

  useEffect(() => {
    if (dealerId) {
      fetchData();
    }
  }, [dealerId, fetchData]);

  // Filtered & Searched Inventory
  const filteredInventory = inventory.filter((item) => {
    // 1. Search Query Filter (tractorName, customModel, brand)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = item.tractorName?.toLowerCase().includes(q) ?? false;
      const customMatch = item.customModel?.toLowerCase().includes(q) ?? false;
      const brandMatch = item.brand?.toLowerCase().includes(q) ?? false;
      if (!nameMatch && !customMatch && !brandMatch) return false;
    }

    // 2. Status Filter
    if (statusFilter === 'UNAVAILABLE') {
      return !item.isAvailable;
    }
    if (statusFilter === 'IN_STOCK') {
      return item.isAvailable && item.stockCount > 0;
    }
    if (statusFilter === 'COMING_SOON') {
      return item.isAvailable && item.stockCount === 0 && !!item.expectedArrival;
    }
    if (statusFilter === 'OUT_OF_STOCK') {
      return item.isAvailable && item.stockCount === 0 && !item.expectedArrival;
    }

    return true;
  });

  // Mutations
  const addInventory = async (payload: AddInventoryPayload) => {
    if (!dealerId) throw new Error('No valid dealer profile.');
    const res = await dealerInventoryAPI.addInventoryItem(dealerId, payload);
    await fetchData();
    return res;
  };

  const updateInventory = async (inventoryId: number, payload: UpdateInventoryPayload) => {
    if (!dealerId) throw new Error('No valid dealer profile.');
    const res = await dealerInventoryAPI.updateInventoryItem(dealerId, inventoryId, payload);
    await fetchData();
    return res;
  };

  const deleteInventory = async (inventoryId: number) => {
    if (!dealerId) throw new Error('No valid dealer profile.');
    const res = await dealerInventoryAPI.removeInventoryItem(dealerId, inventoryId);
    await fetchData();
    return res;
  };

  return {
    dealerId,
    dealerName,
    inventory: filteredInventory,
    rawInventory: inventory,
    pagination,
    stats,
    loadingDealer,
    loadingData,
    dealerError,
    dataError,
    queryParams,
    setQueryParams,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    refetch: fetchData,
    addInventory,
    updateInventory,
    deleteInventory,
  };
}
