import React from 'react';
import MyUsedListings from '@/components/used-tractors/MyUsedListings';

export default function MyListingsPage() {
  return <MyUsedListings basePath="/dashboard/my-listings" createHref="/sell-used-tractor" />;
}
