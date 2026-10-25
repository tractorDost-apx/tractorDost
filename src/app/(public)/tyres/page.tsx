import React from 'react';
import { Metadata } from 'next';
import { TyresClient } from '@/components/tyres/TyresClient';

export const metadata: Metadata = {
  title: 'Tractor Tyres: Front & Rear Tyres Price, Sizes & Brands | TractorDost',
  description:
    'Find and compare front and rear tractor tyres from BKT, Apollo, MRF, CEAT, and Goodyear. Check tyre sizes, ply rating, inflation pressure recommendations, and dealer prices.',
};

export default function TyresPage() {
  return <TyresClient />;
}
