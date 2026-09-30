import React from 'react';
import SellerEnquiryInbox from '@/components/used-tractors/SellerEnquiryInbox';

export default function DealerUsedLeadsPage() {
  return (
    <SellerEnquiryInbox
      listingBasePath="/dealer/used-listings"
      title="Used Tractor Leads"
      description="Buyers enquiring about your used tractor listings. Update each lead as you follow up."
    />
  );
}
