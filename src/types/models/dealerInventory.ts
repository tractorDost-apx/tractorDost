export type InventoryCondition = 'NEW' | 'PRE_OWNED' | 'REFURBISHED' | 'DEMO';
export type InventoryStatus = 'IN_STOCK' | 'RESERVED' | 'SOLD' | 'IN_TRANSIT';

export interface DealerInventoryItem {
  inventoryId: number;
  id?: number;
  dealerId: number;
  tractorId: number | null;
  tractorName: string | null;
  brand?: string | null;
  hp?: number | null;
  customModel?: string | null;
  stockCount: number;
  quantity?: number;
  isAvailable: boolean;
  condition?: InventoryCondition | string;
  status?: InventoryStatus | string;
  price?: number | null;
  mfgYear?: number | null;
  hoursDriven?: number | null;
  description?: string | null;
  expectedArrival?: string | null;
  lastUpdated?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DealerInventoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface GetInventoryQueryParams {
  page?: number;
  limit?: number;
  available?: boolean;
  sortBy?: 'stockCount' | 'name' | 'updatedAt';
}

export interface InventoryListResponse {
  success: boolean;
  message: string;
  data: {
    dealerId: number;
    pagination: DealerInventoryPagination;
    inventory: DealerInventoryItem[];
  };
}

export interface TopInventoryModel {
  tractorName: string;
  stock: number;
}

export interface DealerInventoryStats {
  dealerId: number;
  totalItems: number;
  totalStock: number;
  availableItems: number;
  unavailableItems: number;
  availabilityRate: string;
  expectedArrivals: number;
  topModels: TopInventoryModel[];
  lastUpdated: string | null;
}

export interface InventoryStatsResponse {
  success: boolean;
  message: string;
  data: DealerInventoryStats;
}

export interface AddInventoryPayload {
  tractorId?: number | null;
  customModel?: string | null;
  stockCount: number;
  expectedArrival?: string | null;
  isAvailable?: boolean;
}

export interface UpdateInventoryPayload {
  stockCount?: number;
  isAvailable?: boolean;
  expectedArrival?: string | null;
  customModel?: string | null;
}

export interface SingleInventoryResponse {
  success: boolean;
  message: string;
  data: DealerInventoryItem;
}

export interface DeleteInventoryResponse {
  success: boolean;
  message: string;
  data: {
    dealerId: number;
    deletedInventoryId: number;
    tractorName: string | null;
    deletedAt: string;
  };
}
