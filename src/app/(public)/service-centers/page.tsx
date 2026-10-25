import React from 'react';
import { Metadata } from 'next';
import { ServiceCentersClient } from '@/components/services/ServiceCentersClient';

export const metadata: Metadata = {
  title: 'Tractor Service Centers & Authorized Workshops Near You | TractorDost',
  description:
    'Find authorized tractor service centers for Mahindra, Swaraj, John Deere, Sonalika, and Massey Ferguson. Book genuine oil change, hydraulic repair, and mobile van servicing.',
};

export default function ServiceCentersPage() {
  return <ServiceCentersClient />;
}
