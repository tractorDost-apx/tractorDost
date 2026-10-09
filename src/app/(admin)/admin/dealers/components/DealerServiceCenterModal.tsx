'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Wrench,
  Building2,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Check,
  Truck,
  Zap,
  Package,
} from 'lucide-react';
import { Dealer } from '@/types/models/dealer';
import { serviceCenterAPI, CreateServiceCenterPayload } from '@/lib/api/serviceCenters';
import { dealerBrandAPI, AssignedDealerBrand } from '@/lib/api/dealerBrands';
import { brandAPI, Brand } from '@/lib/api/brands';

interface DealerServiceCenterModalProps {
  dealer: Dealer;
  onClose: () => void;
  onSuccess: () => void;
}

const SERVICE_OPTIONS: { id: string; label: string; desc: string }[] = [
  { id: 'general_maintenance', label: 'General Maintenance', desc: 'Periodic checkup & routine servicing' },
  { id: 'oil_change', label: 'Oil & Fluid Change', desc: 'Engine oil, transmission oil & filter replacement' },
  { id: 'engine_overhaul', label: 'Engine Overhaul', desc: 'Engine rebuild, timing & performance tuning' },
  { id: 'hydraulics_repair', label: 'Hydraulics Repair', desc: 'Lift pumps, valves, hoses & cylinder repair' },
  { id: 'transmission_repair', label: 'Transmission & Clutch', desc: 'Gearbox repair, clutch plate replacement' },
  { id: 'electrical', label: 'Electrical & Battery', desc: 'Wiring harness, alternator, self-starter & battery' },
  { id: 'tyre_fitting', label: 'Tyre & Wheel Fitting', desc: 'Tyre change, alignment & puncture repair' },
  { id: 'body_work', label: 'Body Work & Paint', desc: 'Dent removal, frame alignment & protective painting' },
  { id: 'spare_parts', label: 'Genuine Spare Parts', desc: 'OEM parts installation & genuine spares sales' },
];

export function DealerServiceCenterModal({
  dealer,
  onClose,
  onSuccess,
}: DealerServiceCenterModalProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [existingServiceCenter, setExistingServiceCenter] = useState<any | null>(null);
  const [availableBrands, setAvailableBrands] = useState<Array<{ id: number; name: string }>>([]);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    serviceName: `${dealer.businessName} Service Center`,
    address: dealer.address || '',
    state: dealer.state || '',
    district: dealer.district || '',
    pincode: dealer.pincode || '',
    latitude: dealer.latitude ? Number(dealer.latitude) : 18.5204,
    longitude: dealer.longitude ? Number(dealer.longitude) : 73.8567,
    phone: dealer.phone || '',
    whatsapp: dealer.whatsapp || '',
    emergencyPhone: '',
    hasPickupService: false,
    hasEmergencySupport: false,
    sparePartsAvailable: true,
    is24x7: false,
  });

  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'general_maintenance',
    'oil_change',
    'spare_parts',
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch brands and check if service center already exists
        const [scRes, brandsRes, masterBrandsRes] = await Promise.allSettled([
          serviceCenterAPI.getServiceCenterByDealer(dealer.id),
          dealerBrandAPI.getDealerBrands(dealer.id),
          brandAPI.getAllBrands({ limit: 100 }),
        ]);

        let allBrands: Array<{ id: number; name: string }> = [];
        let defaultBrandIds: number[] = [];

        if (brandsRes.status === 'fulfilled' && brandsRes.value.success) {
          const dealerBrands = brandsRes.value.data.brands || [];
          dealerBrands.forEach((b) => {
            allBrands.push({ id: b.id, name: b.name });
            defaultBrandIds.push(b.id);
          });
        }

        if (masterBrandsRes.status === 'fulfilled' && masterBrandsRes.value.success) {
          const masterList = masterBrandsRes.value.data.data || [];
          masterList.forEach((mb: Brand) => {
            if (!allBrands.some((b) => b.id === mb.id)) {
              allBrands.push({ id: mb.id, name: mb.name });
            }
          });
        }

        setAvailableBrands(allBrands);

        if (scRes.status === 'fulfilled' && scRes.value.success && scRes.value.data) {
          const sc = scRes.value.data;
          setExistingServiceCenter(sc);
          setFormData({
            serviceName: sc.serviceName,
            address: sc.address,
            state: sc.state,
            district: sc.district,
            pincode: sc.pincode || '',
            latitude: sc.latitude != null ? Number(sc.latitude) : 18.5204,
            longitude: sc.longitude != null ? Number(sc.longitude) : 73.8567,
            phone: sc.phone,
            whatsapp: sc.whatsapp || '',
            emergencyPhone: sc.emergencyPhone || '',
            hasPickupService: Boolean(sc.hasPickupService),
            hasEmergencySupport: Boolean(sc.hasEmergencySupport),
            sparePartsAvailable: Boolean(sc.sparePartsAvailable),
            is24x7: Boolean(sc.is24x7),
          });

          if (Array.isArray(sc.supportedBrands)) {
            setSelectedBrands(sc.supportedBrands.map((b: any) => (typeof b === 'object' ? b.id : Number(b))));
          } else if (defaultBrandIds.length > 0) {
            setSelectedBrands(defaultBrandIds);
          }

          if (Array.isArray(sc.servicesAvailable) && sc.servicesAvailable.length > 0) {
            setSelectedServices(sc.servicesAvailable);
          }
        } else {
          // If none exists, prefill from dealer brands
          if (defaultBrandIds.length > 0) {
            setSelectedBrands(defaultBrandIds);
          } else if (allBrands.length > 0) {
            setSelectedBrands([allBrands[0].id]);
          }
        }
      } catch (err: any) {
        console.error('Failed to load service center info:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [dealer.id]);

  const toggleBrand = (brandId: number) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId]
    );
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!formData.serviceName.trim() || formData.serviceName.length < 5) {
      setError('Service Center Name must be at least 5 characters');
      return;
    }

    if (!formData.address.trim() || formData.address.length < 10) {
      setError('Address must be at least 10 characters');
      return;
    }

    if (!formData.phone.trim()) {
      setError('A valid primary phone number is required');
      return;
    }

    if (selectedBrands.length === 0) {
      setError('Please select at least one supported brand');
      return;
    }

    if (selectedServices.length === 0) {
      setError('Please select at least one available service');
      return;
    }

    try {
      setSubmitting(true);

      const payload: CreateServiceCenterPayload = {
        serviceName: formData.serviceName.trim(),
        address: formData.address.trim(),
        state: formData.state.trim(),
        district: formData.district.trim(),
        pincode: formData.pincode.trim() || '411047',
        latitude: Number(formData.latitude) || 18.5204,
        longitude: Number(formData.longitude) || 73.8567,
        phone: formData.phone.trim(),
        whatsapp: formData.whatsapp.trim() || undefined,
        emergencyPhone: formData.emergencyPhone.trim() || undefined,
        supportedBrands: selectedBrands,
        servicesAvailable: selectedServices,
        hasPickupService: formData.hasPickupService,
        hasEmergencySupport: formData.hasEmergencySupport,
        sparePartsAvailable: formData.sparePartsAvailable,
        is24x7: formData.is24x7,
        workingHours: {
          monday: formData.is24x7 ? '24x7' : '09:00-19:00',
          tuesday: formData.is24x7 ? '24x7' : '09:00-19:00',
          wednesday: formData.is24x7 ? '24x7' : '09:00-19:00',
          thursday: formData.is24x7 ? '24x7' : '09:00-19:00',
          friday: formData.is24x7 ? '24x7' : '09:00-19:00',
          saturday: formData.is24x7 ? '24x7' : '09:00-19:00',
          sunday: formData.is24x7 ? '24x7' : 'closed',
        },
      };

      let res;
      if (existingServiceCenter) {
        res = await serviceCenterAPI.updateServiceCenter(dealer.id, payload);
      } else {
        res = await serviceCenterAPI.createServiceCenter(dealer.id, payload);
      }

      if (res.success) {
        setSuccessMsg(
          existingServiceCenter
            ? 'Service Center updated successfully!'
            : 'Service Center created successfully!'
        );
        setTimeout(() => {
          onSuccess();
        }, 600);
      } else {
        setError(res.message || 'Operation failed');
      }
    } catch (err: any) {
      console.error('Error creating/updating service center:', err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error?.[0]?.message ||
          err?.message ||
          'Failed to process service center request'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md sm:p-6">
      <div className="flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-foreground/5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-2.5 text-amber-400">
              <Wrench size={20} />
            </div>
            <div>
              <h2 className="text-foreground text-xl font-black tracking-tight">
                {existingServiceCenter ? 'Manage Service Center' : 'Create Dealer Service Center'}
              </h2>
              <p className="text-muted mt-0.5 flex items-center gap-1.5 text-xs font-bold">
                <span className="text-foreground">{dealer.businessName}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin size={11} className="text-lime-400" />
                  {dealer.district}, {dealer.state}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-muted hover:text-foreground rounded-xl p-2 transition-colors hover:bg-foreground/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-y-auto p-6">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-bold text-rose-400">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-400">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="text-muted flex items-center justify-center p-12 text-sm font-bold">
              Loading service center details...
            </div>
          ) : (
            <>
              {/* General Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-black tracking-wider text-amber-400 uppercase">
                  Service Center Details
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-muted mb-1 block text-xs font-bold">
                      Service Center Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.serviceName}
                      onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                      placeholder="e.g. Kisan Mahindra Authorized Service Center"
                      className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-amber-400/50 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-muted mb-1 block text-xs font-bold">
                      Workshop / Center Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Full street address of the workshop"
                      className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-amber-400/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-muted mb-1 block text-xs font-bold">State *</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-amber-400/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-muted mb-1 block text-xs font-bold">District *</label>
                    <input
                      type="text"
                      required
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-amber-400/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-muted mb-1 block text-xs font-bold">Pincode *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="6-digit pincode"
                      className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-amber-400/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-muted mb-1 block text-xs font-bold">Primary Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-amber-400/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-muted mb-1 block text-xs font-bold">WhatsApp Number</label>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="Optional WhatsApp contact"
                      className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-amber-400/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-muted mb-1 block text-xs font-bold">Emergency Breakdown Phone</label>
                    <input
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      placeholder="24x7 helpline number"
                      className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2.5 text-xs font-bold focus:border-amber-400/50 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Supported Brands */}
              <div className="space-y-3">
                <label className="block text-xs font-black tracking-wider text-amber-400 uppercase">
                  Supported Tractor Brands * ({selectedBrands.length} selected)
                </label>
                <div className="flex flex-wrap gap-2 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-3">
                  {availableBrands.map((brand) => {
                    const isSelected = selectedBrands.includes(brand.id);
                    return (
                      <button
                        type="button"
                        key={brand.id}
                        onClick={() => toggleBrand(brand.id)}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                          isSelected
                            ? 'border border-amber-400/40 bg-amber-400/20 text-amber-300'
                            : 'text-muted border border-[var(--border-subtle)] bg-foreground/5 hover:text-white'
                        }`}
                      >
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                            isSelected
                              ? 'border-amber-400 bg-amber-400 text-black'
                              : 'border-white/20 bg-foreground/5'
                          }`}
                        >
                          {isSelected && <Check size={12} className="stroke-[3]" />}
                        </div>
                        <span>{brand.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Services Available */}
              <div className="space-y-3">
                <label className="block text-xs font-black tracking-wider text-amber-400 uppercase">
                  Available Services & Capabilities * ({selectedServices.length} selected)
                </label>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {SERVICE_OPTIONS.map((srv) => {
                    const isSelected = selectedServices.includes(srv.id);
                    return (
                      <div
                        key={srv.id}
                        onClick={() => toggleService(srv.id)}
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-all select-none ${
                          isSelected
                            ? 'border-lime-400/30 bg-lime-400/10 text-foreground'
                            : 'border-[var(--border-subtle)] bg-foreground/5 text-muted hover:border-[var(--border-subtle)] hover:text-foreground'
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            isSelected
                              ? 'border-lime-400 bg-lime-400 text-black'
                              : 'border-white/20 bg-foreground/5'
                          }`}
                        >
                          {isSelected && <Check size={12} className="stroke-[3]" />}
                        </div>
                        <div>
                          <span className="block text-xs font-bold">{srv.label}</span>
                          <span className="text-muted block text-[10px] leading-tight">
                            {srv.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Center Capabilities & Amenities */}
              <div className="space-y-3">
                <label className="block text-xs font-black tracking-wider text-amber-400 uppercase">
                  Workshop Amenities & Facilities
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-3.5 transition-colors hover:bg-foreground/10">
                    <div className="flex items-center gap-3">
                      <Truck size={18} className="text-lime-400" />
                      <div>
                        <span className="text-foreground block text-xs font-bold">
                          Pickup & Drop Service
                        </span>
                        <span className="text-muted block text-[10px]">
                          Tractor towing and field pickup available
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.hasPickupService}
                      onChange={(e) =>
                        setFormData({ ...formData, hasPickupService: e.target.checked })
                      }
                      className="accent-lime-400 h-4 w-4 rounded"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-3.5 transition-colors hover:bg-foreground/10">
                    <div className="flex items-center gap-3">
                      <Zap size={18} className="text-amber-400" />
                      <div>
                        <span className="text-foreground block text-xs font-bold">
                          Emergency Breakdown Support
                        </span>
                        <span className="text-muted block text-[10px]">
                          On-field mechanic dispatch support
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.hasEmergencySupport}
                      onChange={(e) =>
                        setFormData({ ...formData, hasEmergencySupport: e.target.checked })
                      }
                      className="accent-amber-400 h-4 w-4 rounded"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-3.5 transition-colors hover:bg-foreground/10">
                    <div className="flex items-center gap-3">
                      <Package size={18} className="text-blue-400" />
                      <div>
                        <span className="text-foreground block text-xs font-bold">
                          Genuine Spare Parts In Stock
                        </span>
                        <span className="text-muted block text-[10px]">
                          OEM spare parts inventory available
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.sparePartsAvailable}
                      onChange={(e) =>
                        setFormData({ ...formData, sparePartsAvailable: e.target.checked })
                      }
                      className="accent-blue-400 h-4 w-4 rounded"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-3.5 transition-colors hover:bg-foreground/10">
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-emerald-400" />
                      <div>
                        <span className="text-foreground block text-xs font-bold">
                          24x7 Operations
                        </span>
                        <span className="text-muted block text-[10px]">
                          Open round the clock for servicing
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.is24x7}
                      onChange={(e) => setFormData({ ...formData, is24x7: e.target.checked })}
                      className="accent-emerald-400 h-4 w-4 rounded"
                    />
                  </label>
                </div>
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[var(--border-subtle)] bg-foreground/5 p-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-muted hover:text-foreground rounded-xl px-5 py-2.5 text-xs font-bold transition-colors hover:bg-foreground/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || loading}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-black tracking-wider text-black uppercase shadow-lg shadow-lime-400/10 transition-all hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save size={16} /> {existingServiceCenter ? 'Update Service Center' : 'Create Service Center'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
