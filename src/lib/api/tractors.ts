import { apiClient } from './axios/axios';
import { Brand } from './brands';
import { detailAccessHeaders } from '@/lib/utils/detail-access';
import type { AxiosProgressEvent } from 'axios';
import type { BulkImportResponse, ImportProgress } from '@/types/api/tractor-import';

const uploadPercent = (cb?: (percent: number) => void) => (e: AxiosProgressEvent) => {
  if (cb && e.total) cb(Math.round((e.loaded / e.total) * 100));
};

// Enums matching the backend Prisma schema
export enum LaunchStatus {
  LATEST = 'LATEST',
  UPCOMING = 'UPCOMING',
  DISCONTINUED = 'DISCONTINUED',
  POPULAR = 'POPULAR',
}

export enum FuelType {
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  CNG = 'CNG',
  PETROL = 'PETROL',
}

export enum DriveType {
  TWO_WD = 'TWO_WD',
  FOUR_WD = 'FOUR_WD',
}

export enum EmissionNorm {
  TREM_III = 'TREM_III',
  TREM_IV = 'TREM_IV',
  TREM_V = 'TREM_V',
}

export enum CoolingType {
  AIR_COOLED = 'AIR_COOLED',
  WATER_COOLED = 'WATER_COOLED',
  OIL_COOLED = 'OIL_COOLED',
}

export enum SteeringType {
  POWER = 'POWER',
  MECHANICAL = 'MECHANICAL',
  HYDROSTATIC = 'HYDROSTATIC',
}

export enum BrakeType {
  OIL_IMMERSED_DISC = 'OIL_IMMERSED_DISC',
  DRUM = 'DRUM',
  DRY_DISC = 'DRY_DISC',
}

export enum ClutchType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  INDEPENDENT = 'INDEPENDENT',
}

export enum HydraulicsType {
  POSITION_CONTROL = 'POSITION_CONTROL',
  DRAFT_CONTROL = 'DRAFT_CONTROL',
  POSITION_AND_DRAFT = 'POSITION_AND_DRAFT',
  ADDC = 'ADDC',
}

export enum PtoType {
  INDEPENDENT = 'INDEPENDENT',
  LIVE = 'LIVE',
  TRANSMISSION = 'TRANSMISSION',
  GROUND_DRIVEN = 'GROUND_DRIVEN',
}

export enum GearboxType {
  CONSTANT_MESH = 'CONSTANT_MESH',
  SYNCHROMESH = 'SYNCHROMESH',
  SYNCHRO_SHUTTLE = 'SYNCHRO_SHUTTLE',
  POWER_SHUTTLE = 'POWER_SHUTTLE',
  CVT = 'CVT',
}

export enum ParkingBrakeType {
  MECHANICAL = 'MECHANICAL',
  HYDRAULIC = 'HYDRAULIC',
  ELECTRONIC = 'ELECTRONIC',
}

export enum DisplayType {
  ANALOG = 'ANALOG',
  DIGITAL = 'DIGITAL',
  TOUCHSCREEN = 'TOUCHSCREEN',
}

export interface TractorPriceByState {
  id?: number;
  tractorId?: number;
  state: string;
  exShowroom: number;
  rtoCharges?: number | null;
  insuranceEst?: number | null;
  dealerCharges?: number | null;
  onRoadPrice?: number | null;
}

export interface TractorSpec {
  id?: number;
  tractorId?: number;

  engineCc?: number | null;
  cylinders?: number | null;
  ratedRpm?: number | null;
  maxTorqueNm?: number | null;
  coolingType?: CoolingType | null;
  aspiration?: string | null;
  airFilterType?: string | null;
  fuelInjectionType?: string | null;
  governorType?: string | null;
  engineOilCapacityL?: number | null;

  gearboxType?: GearboxType | null;
  clutchType?: ClutchType | null;
  forwardGears?: number | null;
  reverseGears?: number | null;
  maxSpeedFwdKmph?: number | null;
  maxSpeedRevKmph?: number | null;
  hasCreeper?: boolean;
  hasShuttle?: boolean;
  differentialLock?: boolean;

  ptoType?: PtoType | null;
  ptoHp?: number | null;
  ptoRpm?: number | null;
  ptoRpmOptions?: string | null;
  ptoShaftType?: string | null;

  hydraulicsType?: HydraulicsType | null;
  liftingCapacityKg?: number | null;
  pumpFlowRateLpm?: number | null;
  linkageCategory?: string | null;
  auxHydraulicPorts?: number | null;

  steeringType?: SteeringType | null;
  brakeType?: BrakeType | null;
  parkingBrake?: ParkingBrakeType | null;
  suspendedPedal?: string | null;
  steeringSeat?: string | null;

  overallLengthMm?: number | null;
  overallWidthMm?: number | null;
  overallHeightMm?: number | null;
  wheelbaseMm?: number | null;
  groundClearanceMm?: number | null;
  turningRadiusM?: number | null;
  totalWeightKg?: number | null;

  frontTyreSize?: string | null;
  rearTyreSize?: string | null;
  tyreType?: string | null;

  fuelTankCapacityL?: number | null;
  fuelConsumptionLph?: number | null;
  batteryVoltage?: number | null;
  batteryAh?: number | null;
  alternatorAmps?: number | null;

  batteryCapacityKwh?: number | null;
  motorKw?: number | null;
  chargingTimeHours?: number | null;
  rangePerChargeKm?: number | null;

  warrantyYears?: number | null;
  warrantyHours?: number | null;
  firstServiceHours?: number | null;
  regularServiceIntervalH?: number | null;
  oilChangeIntervalH?: number | null;
  fuelPump?: string | null;
  engineOilSpec?: string | null;
  coolantType?: string | null;
  annualServiceCostEstimate?: number | null;
  commonSpareParts?: any | null;

  hasAcCabin?: boolean;
  hasGps?: boolean;
  hasTpms?: boolean;
  connectivity?: string | null;
  digitalDisplay?: DisplayType | null;
  includedAccessories?: any | null;
}

export interface Tractor {
  id: number;
  brandId: number;
  familyId?: number | null;
  modelName: string;
  slug: string;
  modelCode?: string | null;
  launchStatus: LaunchStatus;
  fuelType: FuelType;
  driveType: DriveType;
  emissionNorm?: EmissionNorm | null;
  isActive: boolean;
  isFeatured: boolean;
  viewsCount: number;
  leadsCount: number;
  expectedLaunchDate?: string | null;

  exShowroomPriceMin?: number | null;
  exShowroomPriceMax?: number | null;
  offerPrice?: number | null;
  financeAvailable: boolean;

  hp?: number | null;

  overview?: string | null;
  whyBuy?: string | null;
  expertReview?: string | null;
  brochurePdf?: string | null;
  videoUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  pros?: any | null;
  cons?: any | null;
  metaKeywords?: string | null;

  createdAt: string;
  updatedAt: string;

  brand?: Brand;
  family?: any;
  spec?: TractorSpec | null;
  priceByState?: TractorPriceByState[] | null;
  media?: any[] | null;
  primaryMedia?: any | null;
  categories?: any[] | null;
}

/** Fields returned before the detail page is unlocked (see TRACTOR_TEASER_SELECT on the backend) */
export type TractorTeaser = Pick<
  Tractor,
  | 'id'
  | 'brandId'
  | 'familyId'
  | 'modelName'
  | 'slug'
  | 'launchStatus'
  | 'fuelType'
  | 'driveType'
  | 'isActive'
  | 'isFeatured'
  | 'financeAvailable'
  | 'hp'
  | 'exShowroomPriceMin'
  | 'exShowroomPriceMax'
  | 'seoTitle'
  | 'seoDescription'
  | 'metaKeywords'
> & {
  brand?: Pick<Brand, 'id' | 'name'> | null;
  family?: { id: number; name: string } | null;
  media?: Tractor['media'];
};

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    tractors?: T[];
    data?: T[];
    totalCount?: number;
    currentPage?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface GetTractorsParams {
  page?: number;
  limit?: number;
  search?: string;
  brandId?: number;
  familyId?: number;
  fuelType?: FuelType | string;
  driveType?: DriveType | string;
  launchStatus?: LaunchStatus | string;
  hpMin?: number;
  hpMax?: number;
  priceMin?: number;
  priceMax?: number;
  isActive?: boolean | string;
}

export const tractorAPI = {
  /**
   * Fetch all tractors with pagination, search and filters
   */
  getAllTractors: async (params?: GetTractorsParams) => {
    const response = await apiClient.get<PaginatedResponse<Tractor>>('/tractor/getAll', { params });
    return response.data;
  },

  /**
   * Fetch the full detail of one tractor. Needs a login or a lead grant for this tractor, otherwise
   * the API answers 403 with code LEAD_REQUIRED.
   */
  getTractorById: async (id: number | string, detailAccessToken?: string) => {
    const response = await apiClient.get<{ success: boolean; data: Tractor }>(
      `/tractor/getById/${id}`,
      { headers: detailAccessHeaders(detailAccessToken) }
    );
    return response.data;
  },

  /**
   * Public summary shown before the detail page is unlocked
   */
  getTractorTeaser: async (id: number | string) => {
    const response = await apiClient.get<{ success: boolean; data: TractorTeaser }>(
      `/tractor/getTeaser/${id}`
    );
    return response.data;
  },

  /**
   * Create a new tractor
   * (Expects JSON data initially. If we upload brochure, we might use FormData, but let's assume JSON first based on standard Prisma routes unless it's a multipart route)
   */
  createTractor: async (data: Partial<Tractor>) => {
    const response = await apiClient.post<{ success: boolean; data: Tractor }>(
      '/tractor/create',
      data
    );
    return response.data;
  },

  /**
   * Update an existing tractor
   */
  updateTractor: async (id: number, data: Partial<Tractor>) => {
    const response = await apiClient.put<{ success: boolean; data: Tractor }>(
      `/tractor/update/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a tractor
   */
  /**
   * Delete a tractor
   */
  deleteTractor: async (id: number) => {
    const response = await apiClient.delete<{ success: boolean; data: Tractor }>(
      `/tractor/delete/${id}`
    );
    return response.data;
  },

  /**
   * Bulk import step 1 — test an Excel/CSV file. Read-only on the server: nothing is saved.
   * A passed report carries the previewToken that step 2 requires.
   */
  previewTractorImport: async (
    file: File,
    options: { signal?: AbortSignal; onUploadProgress?: (percent: number) => void } = {}
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<BulkImportResponse>(
      '/tractor/bulk-import/preview',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: options.signal,
        onUploadProgress: uploadPercent(options.onUploadProgress),
      }
    );
    return response.data;
  },

  /**
   * Bulk import step 2 — insert a file that passed step 1 (all-or-nothing).
   * The server refuses files without a matching previewToken; importId makes progress pollable.
   */
  bulkImportTractor: async (
    file: File,
    options: {
      previewToken: string;
      importId?: string;
      onUploadProgress?: (percent: number) => void;
    }
  ) => {
    const formData = new FormData();
    formData.append('previewToken', options.previewToken);
    if (options.importId) formData.append('importId', options.importId);
    formData.append('file', file);
    const response = await apiClient.post<BulkImportResponse>('/tractor/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: uploadPercent(options.onUploadProgress),
    });
    return response.data;
  },

  /**
   * Live progress of an import started with an importId
   */
  getBulkImportProgress: async (importId: string, signal?: AbortSignal) => {
    const response = await apiClient.get<{ success: boolean; data: ImportProgress }>(
      `/tractor/bulk-import/progress/${importId}`,
      { signal }
    );
    return response.data;
  },

  /**
   * Fetch all Tractor Specs
   */
  getAllTractorSpecs: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get<PaginatedResponse<TractorSpec>>('/tractor-specs/get', {
      params,
    });
    return response.data;
  },

  /**
   * Create a Tractor Spec
   */
  createTractorSpec: async (data: Partial<TractorSpec>) => {
    const response = await apiClient.post<{ success: boolean; data: TractorSpec }>(
      '/tractor-specs/create',
      data
    );
    return response.data;
  },

  /**
   * Update an existing Tractor Spec
   */
  updateTractorSpec: async (id: number, data: Partial<TractorSpec>) => {
    const response = await apiClient.put<{ success: boolean; data: TractorSpec }>(
      `/tractor-specs/update/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Fetch all State Prices
   */
  getAllTractorPricesByState: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    // The backend returns a direct array in data, not paginated in the standard way, let's assume standard response structure
    const response = await apiClient.get<{ success: boolean; data: TractorPriceByState[] }>(
      '/tractor-price-by-state/getAll',
      { params }
    );
    return response.data;
  },
};
