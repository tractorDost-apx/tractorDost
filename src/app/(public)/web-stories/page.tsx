import React from 'react';
import { Metadata } from 'next';
import { WebStoriesClient } from '@/components/stories/WebStoriesClient';

export const metadata: Metadata = {
  title: 'Tractor Web Stories: Visual Agricultural Guides & Tips | TractorDost',
  description:
    'Explore visual stories on tractor mileage, government subsidies, farming implement selection, and maintenance advice.',
};

export default function WebStoriesPage() {
  return <WebStoriesClient />;
}
