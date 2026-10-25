import React from 'react';
import { Metadata } from 'next';
import { HarvestersClient } from '@/components/harvesters/HarvestersClient';

export const metadata: Metadata = {
  title: 'Combine Harvesters & Multi-Crop Harvesting Machines | TractorDost',
  description:
    'Explore top self-propelled, tractor-mounted, and track paddy combine harvesters from Preet, Dasmesh, Claas, Kartar, and John Deere with specifications and prices.',
};

export default function HarvestersPage() {
  return <HarvestersClient initialType="all" />;
}
