import React from 'react';
import { Metadata } from 'next';
import { ImplementCategoryClient } from '@/components/implements/ImplementCategoryClient';

export const metadata: Metadata = {
  title: 'Electric & Battery Powered Farm Equipment | TractorDost',
  description:
    'Explore eco-friendly electric and battery operated agricultural implements. Zero tailpipe emissions, silent operation, and ultra-low running costs for modern farming.',
};

export default function ElectricImplementsPage() {
  return (
    <ImplementCategoryClient
      title="Electric & Battery Powered Farm Equipment"
      subtitle="Clean, sustainable farm mechanization. Discover electric weeders, battery power sprayers, electric reapers, and PTO-driven solar pumping attachments."
      badge="Zero Emission Tech"
      categoryTag="electric"
      seoContent="Electric agricultural tools and battery-operated tillers offer Indian farmers up to 70% reduction in operating energy costs compared to petrol and diesel machinery. Ideal for greenhouse cultivation, horticulture nurseries, organic farming, and indoor polyhouse maintenance."
    />
  );
}
