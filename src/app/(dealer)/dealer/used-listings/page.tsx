import React from 'react';
import MyUsedListings from '@/components/used-tractors/MyUsedListings';

export default function DealerUsedListingsPage() {
  return (
    <MyUsedListings
      basePath="/dealer/used-listings"
      createHref="/dealer/inventory"
      createLabel="List from Inventory"
    />
  );
}
