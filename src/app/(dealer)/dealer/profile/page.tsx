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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 size={36} className="text-[var(--color-brand-green)] animate-spin" />
        <p className="text-sm font-bold text-muted">Loading complete Dealer Profile...</p>
      </div>
    );
  }

  if (error || !dealer) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 text-center">
        <div className="glass-panel p-8 max-w-lg w-full space-y-4 border border-rose-500/20 bg-rose-500/5">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-xl font-bold text-foreground">Dealer Profile</h2>
          <p className="text-sm text-muted font-medium">
            {error || 'Unable to locate a dealer profile associated with your account.'}
          </p>
          <button
            onClick={() => fetchDealerData()}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 text-foreground hover:bg-white/20 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw size={14} /> Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {mode === 'view' ? (
        <DealerProfileView
          dealer={dealer}
          profile={profile}
          onEdit={() => setMode('edit')}
        />
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
