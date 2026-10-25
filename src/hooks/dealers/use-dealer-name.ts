'use client';

import { useEffect, useState } from 'react';
import { dealerAPI } from '@/lib/api/dealers';

/**
 * Business name for a dealer id, or null while it is loading or no id is set.
 * Falls back to "Dealer #id" when the lookup fails, so a stale filter still shows something.
 */
export function useDealerName(dealerId: number | null): string | null {
  const [resolved, setResolved] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    if (dealerId === null) return;
    let cancelled = false;
    dealerAPI
      .getDealerById(dealerId)
      .then((res) => {
        if (!cancelled)
          setResolved({
            id: dealerId,
            name: res.success ? res.data.businessName : `Dealer #${dealerId}`,
          });
      })
      .catch(() => {
        if (!cancelled) setResolved({ id: dealerId, name: `Dealer #${dealerId}` });
      });
    return () => {
      cancelled = true;
    };
  }, [dealerId]);

  return dealerId !== null && resolved?.id === dealerId ? resolved.name : null;
}
