'use client';

import React, { useState, useEffect } from 'react';
import { usedTractorListingAPI } from '@/lib/api/used-listings';
import { usedTractorEnquiryAPI } from '@/lib/api/used-enquiries';
import {
  MapPin,
  Calendar,
  Clock,
  User as UserIcon,
  Phone,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Wrench,
  AlertCircle,
  Share2,
  Heart,
  ChevronRight,
  TrendingUp,
  Image as ImageIcon,
} from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Link from 'next/link';

export default function UsedTractorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const [tractor, setTractor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Enquiry Form State
  const [enquiryForm, setEnquiryForm] = useState({ name: '', mobile: '', offerPrice: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  useEffect(() => {
    usedTractorListingAPI.getListingById(Number(unwrappedParams.id)).then((res) => {
      if (res.success) {
        setTractor(res.data);
      }
      setLoading(false);
    });
  }, [unwrappedParams.id]);

  const handleEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEnquiryError(null);

    let finalMessage = 'I am interested in this tractor.';
    if (enquiryForm.offerPrice) {
      finalMessage = `I would like to offer ₹${enquiryForm.offerPrice} for this tractor.`;
    }

    usedTractorEnquiryAPI
      .createEnquiry({
        listingId: tractor.id,
        name: enquiryForm.name.trim(),
        mobile: enquiryForm.mobile.trim(),
        message: finalMessage,
      })
      .then((res) => {
        setIsSubmitting(false);
        if (res.success) {
          setSubmitted(true);
        } else {
          setEnquiryError(res.message || 'Failed to submit enquiry.');
        }
      });
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center pt-24">
        <TractorLoader className="text-[var(--color-brand-green)]" size={64} />
      </div>
    );
  }

  if (!tractor) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center pt-24">
        <h1 className="mb-4 text-3xl font-bold">Tractor Not Found</h1>
        <Link href="/used-tractors" className="text-[var(--color-brand-green)] hover:underline">
          Back to Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      {/* Breadcrumbs */}
      <div className="mx-auto mb-6 max-w-7xl px-4">
        <div className="text-muted flex items-center text-sm font-medium">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight size={14} className="mx-2" />
          <Link href="/used-tractors" className="hover:text-foreground">
            Used Tractors
          </Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-foreground">
            {tractor.tractorBrand} {tractor.tractorModel}
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 lg:grid-cols-12">
        {/* LEFT COLUMN: Media & Details */}
        <div className="space-y-8 lg:col-span-8">
          {/* Main Media Gallery */}
          <div className="bg-foreground/5 overflow-hidden rounded-3xl border border-[var(--border-subtle)]">
            <div className="group relative flex aspect-video items-center justify-center bg-black">
              {tractor.isCertified && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-[var(--color-brand-green)] px-3 py-1.5 text-xs font-black tracking-widest text-white uppercase shadow-lg">
                  <ShieldCheck size={14} /> Certified
                </div>
              )}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/40">
                  <Share2 size={18} />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/40">
                  <Heart size={18} />
                </button>
              </div>
              <img
                src={tractor.media?.[activeImage]?.url}
                alt={`${tractor.tractorBrand} ${tractor.tractorModel}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            {/* Thumbnail Strip */}
            <div className="flex gap-2 overflow-x-auto p-4">
              {(tractor.media || []).map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${activeImage === idx ? 'border-[var(--color-brand-green)]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img.url} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Overview Stats Card */}
          <div className="bg-foreground/5 rounded-3xl border border-[var(--border-subtle)] p-8">
            <h1 className="mb-2 text-3xl font-black tracking-tight md:text-4xl">
              {tractor.yearOfManufacture} {tractor.tractorBrand} {tractor.tractorModel}
            </h1>
            <div className="text-muted mb-8 flex items-center gap-2 font-medium">
              <MapPin size={16} /> {tractor.villageCity ? `${tractor.villageCity}, ` : ''}
              {tractor.district}, {tractor.state}
            </div>

            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="bg-background rounded-2xl border border-[var(--border-subtle)] p-4 text-center shadow-sm">
                <Calendar className="mx-auto mb-2 text-[var(--color-brand-green)]" size={24} />
                <p className="text-muted mb-1 text-xs font-bold tracking-wider uppercase">
                  Mfg Year
                </p>
                <p className="text-lg font-black">{tractor.yearOfManufacture}</p>
              </div>
              <div className="bg-background rounded-2xl border border-[var(--border-subtle)] p-4 text-center shadow-sm">
                <Clock className="mx-auto mb-2 text-[var(--color-brand-green)]" size={24} />
                <p className="text-muted mb-1 text-xs font-bold tracking-wider uppercase">
                  Hours Used
                </p>
                <p className="text-lg font-black">
                  {tractor.hoursUsed ? `${tractor.hoursUsed} hrs` : 'N/A'}
                </p>
              </div>
              <div className="bg-background rounded-2xl border border-[var(--border-subtle)] p-4 text-center shadow-sm">
                <UserIcon className="mx-auto mb-2 text-[var(--color-brand-green)]" size={24} />
                <p className="text-muted mb-1 text-xs font-bold tracking-wider uppercase">
                  Ownership
                </p>
                <p className="text-lg font-black">
                  {tractor.ownership}
                  {tractor.ownership === 1 ? 'st' : tractor.ownership === 2 ? 'nd' : 'rd'} Owner
                </p>
              </div>
              <div className="bg-background rounded-2xl border border-[var(--border-subtle)] p-4 text-center shadow-sm">
                <Wrench className="mx-auto mb-2 text-[var(--color-brand-green)]" size={24} />
                <p className="text-muted mb-1 text-xs font-bold tracking-wider uppercase">
                  Condition
                </p>
                <p className="text-lg font-black">{tractor.conditionGrade}</p>
              </div>
            </div>
          </div>

          {/* Inspection Report (If Certified) */}
          {tractor.isCertified && tractor.inspection && (
            <div className="from-foreground/5 relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-gradient-to-br to-transparent p-8">
              <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-[var(--color-brand-green)] opacity-5 blur-[100px]"></div>

              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-3 text-2xl font-black">
                  <ShieldCheck className="text-[var(--color-brand-green)]" size={32} />
                  Inspection Report
                </h3>
                <div className="text-center">
                  <span className="text-3xl font-black text-[var(--color-brand-green)]">
                    {tractor.inspection.overallScore}
                  </span>
                  <span className="text-muted text-sm font-bold">/100</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                {[
                  { label: 'Engine Health', score: tractor.inspection.engineScore },
                  { label: 'Tyre Condition', score: tractor.inspection.tyreScore },
                  { label: 'Hydraulics', score: tractor.inspection.hydraulicsScore },
                  { label: 'Body & Paint', score: tractor.inspection.bodyScore },
                  { label: 'Clutch & Gear', score: tractor.inspection.clutchScore },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="mb-2 flex justify-between text-sm font-bold">
                      <span>{item.label}</span>
                      <span className="text-[var(--color-brand-green)]">{item.score}%</span>
                    </div>
                    <div className="bg-foreground/10 h-2 w-full overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full bg-[var(--color-brand-green)]"
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {tractor.inspection.inspectorNotes && (
                <div className="bg-background mt-6 flex gap-3 rounded-2xl border border-[var(--border-subtle)] p-4">
                  <AlertCircle className="text-muted mt-0.5 flex-shrink-0" size={20} />
                  <p className="text-muted text-sm font-medium italic">
                    "{tractor.inspection.inspectorNotes}" - Expert Inspector
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Documents & Verification */}
          <div className="bg-foreground/5 rounded-3xl border border-[var(--border-subtle)] p-8">
            <h3 className="mb-6 flex items-center gap-3 text-2xl font-black">
              <FileText className="text-[var(--color-brand-green)]" size={28} />
              Documents & Status
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(tractor.documents || []).map((doc: any, i: number) => (
                <div
                  key={i}
                  className="bg-background flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] p-4"
                >
                  <span className="text-sm font-bold tracking-wider uppercase">
                    {doc.docType.replace('_', ' ')}
                  </span>
                  {doc.verifiedAt ? (
                    <span className="flex items-center gap-1 rounded-full bg-[var(--color-brand-green)]/10 px-3 py-1 text-sm font-black text-[var(--color-brand-green)]">
                      <CheckCircle2 size={14} /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-sm font-black text-red-500">
                      Pending
                    </span>
                  )}
                </div>
              ))}
              <div className="bg-background flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] p-4">
                <span className="text-sm font-bold tracking-wider uppercase">Finance Status</span>
                {tractor.financeAvailable ? (
                  <span className="flex items-center gap-1 rounded-full bg-[var(--color-brand-green)]/10 px-3 py-1 text-sm font-black text-[var(--color-brand-green)]">
                    <CheckCircle2 size={14} /> Available
                  </span>
                ) : (
                  <span className="text-muted bg-foreground/5 flex items-center gap-1 rounded-full px-3 py-1 text-sm font-black">
                    Not Available
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {tractor.description && (
            <div className="bg-foreground/5 rounded-3xl border border-[var(--border-subtle)] p-8">
              <h3 className="mb-4 text-2xl font-black">Seller Description</h3>
              <p className="text-foreground/80 leading-relaxed font-medium">
                {tractor.description}
              </p>

              {tractor.majorRepairs && (
                <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-700 dark:text-red-400">
                  <h4 className="mb-1 text-xs font-black tracking-wider uppercase">
                    Declared Repairs
                  </h4>
                  <p className="text-sm font-medium">{tractor.majorRepairs}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Sticky Enquiry & Pricing */}
        <div className="relative lg:col-span-4">
          <div className="sticky top-28 space-y-6">
            {/* Pricing Box */}
            <div className="bg-foreground text-background relative overflow-hidden rounded-3xl p-8 shadow-2xl">
              <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-[var(--color-brand-green)] opacity-20 blur-[50px]"></div>

              <div className="mb-2">
                <span className="text-background/60 text-xs font-bold tracking-widest uppercase">
                  Asking Price
                </span>
                <div className="mt-1 flex items-baseline gap-3">
                  <h2 className="text-4xl font-black">{formatPrice(tractor.askingPrice)}</h2>
                  {tractor.negotiable && (
                    <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-black tracking-wider uppercase">
                      Negotiable
                    </span>
                  )}
                </div>
              </div>

              {tractor.estimatedMarketPrice && (
                <div className="border-background/10 mt-4 flex items-center gap-3 border-t pt-4">
                  <TrendingUp size={20} className="text-[var(--color-brand-green)]" />
                  <div>
                    <p className="text-background/60 text-xs font-bold">Market Value Estimate</p>
                    <p className="text-sm font-black">
                      {formatPrice(tractor.estimatedMarketPrice)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Seller Details (Masked) */}
            {tractor.seller && (
              <div className="bg-background flex items-center gap-4 rounded-3xl border border-[var(--border-subtle)] p-6 shadow-sm">
                <div className="bg-foreground/5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                  <UserIcon size={24} className="text-muted" />
                </div>
                <div>
                  <p className="text-muted mb-0.5 text-xs font-bold tracking-widest uppercase">
                    Seller
                  </p>
                  <p className="text-lg font-black">{tractor.seller.fullName}</p>
                  <div className="mt-0.5 flex items-center gap-2 font-bold text-[var(--color-brand-green)]">
                    <Phone size={14} />
                    <span>
                      {tractor.seller.mobile
                        ? 'xxxxxxx' + tractor.seller.mobile.slice(-3)
                        : 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Lead Generation Form (UsedTractorEnquiry) */}
            <div className="bg-foreground/5 rounded-3xl border border-[var(--border-subtle)] p-8 shadow-xl">
              {tractor.listingStatus !== 'ACTIVE' ? (
                <div className="py-8 text-center">
                  <AlertCircle size={48} className="text-muted mx-auto mb-4 opacity-50" />
                  <h4 className="mb-2 text-xl font-black">Listing Unavailable</h4>
                  <p className="text-muted text-sm font-medium">
                    This tractor is no longer active or has been sold.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="mb-2 text-xl font-black">Interested in this tractor?</h3>
                  <p className="text-muted mb-6 text-sm font-medium">
                    Fill out your details to contact the seller directly.
                  </p>

                  {submitted ? (
                    <div className="animate-in fade-in zoom-in rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-6 text-center text-[var(--color-brand-green)] duration-500">
                      <CheckCircle2 size={48} className="mx-auto mb-3" />
                      <h4 className="mb-1 text-lg font-black">Enquiry Sent!</h4>
                      <p className="text-sm font-medium opacity-80">
                        The seller has received your details and will contact you shortly.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleEnquiry} className="space-y-4">
                      {enquiryError && (
                        <div className="flex items-start gap-2 rounded-xl bg-red-500/10 p-3 text-sm font-bold text-red-500">
                          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                          <span>{enquiryError}</span>
                        </div>
                      )}
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Your Full Name"
                          value={enquiryForm.name}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                          className="bg-background text-foreground w-full rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                        />
                      </div>
                      <div>
                        <input
                          type="tel"
                          required
                          placeholder="Mobile Number"
                          value={enquiryForm.mobile}
                          onChange={(e) =>
                            setEnquiryForm({ ...enquiryForm, mobile: e.target.value })
                          }
                          className="bg-background text-foreground w-full rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                        />
                      </div>
                      {tractor.negotiable && (
                        <div>
                          <input
                            type="number"
                            placeholder="Your Offer Price (Optional)"
                            value={enquiryForm.offerPrice}
                            onChange={(e) =>
                              setEnquiryForm({ ...enquiryForm, offerPrice: e.target.value })
                            }
                            className="bg-background text-foreground w-full rounded-2xl border border-[var(--border-subtle)] px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand-green)] py-4 font-black tracking-widest text-white uppercase shadow-[var(--color-brand-green)]/20 shadow-lg transition-all hover:bg-[var(--color-brand-green)]/90"
                      >
                        {isSubmitting ? (
                          <>
                            <TractorLoader size={20} /> Sending...
                          </>
                        ) : (
                          'Contact Seller'
                        )}
                      </button>
                      <p className="text-muted pt-2 text-center text-[10px] font-bold tracking-wider uppercase">
                        By submitting, you agree to Tractor Dost Terms & Conditions
                      </p>
                    </form>
                  )}
                </>
              )}
            </div>

            {/* Safety Tips */}
            <div className="bg-background flex gap-4 rounded-3xl border border-[var(--border-subtle)] p-6">
              <ShieldCheck className="flex-shrink-0 text-orange-500" size={24} />
              <div>
                <h4 className="mb-1 text-sm font-bold">Safety Tips</h4>
                <ul className="text-muted space-y-1 text-xs font-medium">
                  <li>• Don't pay in advance</li>
                  <li>• Inspect the tractor physically</li>
                  <li>• Verify original RC and documents</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
