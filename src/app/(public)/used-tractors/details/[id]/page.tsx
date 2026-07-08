'use client';

import React, { useState, useEffect } from 'react';
import { usedTractorAPI } from '@/lib/api/usedTractors';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  User as UserIcon, 
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
  Loader2
} from 'lucide-react';
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

  useEffect(() => {
    usedTractorAPI.getListingById(Number(unwrappedParams.id)).then(res => {
      if (res.success) {
        setTractor(res.data);
      }
      setLoading(false);
    });
  }, [unwrappedParams.id]);

  const handleEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    usedTractorAPI.submitEnquiry(tractor.id, {
      name: enquiryForm.name,
      mobile: enquiryForm.mobile,
      offerPrice: enquiryForm.offerPrice ? Number(enquiryForm.offerPrice) : undefined
    }).then(res => {
      setIsSubmitting(false);
      setSubmitted(true);
    });
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-[var(--color-brand-green)]" size={48} />
      </div>
    );
  }

  if (!tractor) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center bg-background">
        <h1 className="text-3xl font-bold mb-4">Tractor Not Found</h1>
        <Link href="/used-tractors" className="text-[var(--color-brand-green)] hover:underline">
          Back to Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="flex items-center text-sm text-muted font-medium">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight size={14} className="mx-2" />
          <Link href="/used-tractors" className="hover:text-foreground">Used Tractors</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-foreground">{tractor.tractorBrand} {tractor.tractorModel}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Media & Details */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Media Gallery */}
          <div className="bg-foreground/5 rounded-3xl overflow-hidden border border-[var(--border-subtle)]">
            <div className="relative aspect-video bg-black flex items-center justify-center group">
              {tractor.isCertified && (
                <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-[var(--color-brand-green)] text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Certified
                </div>
              )}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors">
                  <Share2 size={18} />
                </button>
                <button className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors">
                  <Heart size={18} />
                </button>
              </div>
              <img 
                src={tractor.media[activeImage]?.url} 
                alt={`${tractor.tractorBrand} ${tractor.tractorModel}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            {/* Thumbnail Strip */}
            <div className="flex gap-2 p-4 overflow-x-auto">
              {tractor.media.map((img: any, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-[var(--color-brand-green)]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img.url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Overview Stats Card */}
          <div className="bg-foreground/5 rounded-3xl p-8 border border-[var(--border-subtle)]">
            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
              {tractor.yearOfManufacture} {tractor.tractorBrand} {tractor.tractorModel}
            </h1>
            <div className="flex items-center gap-2 text-muted font-medium mb-8">
              <MapPin size={16} /> {tractor.villageCity ? `${tractor.villageCity}, ` : ''}{tractor.district}, {tractor.state}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-background rounded-2xl p-4 border border-[var(--border-subtle)] shadow-sm text-center">
                <Calendar className="text-[var(--color-brand-green)] mx-auto mb-2" size={24} />
                <p className="text-xs text-muted uppercase tracking-wider font-bold mb-1">Mfg Year</p>
                <p className="text-lg font-black">{tractor.yearOfManufacture}</p>
              </div>
              <div className="bg-background rounded-2xl p-4 border border-[var(--border-subtle)] shadow-sm text-center">
                <Clock className="text-[var(--color-brand-green)] mx-auto mb-2" size={24} />
                <p className="text-xs text-muted uppercase tracking-wider font-bold mb-1">Hours Used</p>
                <p className="text-lg font-black">{tractor.hoursUsed ? `${tractor.hoursUsed} hrs` : 'N/A'}</p>
              </div>
              <div className="bg-background rounded-2xl p-4 border border-[var(--border-subtle)] shadow-sm text-center">
                <UserIcon className="text-[var(--color-brand-green)] mx-auto mb-2" size={24} />
                <p className="text-xs text-muted uppercase tracking-wider font-bold mb-1">Ownership</p>
                <p className="text-lg font-black">{tractor.ownership}{tractor.ownership === 1 ? 'st' : tractor.ownership === 2 ? 'nd' : 'rd'} Owner</p>
              </div>
              <div className="bg-background rounded-2xl p-4 border border-[var(--border-subtle)] shadow-sm text-center">
                <Wrench className="text-[var(--color-brand-green)] mx-auto mb-2" size={24} />
                <p className="text-xs text-muted uppercase tracking-wider font-bold mb-1">Condition</p>
                <p className="text-lg font-black">{tractor.conditionGrade}</p>
              </div>
            </div>
          </div>

          {/* Inspection Report (If Certified) */}
          {tractor.isCertified && tractor.inspection && (
            <div className="bg-gradient-to-br from-foreground/5 to-transparent rounded-3xl p-8 border border-[var(--border-subtle)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-green)] opacity-5 blur-[100px] rounded-full pointer-events-none"></div>
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <ShieldCheck className="text-[var(--color-brand-green)]" size={32} />
                  Inspection Report
                </h3>
                <div className="text-center">
                  <span className="text-3xl font-black text-[var(--color-brand-green)]">{tractor.inspection.overallScore}</span>
                  <span className="text-sm text-muted font-bold">/100</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                {[
                  { label: 'Engine Health', score: tractor.inspection.engineScore },
                  { label: 'Tyre Condition', score: tractor.inspection.tyreScore },
                  { label: 'Hydraulics', score: tractor.inspection.hydraulicsScore },
                  { label: 'Body & Paint', score: tractor.inspection.bodyScore },
                  { label: 'Clutch & Gear', score: tractor.inspection.clutchScore },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span>{item.label}</span>
                      <span className="text-[var(--color-brand-green)]">{item.score}%</span>
                    </div>
                    <div className="w-full h-2 bg-foreground/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--color-brand-green)] rounded-full" style={{ width: `${item.score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {tractor.inspection.inspectorNotes && (
                <div className="mt-6 p-4 bg-background rounded-2xl border border-[var(--border-subtle)] flex gap-3">
                  <AlertCircle className="text-muted flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-muted font-medium italic">
                    "{tractor.inspection.inspectorNotes}" - Expert Inspector
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Documents & Verification */}
          <div className="bg-foreground/5 rounded-3xl p-8 border border-[var(--border-subtle)]">
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
              <FileText className="text-[var(--color-brand-green)]" size={28} />
              Documents & Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tractor.documents.map((doc: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-background rounded-2xl border border-[var(--border-subtle)]">
                  <span className="font-bold uppercase tracking-wider text-sm">{doc.docType.replace('_', ' ')}</span>
                  {doc.verifiedAt ? (
                    <span className="flex items-center gap-1 text-sm font-black text-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 px-3 py-1 rounded-full">
                      <CheckCircle2 size={14} /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm font-black text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                      Pending
                    </span>
                  )}
                </div>
              ))}
              <div className="flex items-center justify-between p-4 bg-background rounded-2xl border border-[var(--border-subtle)]">
                <span className="font-bold uppercase tracking-wider text-sm">Finance Status</span>
                {tractor.financeAvailable ? (
                  <span className="flex items-center gap-1 text-sm font-black text-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 px-3 py-1 rounded-full">
                    <CheckCircle2 size={14} /> Available
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm font-black text-muted bg-foreground/5 px-3 py-1 rounded-full">
                    Not Available
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {tractor.description && (
            <div className="bg-foreground/5 rounded-3xl p-8 border border-[var(--border-subtle)]">
              <h3 className="text-2xl font-black mb-4">Seller Description</h3>
              <p className="text-foreground/80 leading-relaxed font-medium">
                {tractor.description}
              </p>
              
              {tractor.majorRepairs && (
                <div className="mt-6 p-4 bg-red-500/10 text-red-700 dark:text-red-400 rounded-2xl border border-red-500/20">
                  <h4 className="font-black mb-1 uppercase tracking-wider text-xs">Declared Repairs</h4>
                  <p className="text-sm font-medium">{tractor.majorRepairs}</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Sticky Enquiry & Pricing */}
        <div className="lg:col-span-4 relative">
          <div className="sticky top-28 space-y-6">
            
            {/* Pricing Box */}
            <div className="bg-foreground text-background rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand-green)] opacity-20 blur-[50px] rounded-full pointer-events-none"></div>
              
              <div className="mb-2">
                <span className="text-background/60 font-bold uppercase tracking-widest text-xs">Asking Price</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <h2 className="text-4xl font-black">{formatPrice(tractor.askingPrice)}</h2>
                  {tractor.negotiable && (
                    <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-black uppercase tracking-wider">Negotiable</span>
                  )}
                </div>
              </div>

              {tractor.estimatedMarketPrice && (
                <div className="mt-4 pt-4 border-t border-background/10 flex items-center gap-3">
                  <TrendingUp size={20} className="text-[var(--color-brand-green)]" />
                  <div>
                    <p className="text-xs font-bold text-background/60">Market Value Estimate</p>
                    <p className="text-sm font-black">{formatPrice(tractor.estimatedMarketPrice)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Lead Generation Form (UsedTractorEnquiry) */}
            <div className="bg-foreground/5 rounded-3xl p-8 border border-[var(--border-subtle)] shadow-xl">
              <h3 className="text-xl font-black mb-2">Interested in this tractor?</h3>
              <p className="text-sm text-muted font-medium mb-6">Fill out your details to contact the seller directly.</p>

              {submitted ? (
                <div className="bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] p-6 rounded-2xl text-center border border-[var(--color-brand-green)]/20 animate-in fade-in zoom-in duration-500">
                  <CheckCircle2 size={48} className="mx-auto mb-3" />
                  <h4 className="font-black text-lg mb-1">Enquiry Sent!</h4>
                  <p className="text-sm font-medium opacity-80">The seller has received your details and will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleEnquiry} className="space-y-4">
                  <div>
                    <input 
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={enquiryForm.name}
                      onChange={e => setEnquiryForm({...enquiryForm, name: e.target.value})}
                      className="w-full px-5 py-4 bg-background border border-[var(--border-subtle)] rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none"
                    />
                  </div>
                  <div>
                    <input 
                      type="tel"
                      required
                      placeholder="Mobile Number"
                      value={enquiryForm.mobile}
                      onChange={e => setEnquiryForm({...enquiryForm, mobile: e.target.value})}
                      className="w-full px-5 py-4 bg-background border border-[var(--border-subtle)] rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none"
                    />
                  </div>
                  {tractor.negotiable && (
                    <div>
                      <input 
                        type="number"
                        placeholder="Your Offer Price (Optional)"
                        value={enquiryForm.offerPrice}
                        onChange={e => setEnquiryForm({...enquiryForm, offerPrice: e.target.value})}
                        className="w-full px-5 py-4 bg-background border border-[var(--border-subtle)] rounded-2xl text-sm font-bold text-foreground focus:ring-2 focus:ring-[var(--color-brand-green)] outline-none"
                      />
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[var(--color-brand-green)] text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-[var(--color-brand-green)]/20 hover:bg-[var(--color-brand-green)]/90 transition-all flex justify-center items-center gap-2 mt-2"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="animate-spin" size={18} /> Sending...</>
                    ) : (
                      'Contact Seller'
                    )}
                  </button>
                  <p className="text-[10px] text-center text-muted font-bold uppercase tracking-wider pt-2">
                    By submitting, you agree to Tractor Dost Terms & Conditions
                  </p>
                </form>
              )}
            </div>

            {/* Safety Tips */}
            <div className="p-6 bg-background rounded-3xl border border-[var(--border-subtle)] flex gap-4">
              <ShieldCheck className="text-orange-500 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-sm mb-1">Safety Tips</h4>
                <ul className="text-xs text-muted font-medium space-y-1">
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
