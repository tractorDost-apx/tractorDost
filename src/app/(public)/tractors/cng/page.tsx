import React from 'react';
import { Metadata } from 'next';
import { TractorCategoryClient } from '@/components/tractors/TractorCategoryClient';

export const metadata: Metadata = {
  title: 'CNG Tractors in India: Sustainable, Fuel-Saving Farming | TractorDost',
  description:
    'Explore clean compressed natural gas (CNG) and dual-fuel tractors that cut fuel operational costs by up to 40% while preserving engine life.',
};

export default function CNGTractorsPage() {
  return (
    <TractorCategoryClient
      title="CNG & Dual-Fuel Tractors in India"
      subtitle="Reduce farm fuel bills by up to 40% with factory-certified retrofitted and OEM Compressed Natural Gas tractor technology."
      badge="Eco Clean Fuel"
      fuelType="CNG"
      seoContent="<h2 class='text-xl font-bold text-foreground mb-3'>Save up to ₹1,00,000 Annually with CNG</h2><p class='mb-3'>With diesel prices fluctuating, CNG-powered tractors offer massive economic relief to farmers engaged in round-the-clock water pumping, threshing, and commercial haulage.</p><p>CNG burns cleaner, produces zero carbon deposits on spark plugs and cylinder heads, and extends engine oil drain intervals by double.</p>"
    />
  );
}
