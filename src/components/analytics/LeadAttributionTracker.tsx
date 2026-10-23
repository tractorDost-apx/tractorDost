'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { captureAttributionOnLanding } from '@/lib/utils/lead-attribution';

/**
 * Headless client component that listens to URL / navigation changes
 * and records lead source attribution (WhatsApp, Instagram, Facebook, Google, etc.)
 */
export function LeadAttributionTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Run attribution capture on initial mount and when searchParams / path change
    captureAttributionOnLanding();
  }, [pathname, searchParams]);

  return null;
}
