import React from 'react';
import { Metadata } from 'next';
import NewsListClient from '@/components/news/NewsListClient';

export const metadata: Metadata = {
  title: 'Tractor News & Agriculture Industry Updates | TractorDost',
  description:
    'Latest updates on tractor launches, Indian government farm subsidies, price updates, agricultural technology, and industry news.',
  keywords:
    'tractor news, agriculture subsidies, PM kisan, tractor price update, farm mechanization, tractor launches, TractorDost',
  openGraph: {
    title: 'Tractor News & Agriculture Industry Updates | TractorDost',
    description:
      'Stay updated with breaking tractor launches, government subsidy policies, and farm mechanization news.',
    type: 'website',
  },
};

export default function NewsPage() {
  return <NewsListClient />;
}
