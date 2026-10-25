import React from 'react';
import { Metadata } from 'next';
import { TractorCategoryClient } from '@/components/tractors/TractorCategoryClient';

export const metadata: Metadata = {
  title: 'Most Popular & Best Selling Tractors in India | TractorDost',
  description:
    'Discover India’s highest-selling tractors with proven reliability, high resale value, and widest nationwide dealership support.',
};

export default function PopularTractorsPage() {
  return (
    <TractorCategoryClient
      title="Most Popular Tractors in India"
      subtitle="The undisputed legends of Indian agriculture: Swaraj 744 FE, Mahindra 575 DI, Massey Ferguson 241 DI, Sonalika DI 745, and Farmtrac 60."
      badge="All-Time Best Sellers"
      categoryTag="popular"
      seoContent="<h2 class='text-xl font-bold text-foreground mb-3'>Why These Tractors Dominate Indian Fields</h2><p class='mb-3'>India's best-selling tractors earned their reputation over decades of relentless service in scorching heat, monsoon mud, and dusty threshing floors. They feature unmatched spare parts availability at every village crossroads and retain the highest resale value in the used market.</p><p>Compare user ratings, field review videos, and finance options for these iconic models.</p>"
    />
  );
}
