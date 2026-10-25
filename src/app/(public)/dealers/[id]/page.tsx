'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Star,
  Tractor,
  MessageCircle,
  Navigation,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Send,
  Calendar,
} from 'lucide-react';
import { dealerAPI, Dealer } from '@/lib/api/dealers';
import { dealerInventoryAPI } from '@/lib/api/dealerInventory';
import { leadAPI } from '@/lib/api/leads';
import { TractorLoader } from '@/components/ui/TractorLoader';

export default function SingleDealerPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const dealerId = Number(resolvedParams.id);

  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Lead Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadMobile, setLeadMobile] = useState('');
  const [leadMessage, setLeadMessage] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  useEffect(() => {
    async function loadDealerData() {
      if (!dealerId || isNaN(dealerId)) return;
      try {
        setLoading(true);
        const [dealerRes, inventoryRes] = await Promise.allSettled([
          dealerAPI.getDealerById(dealerId),
          dealerInventoryAPI.getInventoryByDealer(dealerId),
        ]);

        if (dealerRes.status === 'fulfilled' && dealerRes.value.success && dealerRes.value.data) {
          setDealer(dealerRes.value.data);
        }

        if (inventoryRes.status === 'fulfilled' && inventoryRes.value.success) {
          setInventory(inventoryRes.value.data?.inventory || (inventoryRes.value.data as any) || []);
        }
      } catch (err) {
        console.error('Error fetching dealer:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDealerData();
  }, [dealerId]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealer || !leadMobile.trim()) return;

    setSubmittingLead(true);
    try {
      const cleanMobile = leadMobile.replace(/\s+/g, '').replace(/^\+91/, '');
      await leadAPI.createLead({
        leadType: 'TEST_DRIVE' as any,
        dealerId: dealer.id,
        name: leadName.trim() || 'Farmer Lead',
        mobile: cleanMobile,
        state: dealer.state || 'Maharashtra',
        district: dealer.district || undefined,
        message: leadMessage.trim() || `Inquiry for dealer: ${dealer.businessName}`,
        sourcePage: `/dealers/${dealer.id}`,
      });
      setLeadSuccess(true);
      setTimeout(() => {
        setLeadSuccess(false);
        setIsModalOpen(false);
        setLeadName('');
        setLeadMobile('');
        setLeadMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error submitting dealer lead:', err);
    } finally {
      setSubmittingLead(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <TractorLoader />
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <Store size={48} className="mx-auto mb-4 text-muted-foreground/40" />
        <h2 className="text-xl font-bold text-foreground">Dealership Not Found</h2>
        <p className="mt-1 text-xs text-muted-foreground">The requested dealership profile could not be located.</p>
        <Link
          href="/dealers"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500"
        >
          <ArrowLeft size={14} /> Back to All Dealers
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight size={14} />
        <Link href="/dealers" className="hover:text-foreground">
          Dealers
        </Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-semibold">{dealer.businessName}</span>
      </div>

      {/* Main Dealer Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card/90 via-card/50 to-background p-6 sm:p-10 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Store size={40} />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {dealer.businessName}
                </h1>
                {dealer.isCertified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">
                    <ShieldCheck size={14} /> Certified Dealer
                  </span>
                )}
              </div>

              <p className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                <MapPin size={14} className="text-emerald-500 shrink-0" />
                <span>
                  {dealer.address}, {dealer.district}, {dealer.state} {dealer.pincode ? `- ${dealer.pincode}` : ''}
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium pt-1">
                {dealer.rating !== undefined && (
                  <span className="flex items-center gap-1 font-bold text-foreground">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    {dealer.rating.toFixed(1)} ({dealer.reviewsCount || 0} reviews)
                  </span>
                )}
                {dealer.phone && (
                  <a href={`tel:${dealer.phone}`} className="flex items-center gap-1.5 hover:text-emerald-400">
                    <Phone size={13} className="text-emerald-500" /> {dealer.phone}
                  </a>
                )}
                {dealer.email && (
                  <a href={`mailto:${dealer.email}`} className="flex items-center gap-1.5 hover:text-emerald-400">
                    <Mail size={13} className="text-emerald-500" /> {dealer.email}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {dealer.phone && (
              <a
                href={`https://wa.me/91${dealer.phone.replace(/[^0-9]/g, '').slice(-10)}?text=Hello%20${encodeURIComponent(dealer.businessName)},%20I%20found%20your%20dealership%20on%20TractorDost.`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20"
              >
                <MessageCircle size={15} /> WhatsApp
              </a>
            )}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 active:scale-95 shadow-md shadow-emerald-600/25"
            >
              <Calendar size={15} /> Book Test Drive / Quote
            </button>
          </div>
        </div>
      </div>

      {/* Brands Authorized by Dealer */}
      {(dealer.dealerBrands || dealer.brands) && (dealer.dealerBrands || dealer.brands)!.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Authorized Brands</h2>
          <div className="flex flex-wrap gap-3">
            {(dealer.dealerBrands || dealer.brands)!.map((b: any) => (
              <div
                key={b.id || b.brandId}
                className="flex items-center gap-2.5 rounded-2xl border border-border/50 bg-card/60 px-4 py-2.5 backdrop-blur-md"
              >
                <Tractor size={16} className="text-emerald-500" />
                <span className="text-xs font-bold text-foreground">{b.brand?.name || `Brand #${b.brandId}`}</span>
                {b.isPrimary && (
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Showroom Inventory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            Tractors in Stock ({inventory.length})
          </h2>
          <span className="text-xs text-muted-foreground">Ready for immediate delivery</span>
        </div>

        {inventory.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-xs text-muted-foreground">
            Contact dealer directly for current showroom stock and delivery schedule.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {inventory.map((item: any) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border/50 bg-card/60 p-4 backdrop-blur-md space-y-3"
              >
                <div className="aspect-[16/10] rounded-xl bg-background/50 flex items-center justify-center">
                  <Tractor size={36} className="text-muted-foreground/30" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{item.tractor?.modelName || 'Tractor Model'}</h4>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">
                    {item.price ? `₹${Number(item.price).toLocaleString('en-IN')}` : 'Price on Call'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full rounded-xl bg-muted/60 py-2 text-xs font-bold text-foreground hover:bg-muted"
                >
                  Inquire Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking / Enquiry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-2xl backdrop-blur-xl">
            <h3 className="text-lg font-black text-foreground">Contact {dealer.businessName}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Book a free test drive, inquire about on-road pricing, or check seasonal discount offers.
            </p>

            {leadSuccess ? (
              <div className="mt-6 flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle2 size={48} className="text-emerald-400 mb-2 animate-bounce" />
                <h4 className="text-base font-bold text-foreground">Inquiry Sent to Dealer!</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  {dealer.businessName} will contact you shortly on your mobile.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Your Name</label>
                  <input
                    type="text"
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    pattern="[6-9][0-9]{9}"
                    value={leadMobile}
                    onChange={(e) => setLeadMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Message / Interested Model</label>
                  <textarea
                    rows={2}
                    value={leadMessage}
                    onChange={(e) => setLeadMessage(e.target.value)}
                    placeholder="e.g. Interested in 50 HP model, test drive on Saturday"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 rounded-xl border border-border py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingLead}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
                  >
                    {submittingLead ? 'Submitting...' : 'Send to Dealer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
