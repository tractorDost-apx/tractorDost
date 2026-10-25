import React from 'react';
import { Metadata } from 'next';
import { ImplementCategoryClient } from '@/components/implements/ImplementCategoryClient';

export const metadata: Metadata = {
  title: 'Popular Agricultural Implements in India | TractorDost',
  description:
    'Discover the most popular farm implements in India. Browse best-selling rotavators, reversible ploughs, super seeders, and multi-crop threshers with genuine farmer reviews and subsidies.',
};

export default function PopularImplementsPage() {
  return (
    <ImplementCategoryClient
      title="Most Popular Agricultural Implements"
      subtitle="India's highest rated and most trusted farm machinery. Engineered for maximum field efficiency, fuel savings, and crop yield enhancement."
      badge="Top Farmers' Choice"
      categoryTag="popular"
      seoContent="Modern Indian agriculture relies heavily on precision tractor implements. Popular implements like rotary tillers (rotavators) prepare seedbeds in a single pass, saving diesel and tractor wear. Super seeders and happy seeders eliminate stubble burning by simultaneously managing paddy residue and sowing wheat in a single operation."
    />
  );
}
