import React from 'react';
import { Metadata } from 'next';
import { TractorCategoryClient } from '@/components/tractors/TractorCategoryClient';

export const metadata: Metadata = {
  title: '2WD Tractors in India: Best Models, Price & Mileage | TractorDost',
  description:
    'Browse two-wheel drive (2WD) tractors in India. Discover affordable purchase prices, high fuel economy, and lower maintenance costs.',
};

export default function TwoWDTractorsPage() {
  return (
    <TractorCategoryClient
      title="2WD Tractors in India"
      subtitle="India's most popular tractor format. Highly fuel efficient, cost-effective to maintain, and versatile for sowing, spraying, and road haulage."
      badge="Two-Wheel Drive"
      driveType="TWO_WD"
      seoContent="<h2 class='text-xl font-bold text-foreground mb-3'>Advantages of 2WD Tractors</h2><p class='mb-3'>2WD tractors power the rear wheels while the front wheels provide crisp, tight steering. They are typically ₹1.5 to ₹2.5 Lakhs more affordable than equivalent 4WD variants and deliver unmatched fuel mileage on highway trolley haulage.</p><p>Ideal for dryland farming, inter-cultivation, threshing, water pumping, and trolley transportation across rural India.</p>"
    />
  );
}
