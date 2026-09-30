import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { tractorAPI } from '@/lib/api/tractors';
import { compareAPI } from '@/lib/api/compare';
import TractorDetailsClient from './TractorDetailsClient';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await tractorAPI.getTractorById(Number(id));
    if (res.success && res.data) {
      const tractor = res.data;
      return {
        title:
          tractor.seoTitle ||
          `${tractor.brand?.name || ''} ${tractor.modelName} Tractor Price, Specs & Review | TractorDost`,
        description:
          tractor.seoDescription ||
          `Discover the ${tractor.brand?.name || ''} ${tractor.modelName} on TractorDost. Starting at ₹${(Number(tractor.exShowroomPriceMin) / 100000).toFixed(2)} Lakh. Explore features, specs, mileage, and more.`,
        keywords:
          tractor.metaKeywords ||
          `${tractor.brand?.name || ''} tractor, ${tractor.modelName}, tractor price, agriculture, TractorDost`,
      };
    }
  } catch (error) {
    console.error('Error fetching metadata for tractor:', error);
  }

  return {
    title: 'Tractor Details | TractorDost',
    description:
      'Find detailed specifications, prices, and features of top tractors on TractorDost.',
  };
}

export default async function TractorDetailsPage({ params }: Props) {
  const { id } = await params;

  let tractor: any = null;
  let similarTractors: any[] = [];
  let rivals: any[] = [];

  try {
    const [tractorRes, compareRes] = await Promise.all([
      tractorAPI.getTractorById(Number(id)),
      compareAPI
        .getFrequencyOfCompare({ limit: 10, sort: 'desc' })
        .catch(() => ({ success: false, data: [] })),
    ]);

    if (tractorRes.success && tractorRes.data) {
      tractor = tractorRes.data;

      // Fetch similar tractors (same brand)
      if (tractor.brandId) {
        try {
          const similarRes = await tractorAPI.getAllTractors({
            brandId: tractor.brandId,
            limit: 4,
          });
          if (similarRes.success) {
            const sPayload = similarRes.data as any;
            const sList = sPayload.tractors || sPayload.data || [];
            similarTractors = sList.filter((t: any) => t.id !== tractor.id).slice(0, 3);
          }
        } catch (e) {
          console.error('Error fetching similar tractors:', e);
        }
      }
    }

    if (compareRes.success && compareRes.data) {
      const cPayload = compareRes.data as any;
      const records = cPayload.records || cPayload || [];

      // Filter out rivals involving this tractor
      const relevantRivals = records
        .filter((r: any) => r.tractorLeft?.id === Number(id) || r.tractorRight?.id === Number(id))
        .slice(0, 3);

      // ONLY set rivals if there are direct comparisons. Avoid generic fallbacks to unrelated pairs.
      rivals = relevantRivals;
    }
  } catch (error) {
    console.error('Error fetching tractor details:', error);
  }

  if (!tractor) {
    notFound();
  }

  return (
    <TractorDetailsClient tractor={tractor} similarTractors={similarTractors} rivals={rivals} />
  );
}
