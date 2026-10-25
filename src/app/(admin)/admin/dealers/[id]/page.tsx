'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  XCircle,
  Save,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Star,
  Clock,
} from 'lucide-react';
import { dealerAPI, Dealer } from '@/lib/api/dealers';
import { TractorLoader } from '@/components/ui/TractorLoader';

export default function AdminDealerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const dealerId = Number(resolvedParams.id);

  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Admin form state
  const [verificationStatus, setVerificationStatus] = useState<'PENDING' | 'VERIFIED' | 'REJECTED'>(
    'VERIFIED'
  );
  const [isCertified, setIsCertified] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    async function loadDealer() {
      try {
        setLoading(true);
        const res = await dealerAPI.getDealerById(dealerId);
        if (res.success && res.data) {
          const d = res.data;
          setDealer(d);
          setVerificationStatus(d.verificationStatus as any || 'VERIFIED');
          setIsCertified(Boolean(d.isCertified));
          setIsActive(Boolean(d.isActive));
          setRejectionReason(d.rejectionReason || '');
        }
      } catch (err: any) {
        console.error('Failed to load dealer detail:', err);
        setErrorMsg('Dealer record not found or could not be loaded.');
      } finally {
        setLoading(false);
      }
    }
    loadDealer();
  }, [dealerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await dealerAPI.updateDealerByAdmin(dealerId, {
        verificationStatus,
        isCertified,
        isActive,
        rejectionReason: verificationStatus === 'REJECTED' ? rejectionReason : undefined,
      });

      if (res.success && res.data) {
        setDealer(res.data);
        setSuccessMsg('Dealer verification status updated successfully!');
      }
    } catch (err: any) {
      console.error('Failed to update dealer:', err);
      setErrorMsg(err?.response?.data?.message || 'Failed to update dealer status.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
        <TractorLoader size={48} />
        <p className="text-muted-foreground mt-3 text-xs font-bold">Loading dealer record...</p>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-foreground">Dealership Not Found</h2>
        <Link
          href="/admin/dealers"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-2 text-xs font-bold text-black"
        >
          <ArrowLeft size={14} /> Back to Dealers
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/dealers"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Back to Dealers List
        </Link>
      </div>

      {/* Main Card */}
      <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
                <Building2 size={18} />
              </span>
              <h1 className="text-2xl font-black text-foreground">{dealer.businessName}</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered ID: #{dealer.id} | Location: {dealer.district}, {dealer.state}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                dealer.verificationStatus === 'VERIFIED'
                  ? 'bg-lime-400/15 text-lime-400'
                  : dealer.verificationStatus === 'REJECTED'
                  ? 'bg-red-500/15 text-red-400'
                  : 'bg-amber-500/15 text-amber-400'
              }`}
            >
              {dealer.verificationStatus}
            </span>
          </div>
        </div>

        {/* Contact Info Overview */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl bg-secondary/20 p-4 text-xs">
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-lime-400 shrink-0" />
            <span className="font-bold text-foreground">+91 {dealer.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-lime-400 shrink-0" />
            <span className="truncate text-foreground">{dealer.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-lime-400 shrink-0" />
            <span className="truncate text-foreground">{dealer.address}</span>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 rounded-xl border border-lime-400/30 bg-lime-400/10 p-3 text-xs font-bold text-lime-400 flex items-center gap-2">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">
            {errorMsg}
          </div>
        )}

        {/* Admin Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-base font-extrabold text-foreground">Admin Verification & Badging</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                Verification Status
              </label>
              <select
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value as any)}
                className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2.5 text-xs font-bold focus:border-lime-400 focus:outline-none"
              >
                <option value="VERIFIED">VERIFIED (Authorized & Visible)</option>
                <option value="PENDING">PENDING (Under Document Review)</option>
                <option value="REJECTED">REJECTED (Failed Compliance)</option>
              </select>
            </div>

            {verificationStatus === 'REJECTED' && (
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                  Rejection Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Invalid GST Certificate or Trade License"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2.5 text-xs font-medium focus:border-lime-400 focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-6 border-t border-border/40 pt-4 text-xs font-bold text-foreground">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isCertified}
                onChange={(e) => setIsCertified(e.target.checked)}
                className="h-4 w-4 rounded accent-lime-400"
              />
              <span>TractorDost Certified Dealership Badge</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded accent-lime-400"
              />
              <span>Active on Public Dealership Finder</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border/40">
            <button
              type="button"
              onClick={() => router.push('/admin/dealers')}
              className="rounded-xl border border-border/60 px-6 py-2.5 text-xs font-bold text-foreground hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-8 py-2.5 text-xs font-black uppercase text-black hover:bg-lime-300 disabled:opacity-70 shadow-md"
            >
              <Save size={16} /> {submitting ? 'Updating...' : 'Save Verification Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
