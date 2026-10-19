'use client';

import React, { useState } from 'react';
import {
  X,
  Tractor,
  MessageCircle,
  Phone,
  User,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { usedTractorEnquiryAPI } from '@/lib/api/used-enquiries';
import { formatINR } from '@/lib/utils/format-currency';
import type { UsedTractorListing } from '@/types/models/used-listing';

interface PublicUsedEnquiryModalProps {
  listing: UsedTractorListing | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PublicUsedEnquiryModal({
  listing,
  onClose,
  onSuccess,
}: PublicUsedEnquiryModalProps) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!listing) return null;

  const fullTitle = `${listing.tractorBrand} ${listing.tractorModel}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setSubmitting(true);

      const messageParts = [
        message.trim() || `I am interested in buying this ${fullTitle}.`,
        offerPrice ? `Buyer's price offer: ${formatINR(Number(offerPrice))}` : '',
      ].filter(Boolean);

      const res = await usedTractorEnquiryAPI.createEnquiry({
        listingId: listing.id,
        name: name.trim(),
        mobile: cleanMobile,
        message: messageParts.join('\n'),
      });

      if (res.success) {
        setSubmitted(true);
        onSuccess?.();
      } else {
        setError(res.message || 'Failed to send inquiry. Please try again.');
      }
    } catch (err: any) {
      setError('Unable to send enquiry. Please check your internet connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200 dark:bg-black/75"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[85vh] overflow-y-auto w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl transition-all md:p-8 dark:border-white/10 dark:bg-[#141a16]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4 dark:text-emerald-400">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white">Inquiry Submitted!</h3>
            <p className="mt-2 text-sm text-zinc-600 max-w-sm dark:text-zinc-400">
              Your inquiry for <span className="font-bold text-zinc-900 dark:text-white">{fullTitle}</span> has been forwarded to the verified seller. They will contact you shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[var(--color-brand-green-dark)] shadow-md shadow-[var(--color-brand-green)]/20"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3.5 border-b border-zinc-100 pb-4 dark:border-white/10">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20">
                <Tractor size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white">Contact Seller</h3>
                <p className="mt-0.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {fullTitle} &bull; <span className="font-bold text-[var(--color-brand-green)]">{formatINR(listing.askingPrice)}</span>
                </p>
              </div>
            </div>

            {/* Privacy notice banner */}
            <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
              <ShieldCheck size={16} className="text-[var(--color-brand-green)] shrink-0" />
              <span>Direct connect with verified seller &bull; Secure buyer protection</span>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5 dark:text-zinc-200">
                  Your Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute top-3.5 left-3.5 text-zinc-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 pl-10 pr-3.5 py-2.5 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-[var(--color-brand-green)] focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500 dark:focus:bg-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5 dark:text-zinc-200">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute top-3.5 left-3.5 text-zinc-400 dark:text-zinc-500" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 pl-10 pr-3.5 py-2.5 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-[var(--color-brand-green)] focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500 dark:focus:bg-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5 dark:text-zinc-200">
                  Your Price Offer (₹) <span className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">(Optional)</span>
                </label>
                <div className="relative">
                  <IndianRupee size={15} className="absolute top-3.5 left-3.5 text-zinc-400 dark:text-zinc-500" />
                  <input
                    type="number"
                    min={10000}
                    step={5000}
                    placeholder={`Asking: ${formatINR(listing.askingPrice)}`}
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 pl-10 pr-3.5 py-2.5 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-[var(--color-brand-green)] focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500 dark:focus:bg-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5 dark:text-zinc-200">
                  Message to Seller
                </label>
                <textarea
                  rows={2}
                  placeholder="Ask about tractor condition, inspection date, or paperwork..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-3.5 py-2.5 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-[var(--color-brand-green)] focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500 dark:focus:bg-white/10"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-200 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[var(--color-brand-green)]/20 transition-all hover:bg-[var(--color-brand-green-dark)] hover:shadow-lg disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <MessageCircle size={14} /> Send Inquiry
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
