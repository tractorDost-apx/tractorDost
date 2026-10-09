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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-h-[80vh] overflow-y-auto w-full max-w-lg rounded-3xl border border-[var(--border-subtle)] bg-background p-6 shadow-2xl md:p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="text-muted hover:text-foreground absolute top-6 right-6 rounded-full p-2 transition-colors"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-2xl font-black text-foreground">Inquiry Submitted!</h3>
            <p className="text-muted mt-2 text-sm max-w-sm">
              Your inquiry for <span className="text-foreground font-bold">{fullTitle}</span> has been forwarded to the verified seller. They will contact you shortly.
            </p>
            <button
              onClick={onClose}
              className="bg-[var(--color-brand-green)] text-black mt-6 rounded-xl px-6 py-2.5 text-sm font-bold hover:opacity-90 transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                <Tractor size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Contact Seller</h3>
                <p className="text-muted text-xs font-bold">
                  {fullTitle} &bull; {formatINR(listing.askingPrice)}
                </p>
              </div>
            </div>

            {/* Privacy notice banner */}
            <div className="bg-foreground/5 mt-4 flex items-center gap-2.5 rounded-2xl border border-[var(--border-subtle)] p-3 text-xs text-muted font-medium">
              <ShieldCheck size={16} className="text-[var(--color-brand-green)] shrink-0" />
              <span>Direct connect with verified seller &bull; Secure buyer protection</span>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-foreground block text-xs font-bold mb-1">
                  Your Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="text-muted absolute top-3 left-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-foreground/5 w-full rounded-xl border border-[var(--border-subtle)] pl-9 pr-3 py-2.5 text-sm font-bold text-foreground focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-foreground block text-xs font-bold mb-1">
                  Mobile Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone size={15} className="text-muted absolute top-3 left-3" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="bg-foreground/5 w-full rounded-xl border border-[var(--border-subtle)] pl-9 pr-3 py-2.5 text-sm font-bold text-foreground focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-foreground block text-xs font-bold mb-1">
                  Your Price Offer (₹) <span className="text-muted text-[10px] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <IndianRupee size={15} className="text-muted absolute top-3 left-3" />
                  <input
                    type="number"
                    min={10000}
                    step={5000}
                    placeholder={`Asking: ${formatINR(listing.askingPrice)}`}
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="bg-foreground/5 w-full rounded-xl border border-[var(--border-subtle)] pl-9 pr-3 py-2.5 text-sm font-bold text-foreground focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-foreground block text-xs font-bold mb-1">
                  Message to Seller
                </label>
                <textarea
                  rows={2}
                  placeholder="Ask about tractor condition, inspection date, or paperwork..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-foreground/5 w-full rounded-xl border border-[var(--border-subtle)] px-3 py-2.5 text-sm font-bold text-foreground focus:border-[var(--color-brand-green)]/50 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-foreground/5 text-foreground rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-foreground/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[var(--color-brand-green)] hover:opacity-90 text-black flex items-center gap-1.5 rounded-xl px-6 py-2.5 text-xs font-bold shadow-md shadow-[var(--color-brand-green)]/20 disabled:opacity-50"
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
