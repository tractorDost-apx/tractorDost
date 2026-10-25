import React from 'react';
import { Metadata } from 'next';
import { ImplementCategoryClient } from '@/components/implements/ImplementCategoryClient';

export const metadata: Metadata = {
  title: 'Latest Farm Machinery & Agricultural Implements 2026 | TractorDost',
  description:
    'Check newly launched 2026 farm implements in India. Discover smart pneumatic seed drills, high-speed multi-speed rotavators, and laser levellers with subsidy eligibility.',
};

export default function LatestImplementsPage() {
  return (
    <ImplementCategoryClient
      title="Latest 2026 Farm Implements & Tools"
      subtitle="Newly launched high-precision implements designed for next-generation farming. Certified under SMAM and Sub-Mission on Agricultural Mechanization."
      badge="2026 Innovations"
      categoryTag="latest"
      seoContent="The 2026 agricultural implement season introduces automated seed metering systems, laser land levelling units with digital receivers, and robust high-carbon boron steel rotavator blades. Farmers can claim central and state subsidies up to 50% through national DBT agricultural mechanization portals."
    />
  );
}
