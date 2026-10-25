'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { UsedLocationClient } from '@/components/used-tractors/UsedLocationClient';

export default function UsedTractorsSpecificPage({
  params,
}: {
  params: Promise<{ state: string; district: string; slug: string }>;
}) {
  const resolvedParams = use(params);
  const rawState = decodeURIComponent(resolvedParams.state);
  const rawDistrict = decodeURIComponent(resolvedParams.district);
  const rawSlug = decodeURIComponent(resolvedParams.slug);

  const formattedState = rawState
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const formattedDistrict = rawDistrict
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const formattedModel = rawSlug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <UsedLocationClient
      state={formattedState}
      district={formattedDistrict}
      title={`${formattedModel} in ${formattedDistrict}, ${formattedState}`}
      subtitle={`Verified second-hand ${formattedModel} tractors available for immediate inspection and sale in ${formattedDistrict}.`}
    />
  );
}
