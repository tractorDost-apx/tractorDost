import { siteConfig } from '@/config/site';

/**
 * Returns JSON-LD structured data for the TractorDost Organization.
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/TD%20White.png`,
    sameAs: Object.values(siteConfig.social),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: siteConfig.helpline.tollFree,
        contactType: 'customer support',
        areaServed: 'IN',
        availableLanguage: ['en', 'hi', 'mr'],
      },
    ],
  };
}

/**
 * Returns JSON-LD structured data for a Tractor (Product schema).
 */
export function getTractorProductSchema(tractor: {
  modelName: string;
  brandName: string;
  description?: string;
  image?: string;
  priceMin?: number;
  priceMax?: number;
  hp?: number;
  slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${tractor.brandName} ${tractor.modelName}`,
    image: tractor.image ? [tractor.image] : [`${siteConfig.url}/TD%20White.png`],
    description: tractor.description || `${tractor.brandName} ${tractor.modelName} ${tractor.hp ? `${tractor.hp} HP` : ''} Tractor in India.`,
    brand: {
      '@type': 'Brand',
      name: tractor.brandName,
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: tractor.priceMin || 350000,
      highPrice: tractor.priceMax || 950000,
      offerCount: 1,
      availability: 'https://schema.org/InStock',
      url: `${siteConfig.url}/tractors/${tractor.slug}`,
    },
  };
}

/**
 * Returns JSON-LD structured data for FAQ pages.
 */
export function getFaqPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Returns JSON-LD structured data for Breadcrumbs.
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteConfig.url}${item.url}`,
    })),
  };
}

/**
 * Returns JSON-LD structured data for Dealerships and Service Centers.
 */
export function getLocalBusinessSchema(dealer: {
  businessName: string;
  address: string;
  state: string;
  district: string;
  phone: string;
  rating?: number;
  reviewCount?: number;
  latitude?: number;
  longitude?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: dealer.businessName,
    telephone: dealer.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: dealer.address,
      addressLocality: dealer.district,
      addressRegion: dealer.state,
      addressCountry: 'IN',
    },
    ...(dealer.latitude && dealer.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: dealer.latitude,
            longitude: dealer.longitude,
          },
        }
      : {}),
    ...(dealer.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: dealer.rating,
            reviewCount: dealer.reviewCount || 1,
          },
        }
      : {}),
  };
}
