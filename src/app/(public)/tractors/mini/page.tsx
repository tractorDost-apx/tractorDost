import React from 'react';
import { Metadata } from 'next';
import { TractorCategoryClient } from '@/components/tractors/TractorCategoryClient';

export const metadata: Metadata = {
  title: 'Mini Tractors in India: Under 30 HP Price & Orchard Models | TractorDost',
  description:
    'Explore mini tractors under 30 HP for orchards, vineyards, sugarcane inter-row cultivation, and small holdings with prices starting from ₹3 Lakhs.',
};

export default function MiniTractorsPage() {
  return (
    <TractorCategoryClient
      title="Mini & Chota Tractors in India"
      subtitle="Compact, agile tractors under 30 HP designed for narrow orchard rows, vineyards, vegetable farming, and small farm plots."
      badge="Compact & Orchard"
      hpRange="under30"
      categoryTag="mini"
      seoContent="<h2 class='text-xl font-bold text-foreground mb-3'>Why Buy a Mini Tractor?</h2><p class='mb-3'>Mini tractors (15 HP to 28 HP) are specifically designed with narrow wheel tracks (under 3.5 feet) to pass between fruit orchard trees, grape vineyards, and cotton rows without damaging low-hanging branches or irrigation pipes.</p><p>Top models include Mahindra Jivo 225 DI, Kubota NeoStar B2441, Captain 250 DI, and Sonalika GT 22.</p>"
    />
  );
}
