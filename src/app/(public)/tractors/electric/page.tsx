import React from 'react';
import { Metadata } from 'next';
import { TractorCategoryClient } from '@/components/tractors/TractorCategoryClient';

export const metadata: Metadata = {
  title: 'Electric Tractors (EV) in India: Price, Specs & Zero Emission | TractorDost',
  description:
    'Explore next-generation electric tractors from AutoNxt, Sonalika Tiger Electric, Cellestial, and Havells with instant battery swap and solar charging compatibility.',
};

export default function ElectricTractorsPage() {
  return (
    <TractorCategoryClient
      title="Electric Tractors in India"
      subtitle="Experience zero emissions, zero diesel costs, instant high torque from 0 RPM, and whisper-quiet operations with 100% electric tractors."
      badge="Zero Emission EV"
      fuelType="ELECTRIC"
      seoContent="<h2 class='text-xl font-bold text-foreground mb-3'>The Green Farming Revolution</h2><p class='mb-3'>Electric tractors replace expensive diesel internal combustion engines with high-capacity Lithium-ion battery packs and permanent magnet synchronous motors (PMSM).</p><p>Operational costs fall from ₹300-400/hour with diesel down to under ₹40-60/hour with solar grid charging, making EV tractors a game-changer for greenhouse and indoor farming.</p>"
    />
  );
}
