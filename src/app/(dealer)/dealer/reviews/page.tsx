'use client';

import React, { useEffect, useState } from 'react';
import { Star, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { dealerAPI } from '@/lib/api/dealers';
import { serviceCenterAPI } from '@/lib/api/serviceCenters';
import { ReviewList } from '@/components/reviews/review-list';
import type { Dealer, ServiceCenter } from '@/types/models/dealer';

/**
 * Dealer portal: read-only view of the reviews received by this dealer and its service center.
 * Approval and edits are handled by admin; dealers cannot reply (no backend route for that).
 */
export default function DealerReviewsPage() {
  const { user } = useAuth();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [serviceCenter, setServiceCenter] = useState<ServiceCenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Same dealer lookup as the dealer profile page
        let dealerId: number | null = user?.dealer?.id || null;
        if (!dealerId && user?.id) {
          const res = await dealerAPI.getAllDealers({ limit: 100 });
          const matched = res.success ? res.data?.data.find((d) => d.userId === user.id) : undefined;
          dealerId = matched?.id ?? null;
        }
        if (!dealerId) {
          setError('No dealer profile linked to your user account.');
          return;
        }

        const [dealerRes, centerRes] = await Promise.allSettled([
          dealerAPI.getDealerById(dealerId),
          serviceCenterAPI.getServiceCenterByDealer(dealerId),
        ]);

        if (dealerRes.status === 'fulfilled' && dealerRes.value.success) {
          setDealer(dealerRes.value.data);
        } else {
          setError('Failed to load dealer details.');
        }
        // A dealer may not have a service center; that is not an error here
        if (centerRes.status === 'fulfilled' && centerRes.value.success) {
          setServiceCenter(centerRes.value.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reviews.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id, user?.dealer?.id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="text-muted animate-spin" size={32} />
      </div>
    );
  }

  if (error || !dealer) {
    return (
      <div className="glass-panel flex flex-col items-center gap-3 rounded-3xl p-10 text-center">
        <AlertCircle className="text-red-400" size={32} />
        <p className="text-muted text-sm">{error ?? 'Dealer not found.'}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-foreground text-2xl font-black">Customer Reviews</h1>
        <p className="text-muted text-sm">
          Reviews are published automatically. Admin can hide or edit them if needed.
        </p>
      </div>

      <div className="glass-panel flex items-center gap-4 rounded-3xl p-6">
        <div className="flex items-center gap-2 text-3xl font-black text-amber-400">
          <Star size={28} className="fill-amber-400" /> {Number(dealer.rating || 0).toFixed(1)}
        </div>
        <p className="text-muted text-sm">Based on {dealer.reviewsCount || 0} published reviews</p>
      </div>

      <section className="glass-panel space-y-4 rounded-3xl p-6">
        <h2 className="text-foreground text-lg font-black">Dealer reviews</h2>
        <ReviewList
          targetType="DEALER"
          targetId={dealer.id}
          currentUserId={user?.id}
          emptyText="No dealer reviews yet."
        />
      </section>

      <section className="glass-panel space-y-4 rounded-3xl p-6">
        <h2 className="text-foreground text-lg font-black">Service center reviews</h2>
        {serviceCenter ? (
          <ReviewList
            targetType="SERVICE_CENTER"
            targetId={serviceCenter.id}
            currentUserId={user?.id}
            emptyText="No service center reviews yet."
          />
        ) : (
          <p className="text-muted py-6 text-center text-sm">No service center is set up for this dealer.</p>
        )}
      </section>
    </div>
  );
}
