import React from 'react';
import { Metadata } from 'next';
import { ImplementCategoryClient } from '@/components/implements/ImplementCategoryClient';

export const metadata: Metadata = {
  title: 'Bio-CNG & Dual Fuel Farm Machinery | TractorDost',
  description:
    'Discover clean Bio-CNG and dual-fuel compatible agricultural implements and machinery in India. Lower operating costs and support agricultural circular economy.',
};

export default function CngImplementsPage() {
  return (
    <ImplementCategoryClient
      title="Bio-CNG & Dual Fuel Farm Equipment"
      subtitle="Sustainable machinery designed to run on compressed bio-gas and dual fuels. Reduced operating overhead with high operational reliability."
      badge="Bio-Economy Mechanization"
      categoryTag="cng"
      seoContent="Bio-CNG powered farm machinery represents the future of Indian agriculture, turning agricultural waste into high-density compressed natural gas. Coupled with dual-fuel engine technologies, farmers benefit from lower fuel bills without compromising on high torque requirements for heavy ploughing."
    />
  );
}
