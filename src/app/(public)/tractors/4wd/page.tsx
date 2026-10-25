import React from 'react';
import { Metadata } from 'next';
import { TractorCategoryClient } from '@/components/tractors/TractorCategoryClient';

export const metadata: Metadata = {
  title: '4WD Tractors in India: Price, Specs & Models | TractorDost',
  description:
    'Explore four-wheel drive (4WD) tractors with superior traction for wet wetland puddling, heavy soil plowing, and front loader attachments in India.',
};

export default function FourWDTractorsPage() {
  return (
    <TractorCategoryClient
      title="4WD Tractors in India"
      subtitle="Heavy-duty four-wheel drive tractors engineered for superior traction in deep black soil, wetland paddy puddling, and laser leveler operations."
      badge="Four-Wheel Drive"
      driveType="FOUR_WD"
      seoContent="<h2 class='text-xl font-bold text-foreground mb-3'>Why Choose a 4WD Tractor?</h2><p class='mb-3'>4WD (Four-Wheel Drive) tractors distribute engine horsepower to all four wheels simultaneously. This dramatically reduces wheel slippage in sticky, waterlogged paddy fields and dense black cotton soil.</p><p>Key benefits include 15-20% higher pulling traction, reduced tyre wear, lower diesel consumption during heavy tillage, and superior front-axle stability when mounted with front-end loaders or dozer blades.</p>"
    />
  );
}
