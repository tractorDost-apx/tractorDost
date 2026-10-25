import React from 'react';
import { Metadata } from 'next';
import { UsedLocationClient } from '@/components/used-tractors/UsedLocationClient';

export const metadata: Metadata = {
  title: 'Certified Second-Hand Used Tractors with 120-Point Inspection | TractorDost',
  description:
    'Buy verified and certified used tractors in India. Every tractor passes a 120-point mechanical check with genuine RC verification and easy finance options.',
};

export default function CertifiedUsedTractorsPage() {
  return (
    <UsedLocationClient
      isCertifiedOnly={true}
      title="Certified Second-Hand Tractors"
      subtitle="Every certified tractor is backed by our 120-point technical inspection report, transparent engine health records, and authentic RTO paperwork."
    />
  );
}
