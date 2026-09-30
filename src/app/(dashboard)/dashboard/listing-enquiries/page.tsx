import React from 'react';
import SellerEnquiryInbox from '@/components/used-tractors/SellerEnquiryInbox';

export default function ListingEnquiriesPage() {
  return <SellerEnquiryInbox listingBasePath="/dashboard/my-listings" title="Received Enquiries" />;
}
