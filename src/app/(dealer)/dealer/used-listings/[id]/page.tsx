'use client';

import React, { use } from 'react';
import SellerListingManager from '@/components/used-tractors/SellerListingManager';

export default function DealerManageUsedListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <SellerListingManager listingId={id} backHref="/dealer/used-listings" />;
}
