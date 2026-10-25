/** Banner row as returned to admin callers. Impression and click counters are internal analytics. */
export interface Banner {
  id: number;
  page: string;
  position: string;
  title: string | null;
  imageUrl: string;
  desktopImageUrl?: string;
  imageId: string | null;
  mobileImageUrl: string | null;
  mobileImageId: string | null;
  linkUrl: string | null;
  ctaText: string | null;
  altText: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  sortOrder: number;
  clickCount: number;
  clicksCount?: number;
  impressions: number;
  impressionsCount?: number;
  createdAt: string;
  updatedAt: string;
}

/** Banner as public visitors receive it. The backend strips the analytics counters. */
export type PublicBanner = Omit<Banner, 'clickCount' | 'impressions'>;

/** Derived from isActive and the date window. Never sent by the backend. */
export type BannerStatus = 'LIVE' | 'SCHEDULED' | 'EXPIRED' | 'INACTIVE';
