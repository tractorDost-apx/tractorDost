import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export interface SeoMetadataOptions {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
}

export function constructMetadata({
  title,
  description = siteConfig.description,
  canonical,
  image = siteConfig.ogImage,
  keywords = [
    'Tractor Price',
    'Used Tractors',
    'Tractor Loan',
    'Agriculture Machinery',
    'Second Hand Tractor',
    'Tractor Comparison',
    'Kisan Helpline',
  ],
  noIndex = false,
}: SeoMetadataOptions): Metadata {
  const fullTitle = `${title} | ${siteConfig.name}`;
  const canonicalUrl = canonical
    ? `${siteConfig.url}${canonical.startsWith('/') ? canonical : `/${canonical}`}`
    : siteConfig.url;

  return {
    title: fullTitle,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: image.startsWith('http') ? image : `${siteConfig.url}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image.startsWith('http') ? image : `${siteConfig.url}${image}`],
      creator: '@tractordost',
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
