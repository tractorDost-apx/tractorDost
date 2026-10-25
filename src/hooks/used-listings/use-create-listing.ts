'use client';

import { useState } from 'react';
import { usedTractorListingAPI } from '@/lib/api/used-listings';
import type { CreateListingInput, UsedTractorListing } from '@/types/models/used-listing';

export function useCreateListing() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdListing, setCreatedListing] = useState<UsedTractorListing | null>(null);

  const submitListing = async (data: CreateListingInput): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await usedTractorListingAPI.createListing(data);
      if (res.success && res.data) {
        setCreatedListing(res.data);
        return true;
      } else {
        setError(res.message || 'Failed to submit tractor listing');
        return false;
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to publish listing');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitListing, isSubmitting, error, createdListing };
}
