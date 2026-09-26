import { apiClient } from './axios/axios';
import {
  GetInventoryQueryParams,
  InventoryListResponse,
  InventoryStatsResponse,
  AddInventoryPayload,
  UpdateInventoryPayload,
  SingleInventoryResponse,
  DeleteInventoryResponse,
} from '@/types/models/dealerInventory';

export * from '@/types/models/dealerInventory';

export const dealerInventoryAPI = {
  /**
   * Fetch dealer inventory list
   * GET /dealerInventory/dealers/:dealerId/inventory
   */
  getInventoryByDealer: async (
    dealerId: number,
    params?: GetInventoryQueryParams
  ): Promise<InventoryListResponse> => {
    const response = await apiClient.get<InventoryListResponse>(
      `/dealerInventory/dealers/${dealerId}/inventory`,
      { params }
    );
    return response.data;
  },

  /**
   * Fetch dealer inventory stats
   * GET /dealerInventory/admin/dealers/:dealerId/inventory/stats
   */
  getInventoryStats: async (dealerId: number): Promise<InventoryStatsResponse> => {
    const response = await apiClient.get<InventoryStatsResponse>(
      `/dealerInventory/admin/dealers/${dealerId}/inventory/stats`
    );
    return response.data;
  },

  /**
   * Add new item to dealer inventory
   * POST /dealerInventory/admin/dealers/:dealerId/inventory
   */
  addInventoryItem: async (
    dealerId: number,
    payload: AddInventoryPayload
  ): Promise<SingleInventoryResponse> => {
    const response = await apiClient.post<SingleInventoryResponse>(
      `/dealerInventory/admin/dealers/${dealerId}/inventory`,
      payload
    );
    return response.data;
  },

  /**
   * Update existing dealer inventory item
   * PATCH /dealerInventory/admin/dealers/:dealerId/inventory/:inventoryId
   */
  updateInventoryItem: async (
    dealerId: number,
    inventoryId: number,
    payload: UpdateInventoryPayload
  ): Promise<SingleInventoryResponse> => {
    const response = await apiClient.patch<SingleInventoryResponse>(
      `/dealerInventory/admin/dealers/${dealerId}/inventory/${inventoryId}`,
      payload
    );
    return response.data;
  },

  /**
   * Delete dealer inventory item
   * DELETE /dealerInventory/admin/dealers/:dealerId/inventory/:inventoryId
   */
  removeInventoryItem: async (
    dealerId: number,
    inventoryId: number
  ): Promise<DeleteInventoryResponse> => {
    const response = await apiClient.delete<DeleteInventoryResponse>(
      `/dealerInventory/admin/dealers/${dealerId}/inventory/${inventoryId}`
    );
    return response.data;
  },
};
