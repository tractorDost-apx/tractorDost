import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tractordost.com';
  const lastModified = new Date();

  const routes = [
    { url: `${baseUrl}`, priority: 1.0, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/tractors`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/brands`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/used-tractors`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/compare`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/loan`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/on-road-price`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/used-tractor-valuation`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/dealers`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/showrooms`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/about`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/contact`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/faqs`, priority: 0.6, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/privacy`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/terms`, priority: 0.5, changeFrequency: 'monthly' as const },
  ];

  return routes.map((r) => ({
    url: r.url,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}

