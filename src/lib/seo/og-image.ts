import { siteConfig } from '@/config/site';

export interface OgImageParams {
  title: string;
  subtitle?: string;
  badge?: string;
}

/**
 * Returns canonical Open Graph and Twitter image URLs.
 */
export function getOgImageUrl(params?: OgImageParams): string {
  if (!params || !params.title) {
    return `${siteConfig.url}/TD%20White.png`;
  }
  // If an external dynamic OG generation endpoint is used, construct the URL with params
  const base = `${siteConfig.url}/TD%20White.png`;
  return base;
}
