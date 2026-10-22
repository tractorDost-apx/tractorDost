'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import { dealerAPI } from '@/lib/api/dealers';
import { Dealer, DealerProfileSummary } from '@/types/models/dealer';
import { DealerProfileView } from './components/DealerProfileView';
import { DealerProfileEdit } from './components/DealerProfileEdit';
import { Store, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function DealerProfilePage() {
  const { user, refreshUser } = useAuth();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [profile, setProfile] = useState<DealerProfileSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const fetchDealerData = async () => {
    try {
      setLoading(true);
      setError(null);

      let targetDealerId: number | null = user?.dealer?.id || null;

      // Fallback: If dealer.id is not attached directly to user object, find it via getAllDealers
      if (!targetDealerId && user?.id) {
        const res = await dealerAPI.getAllDealers({ limit: 100 });
        if (res.success && res.data?.data) {
          const matched = res.data.data.find((d) => d.userId === user.id);
          if (matched) {
            targetDealerId = matched.id;
          } else if (
            user?.role?.name?.toUpperCase() === 'ADMIN' ||
            user?.role?.name?.toUpperCase() === 'SUPER_ADMIN'
          ) {
            const primary =
              res.data.data.find((d) => d.verificationStatus === 'VERIFIED') || res.data.data[0];
            if (primary) {
              targetDealerId = primary.id;
            }
          }
        }
      }

      if (!targetDealerId) {
        setError('No dealer profile linked to your user account.');
        setLoading(false);
        return;
      }

      const [dealerRes, profileRes] = await Promise.allSettled([
        dealerAPI.getDealerById(targetDealerId),
        dealerAPI.getDealerProfile(targetDealerId),
      ]);

      if (dealerRes.status === 'fulfilled' && dealerRes.value.success) {
        setDealer(dealerRes.value.data);
      } else {
        setError('Failed to fetch dealer details.');
      }

      if (profileRes.status === 'fulfilled' && profileRes.value.success) {
        setProfile(profileRes.value.data);
      }
    } catch (err: any) {
      console.error('Error loading dealer profile page:', err);
      setError(err?.response?.data?.message || err?.message || 'Error loading dealer profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDealerData();
    }
  }, [user?.id, user?.dealer?.id]);

  const handleSaveSuccess = async (updatedDealer: Dealer) => {
    setDealer(updatedDealer);
    setMode('view');
    await refreshUser();
    fetchDealerData();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 size={36} className="animate-spin text-[var(--color-brand-green)]" />
        <p className="text-muted text-sm font-bold">Loading complete Dealer Profile...</p>
      </div>
    );
  }

  if (error || !dealer) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 text-center">
        <div className="glass-panel w-full max-w-lg space-y-4 border border-rose-500/20 bg-rose-500/5 p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-foreground text-xl font-bold">Dealer Profile</h2>
          <p className="text-muted text-sm font-medium">
            {error || 'Unable to locate a dealer profile associated with your account.'}
          </p>
          <button
            onClick={() => fetchDealerData()}
            className="text-foreground inline-flex items-center gap-2 rounded-xl bg-foreground/10 px-4 py-2.5 text-xs font-bold transition-colors hover:bg-foreground/10"
          >
            <RefreshCw size={14} /> Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      {mode === 'view' ? (
        <DealerProfileView dealer={dealer} profile={profile} onEdit={() => setMode('edit')} />
      ) : (
        <DealerProfileEdit
          dealer={dealer}
          onCancel={() => setMode('view')}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
}
