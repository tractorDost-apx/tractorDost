import React, { useState } from 'react';
import { X, Edit2, AlertCircle, Save } from 'lucide-react';
import { dealerAPI } from '@/lib/api/dealers';
import { Dealer, DealerType, UpdateDealerPayload } from '@/types/models/dealer';

interface EditDealerModalProps {
  dealer: Dealer;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditDealerModal({ dealer, onClose, onSuccess }: EditDealerModalProps) {
  const [businessName, setBusinessName] = useState(dealer.businessName || '');
  const [slug, setSlug] = useState(dealer.slug || '');
  const [dealerType, setDealerType] = useState<DealerType>(dealer.dealerType || 'BRAND_DEALER');
  const [phone, setPhone] = useState(dealer.phone || '');
  const [whatsapp, setWhatsapp] = useState(dealer.whatsapp || '');
  const [email, setEmail] = useState(dealer.email || '');
  const [website, setWebsite] = useState(dealer.website || '');
  const [address, setAddress] = useState(dealer.address || '');
  const [state, setState] = useState(dealer.state || '');
  const [district, setDistrict] = useState(dealer.district || '');
  const [pincode, setPincode] = useState(dealer.pincode || '');
  const [serviceRadiusKm, setServiceRadiusKm] = useState(
    dealer.serviceRadiusKm ? String(dealer.serviceRadiusKm) : '50'
  );
  const [aboutDealer, setAboutDealer] = useState(dealer.aboutDealer || '');
  const [seoTitle, setSeoTitle] = useState(dealer.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(dealer.seoDescription || '');

  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const payload: UpdateDealerPayload = {};

    if (businessName !== dealer.businessName) payload.businessName = businessName;
    if (slug !== dealer.slug) payload.slug = slug;
    if (dealerType !== dealer.dealerType) payload.dealerType = dealerType;
    if (phone !== dealer.phone) payload.phone = phone;
    if (whatsapp !== dealer.whatsapp) payload.whatsapp = whatsapp;
    if (email !== dealer.email) payload.email = email;
    if (website !== dealer.website) payload.website = website;
    if (address !== dealer.address) payload.address = address;
    if (state !== dealer.state) payload.state = state;
    if (district !== dealer.district) payload.district = district;
    if (pincode !== dealer.pincode) payload.pincode = pincode;
    if (serviceRadiusKm && Number(serviceRadiusKm) !== dealer.serviceRadiusKm) {
      payload.serviceRadiusKm = Number(serviceRadiusKm);
    }
    if (aboutDealer !== dealer.aboutDealer) payload.aboutDealer = aboutDealer;
    if (seoTitle !== dealer.seoTitle) payload.seoTitle = seoTitle;
    if (seoDescription !== dealer.seoDescription) payload.seoDescription = seoDescription;

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    try {
      setSubmitting(true);
      // Attempt self-edit first. If forbidden (e.g. admin editing another user's profile), fallback to updateDealerByAdmin
      let res;
      try {
        res = await dealerAPI.updateDealerById(dealer.id, payload);
      } catch (err: any) {
        if (err?.response?.status === 403) {
          // Admin override endpoint
          res = await dealerAPI.updateDealerByAdmin(dealer.id, {
            businessName: payload.businessName,
            phone: payload.phone,
            email: payload.email,
            address: payload.address,
            state: payload.state,
            district: payload.district,
            pincode: payload.pincode,
            serviceRadiusKm: payload.serviceRadiusKm,
          });
        } else {
          throw err;
        }
      }

      if (res.success) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error updating dealer:', err);
      setApiError(err?.response?.data?.message || 'Failed to update dealer details');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="w-full max-w-3xl bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Edit2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-foreground">
                Edit Dealership — {dealer.businessName}
              </h2>
              <p className="text-xs font-bold text-muted mt-0.5">Modify profile information and contact details.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {apiError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <p>{apiError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted block mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-lime-400/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-lime-400/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1">Dealer Type</label>
              <select
                value={dealerType}
                onChange={(e) => setDealerType(e.target.value as DealerType)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:border-lime-400/50"
              >
                <option value="BRAND_DEALER">BRAND_DEALER</option>
                <option value="MULTI_BRAND">MULTI_BRAND</option>
                <option value="USED_TRACTOR_DEALER">USED_TRACTOR_DEALER</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-lime-400/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-lime-400/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-lime-400/50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-muted block mb-1">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-lime-400/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-lime-400/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-lime-400/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-lime-400/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted block mb-1">Service Radius (Km)</label>
              <input
                type="number"
                value={serviceRadiusKm}
                onChange={(e) => setServiceRadiusKm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-lime-400/50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-muted block mb-1">About Dealer</label>
              <textarea
                rows={3}
                value={aboutDealer}
                onChange={(e) => setAboutDealer(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-lime-400/50"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-muted hover:text-foreground hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={16} />
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
