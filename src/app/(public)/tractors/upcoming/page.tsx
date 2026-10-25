import React from 'react';
import { Metadata } from 'next';
import { TractorCategoryClient } from '@/components/tractors/TractorCategoryClient';

export const metadata: Metadata = {
  title: 'Upcoming Tractors in India 2026: Expected Prices & Launch Dates | TractorDost',
  description:
    'Stay ahead with upcoming tractor models scheduled for launch in India. Expected on-road prices, prototype field photos, and technical specifications.',
};

export default function UpcomingTractorsPage() {
  return (
    <TractorCategoryClient
      title="Upcoming Tractors in India"
      subtitle="Preview upcoming tractor models, autonomous prototypes, hydrogen concept engines, and high-horsepower utility tractors arriving soon."
      badge="Arriving Soon"
      categoryTag="upcoming"
      seoContent="<h2 class='text-xl font-bold text-foreground mb-3'>Upcoming Trends in Farm Mechanization</h2><p class='mb-3'>Top OEMs including Mahindra, Escorts Kubota, and John Deere are gearing up for launches featuring driverless steering aids, auto-depth draft sensing, and alternative bio-diesel powertrains.</p><p>Sign up to receive instant WhatsApp alerts when new models are unveiled at local dealerships.</p>"
    />
  );
}
