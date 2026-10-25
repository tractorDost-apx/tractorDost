'use client';

import React, { use } from 'react';
import { UsedLocationClient } from '@/components/used-tractors/UsedLocationClient';

export default function UsedTractorsStatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const resolvedParams = use(params);
  const rawState = decodeURIComponent(resolvedParams.state);

  if (/^\d+$/.test(rawState)) {
    if (typeof window !== 'undefined') {
      window.location.replace(`/used-tractors/details/${rawState}`);
    }
  }

  const formattedState = rawState
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <UsedLocationClient
      state={formattedState}
      title={`Used Tractors in ${formattedState}`}
      subtitle={`Find verified pre-owned tractors for sale across ${formattedState}. Compare prices, inspect condition reports, and contact genuine sellers directly.`}
    />
  );
}
