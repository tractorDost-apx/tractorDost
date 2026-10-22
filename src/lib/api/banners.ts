import axios from 'axios';
import { apiClient } from './axios/axios';
import type { Banner, BannerStatus } from '@/types/models/banner';

export interface BannerListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: BannerListMeta;
}

export interface ApiItemResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Text fields only. Images are sent as files through BannerImageUploads, so the server stores their URLs. */
export interface CreateBannerInput {
  page: string;
  position: string;
  title?: string | null;
  linkUrl?: string | null;
  ctaText?: string | null;
  altText?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateBannerInput = Partial<CreateBannerInput>;

/** Must match the backend's accepted types and size limit (banner.service). The server checks the bytes too. */
export const BANNER_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const BANNER_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const BANNER_IMAGE_ACCEPT = BANNER_IMAGE_TYPES.join(',');

/** Returns a message for a file the server would reject, or null when the file can be uploaded. */
export function getBannerImageError(file: File): string | null {
  if (file.size === 0) return 'The file is empty. Choose a different image.';
  if (!(BANNER_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return 'Use a JPEG, PNG or WebP image.';
  }
  if (file.size > BANNER_IMAGE_MAX_BYTES) return 'Image must be 5 MB or smaller.';
  return null;
}

export interface BannerImageUploads {
  desktop?: File;
  mobile?: File;
  /** Clears the stored mobile image on update. Ignored when a new mobile file is also sent. */
  removeMobile?: boolean;
}

/**
 * Builds the multipart body for create and update. Text is sent as text, and null is sent as an empty
 * string, which the server reads as "clear this field". Undefined fields are left out, so an update
 * does not change them.
 */
export function buildBannerFormData(
  input: CreateBannerInput | UpdateBannerInput,
  images: BannerImageUploads = {},
): FormData {
  const form = new FormData();
  const set = (key: string, value: string | number | boolean | null | undefined) => {
    if (value === undefined) return;
    form.append(key, value === null ? '' : String(value));
  };

  set('page', input.page);
  set('position', input.position);
  set('title', input.title);
  set('linkUrl', input.linkUrl);
  set('ctaText', input.ctaText);
  set('altText', input.altText);
  set('startDate', input.startDate);
  set('endDate', input.endDate);
  set('isActive', input.isActive);
  set('sortOrder', input.sortOrder);

  if (images.desktop) form.append('desktopImage', images.desktop, images.desktop.name);
  if (images.mobile) form.append('mobileImage', images.mobile, images.mobile.name);
  if (images.removeMobile) form.append('removeMobileImage', 'true');

  return form;
}

export interface ListBannersQuery {
  page?: string;
  position?: string;
  pageNumber?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}

export interface BannerPlacement {
  page: string;
  position: string;
  label: string;
  description: string;
}

/**
 * Placements the backend stores as plain page/position strings. Only placements the site renders
 * should be listed here, otherwise an admin can create a banner that never shows.
 */
export const BANNER_PLACEMENTS: BannerPlacement[] = [
  {
    page: 'home',
    position: 'hero',
    label: 'Home · Hero carousel',
    description: 'Shown in the carousel directly under the homepage hero.',
  },
];

export const HOME_HERO_PLACEMENT = BANNER_PLACEMENTS[0];

/** True for absolute http(s) links, which open in a new tab. Paths inside the site stay in the same tab. */
export const isExternalLink = (href: string): boolean => /^https?:\/\//i.test(href);

export const placementKey = (page: string, position: string): string => `${page}|${position}`;

export const getPlacementLabel = (page: string, position: string): string =>
  BANNER_PLACEMENTS.find((p) => p.page === page && p.position === position)?.label ??
  `${page} · ${position}`;

/** Live = active and inside the optional date window. Matches the backend's liveWhere rule. */
export function getBannerStatus(
  banner: Pick<Banner, 'isActive' | 'startDate' | 'endDate'>,
  now: Date = new Date(),
): BannerStatus {
  if (!banner.isActive) return 'INACTIVE';
  if (banner.startDate && new Date(banner.startDate) > now) return 'SCHEDULED';
  if (banner.endDate && new Date(banner.endDate) < now) return 'EXPIRED';
  return 'LIVE';
}

/**
 * Pulls a readable message out of an API error. Validation failures (422) carry a field list in
 * `error`, which is appended so the admin can see which input to fix.
 */
export function getBannerErrorMessage(err: unknown, fallback: string): string {
  if (!axios.isAxiosError(err)) return fallback;
  const data = err.response?.data as
    | { message?: string; error?: unknown }
    | undefined;
  const fieldErrors = Array.isArray(data?.error)
    ? (data.error as Array<{ field?: string; message?: string }>)
        .map((e) => e.message)
        .filter((m): m is string => Boolean(m))
    : [];
  if (fieldErrors.length > 0) return fieldErrors.join(' ');
  return data?.message || fallback;
}

export const bannerAPI = {
  /** Admin list with filters. The backend returns every banner, including inactive and scheduled ones. */
  getAll: async (query: ListBannersQuery): Promise<ApiListResponse<Banner>> => {
    const response = await apiClient.get<ApiListResponse<Banner>>('/banners', { params: query });
    return response.data;
  },

  getById: async (id: number): Promise<ApiItemResponse<Banner>> => {
    const response = await apiClient.get<ApiItemResponse<Banner>>(`/banners/${id}`);
    return response.data;
  },

  /** Multipart: text fields plus the desktop image file (required) and the mobile image file (optional). */
  create: async (form: FormData): Promise<ApiItemResponse<Banner>> => {
    const response = await apiClient.post<ApiItemResponse<Banner>>('/banners', form);
    return response.data;
  },

  /** Multipart. Send only the fields that changed, plus any new image files or removeMobileImage. */
  update: async (id: number, form: FormData): Promise<ApiItemResponse<Banner>> => {
    const response = await apiClient.patch<ApiItemResponse<Banner>>(`/banners/${id}`, form);
    return response.data;
  },

  delete: async (id: number): Promise<ApiItemResponse<Banner>> => {
    const response = await apiClient.delete<ApiItemResponse<Banner>>(`/banners/${id}`);
    return response.data;
  },
};

/**
 * Fire-and-forget tracking beacon for impressions and clicks. It uses fetch with keepalive instead
 * of axios so the request survives when a click navigates away. Failures are ignored, because a
 * lost count should never break the page.
 */
export function trackBannerEvent(id: number, event: 'impression' | 'click'): void {
  fetch(`${apiClient.defaults.baseURL}/banners/${id}/${event}`, {
    method: 'POST',
    keepalive: true,
  }).catch(() => {});
}
