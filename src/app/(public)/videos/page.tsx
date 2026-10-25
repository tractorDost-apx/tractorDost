import React from 'react';
import { Metadata } from 'next';
import { VideosListClient } from '@/components/videos/VideosListClient';

export const metadata: Metadata = {
  title: 'Tractor Videos, Expert Reviews & Field Demonstrations | TractorDost',
  description:
    'Watch the latest tractor reviews, mileage tests, rotavator and plow field demonstrations, and comparisons of top tractor brands in India.',
};

export default function VideosPage() {
  return <VideosListClient />;
}
