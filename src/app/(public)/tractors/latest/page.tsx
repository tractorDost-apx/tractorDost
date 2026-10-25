import React from 'react';
import { Metadata } from 'next';
import { TractorCategoryClient } from '@/components/tractors/TractorCategoryClient';

export const metadata: Metadata = {
  title: 'Latest Tractor Launches in India 2026: New Models & Price | TractorDost',
  description:
    'Discover brand new tractor models launched in India featuring Trem-IV Common Rail engines, electronic hitch control, smart telematics, and upgraded styling.',
};

export default function LatestTractorsPage() {
  return (
    <TractorCategoryClient
      title="Latest Tractors in India 2026"
      subtitle="The newest agricultural machinery hitting dealership showrooms this season with Trem-IV CRDS engines, dual PTO speeds, and factory telematics."
      badge="Newly Launched"
      categoryTag="latest"
      seoContent="<h2 class='text-xl font-bold text-foreground mb-3'>What's New in 2026 Tractors?</h2><p class='mb-3'>Indian tractor manufacturers are adopting cutting-edge Common Rail Diesel Injection (CRDI), synchronised shuttle shift transmissions, and IoT connected apps that track live diesel levels and GPS geofencing right from the farmer's smartphone.</p><p>Check out the latest releases from Mahindra XP Plus, Swaraj XT series, and Sonalika Tiger series.</p>"
    />
  );
}
