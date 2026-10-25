export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'] as const,
    PROFILE: (id: number) => ['auth', 'profile', id] as const,
  },
  TRACTORS: {
    ALL: ['tractors'] as const,
    LIST: (filters?: Record<string, unknown>) => ['tractors', 'list', filters] as const,
    DETAIL: (slugOrId: string | number) => ['tractors', 'detail', slugOrId] as const,
    POPULAR: ['tractors', 'popular'] as const,
    SIMILAR: (hp?: number) => ['tractors', 'similar', hp] as const,
    BRANDS: ['tractors', 'brands'] as const,
    FAMILIES: ['tractors', 'families'] as const,
  },
  USED_LISTINGS: {
    ALL: ['used-listings'] as const,
    LIST: (filters?: Record<string, unknown>) => ['used-listings', 'list', filters] as const,
    DETAIL: (id: number | string) => ['used-listings', 'detail', id] as const,
    MY: ['used-listings', 'my'] as const,
    CERTIFIED: ['used-listings', 'certified'] as const,
  },
  DEALERS: {
    ALL: ['dealers'] as const,
    LIST: (filters?: Record<string, unknown>) => ['dealers', 'list', filters] as const,
    DETAIL: (id: number) => ['dealers', 'detail', id] as const,
    PROFILE: (id: number) => ['dealers', 'profile', id] as const,
    NEARBY: (coords?: { latitude: number; longitude: number } | null) =>
      ['dealers', 'nearby', coords?.latitude, coords?.longitude] as const,
  },
  LEADS: {
    ALL: ['leads'] as const,
    LIST: (filters?: Record<string, unknown>) => ['leads', 'list', filters] as const,
    DETAIL: (id: number) => ['leads', 'detail', id] as const,
  },
  CMS: {
    POSTS: (type?: string) => ['cms', 'posts', type] as const,
    CATEGORIES: ['cms', 'categories'] as const,
    FAQS: ['cms', 'faqs'] as const,
  },
  BANNERS: {
    ALL: ['banners'] as const,
    ACTIVE: ['banners', 'active'] as const,
  },
};
