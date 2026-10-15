import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { implementAPI } from '@/lib/api/implements';
import ImplementDetailsClient from './ImplementDetailsClient';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await implementAPI.getImplementTeaser(id);
    if (res.success && res.data) {
      const impl = res.data;
      return {
        title:
          impl.seoTitle ||
          `${impl.brand?.name || ''} ${impl.modelName} Price, Specifications & Compatibility | TractorDost`,
        description:
          impl.seoDescription ||
          `Explore specifications, price range, and tractor compatibility for ${impl.brand?.name || ''} ${impl.modelName} on TractorDost.`,
      };
    }
  } catch (error) {
    console.error('Error fetching metadata for implement:', error);
  }

  return {
    title: 'Implement Details | TractorDost',
    description:
      'Find detailed specifications, prices, and features of top agricultural implements on TractorDost.',
  };
}

export default async function ImplementDetailsPage({ params }: Props) {
  const { id } = await params;

  let implement: any = null;
  let similarImplements: any[] = [];

  try {
    // Only the public teaser is fetched here. Full details load in the browser, after the lead gate.
    const res = await implementAPI.getImplementTeaser(id);
    if (res.success && res.data) {
      implement = res.data;

      // Fetch similar implements by brand or category if available
      const brandId = implement.brand?.id;
      const categoryId = implement.category?.id;
      if (brandId || categoryId) {
        try {
          const simRes = await implementAPI.getAllImplements({
            brandId: brandId || undefined,
            categoryId: categoryId || undefined,
            limit: 4,
          });
          if (simRes.success && simRes.data) {
            const list = simRes.data.data || [];
            similarImplements = list.filter((i: any) => i.id !== implement.id).slice(0, 3);
          }
        } catch (e) {
          console.error('Error fetching similar implements:', e);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching implement details:', error);
  }

  if (!implement) {
    notFound();
  }

  return <ImplementDetailsClient key={implement.id} teaser={implement} similarImplements={similarImplements} />;
}
