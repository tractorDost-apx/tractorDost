'use client';

import React, { use } from 'react';
import { UsedLocationClient } from '@/components/used-tractors/UsedLocationClient';

export default function UsedTractorsDistrictPage({
  params,
}: {
  params: Promise<{ state: string; district: string }>;
}) {
  const resolvedParams = use(params);
  const rawState = decodeURIComponent(resolvedParams.state);
  const rawDistrict = decodeURIComponent(resolvedParams.district);

  const formattedState = rawState
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const formattedDistrict = rawDistrict
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <UsedLocationClient
      state={formattedState}
      district={formattedDistrict}
      title={`Used Tractors in ${formattedDistrict}, ${formattedState}`}
      subtitle={`Browse verified second-hand tractors available in ${formattedDistrict}. Direct farmer and dealer listings with complete documentation.`}
    />
  );
}
