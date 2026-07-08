'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tractorAPI, Tractor, LaunchStatus, FuelType, DriveType } from '@/lib/api/tractors';
import { brandAPI, Brand } from '@/lib/api/brands';
import { categoryAPI, Category } from '@/lib/api/categories';
import { mediaAPI } from '@/lib/api/media';
import MediaUploader from '@/components/shared/MediaUploader';
import TractorSpecForm from './TractorSpecForm';
import TractorStatePrices from './TractorStatePrices';
import { Save, X, Info, Settings, IndianRupee, Image as ImageIcon, ChevronRight } from 'lucide-react';

interface TractorFormProps {
  initialData?: Tractor;
  isEdit?: boolean;
  initialTab?: string;
}

const TABS = [
  { id: 'basic', label: 'Basic Info', icon: Info },
  { id: 'specs', label: 'Specifications', icon: Settings },
  { id: 'pricing', label: 'Pricing', icon: IndianRupee },
  { id: 'media', label: 'Media', icon: ImageIcon },
  { id: 'seo', label: 'Content & SEO', icon: Info },
];

export default function TractorForm({ initialData, isEdit = false, initialTab = 'basic' }: TractorFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // State for Form Data
  const [formData, setFormData] = useState<Partial<Tractor> & { categoryIds?: number[] }>({
    brandId: 0,
    modelName: '',
    slug: '',
    launchStatus: LaunchStatus.LATEST,
    fuelType: FuelType.DIESEL,
    driveType: DriveType.TWO_WD,
    isActive: true,
    isFeatured: false,
    hp: 0,
    exShowroomPriceMin: 0,
    exShowroomPriceMax: 0,
    overview: '',
    seoTitle: '',
    seoDescription: '',
    financeAvailable: false,
    spec: {},
    priceByState: [],
    categoryIds: [],
  });

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [brochureFile, setBrochureFile] = useState<File[]>([]);

  // Live validation errors
  const validationErrors: Record<string, string> = {};
  if (touched.brandId && (!formData.brandId || formData.brandId === 0)) validationErrors.brandId = 'Brand is required';
  if (touched.modelName && !formData.modelName?.trim()) validationErrors.modelName = 'Model Name is required';
  if (touched.slug && !formData.slug?.trim()) validationErrors.slug = 'Slug is required';
  if (touched.categoryIds && (!formData.categoryIds || formData.categoryIds.length === 0)) validationErrors.categoryIds = 'Select at least one category';

  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));
  const fieldClass = (field: string) =>
    validationErrors[field]
      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
      : 'border-transparent focus:border-[var(--color-brand-green)]/50 focus:ring-[var(--color-brand-green)]/20';
  const baseInputClass = 'w-full bg-foreground/5 border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:bg-background focus:ring-2 transition-all';

  useEffect(() => {
    fetchDependencies();
    if (initialData) {
      setFormData({
        ...initialData,
        categoryIds: initialData.categories?.map((c: any) => c.categoryId) || []
      });
    }
  }, [initialData]);

  const fetchDependencies = async () => {
    try {
      const [brandRes, catRes] = await Promise.all([
        brandAPI.getAllBrands({ limit: 100 }),
        categoryAPI.getAllCategories({ limit: 100 })
      ]);
      if (brandRes.success) setBrands(brandRes.data.data);
      if (catRes.success) setCategories(catRes.data.data || []);
    } catch (error) {
      console.error("Failed to load dependencies");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    markTouched(name);
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Auto slugify model name
  useEffect(() => {
    if (!isEdit && formData.modelName) {
      setFormData(prev => ({
        ...prev,
        slug: formData.modelName!.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      }));
    }
  }, [formData.modelName, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all mandatory fields as touched
    setTouched({ brandId: true, modelName: true, slug: true, categoryIds: true });

    // Check mandatory fields before proceeding
    if (!formData.brandId || formData.brandId === 0) { 
      setActiveTab('basic');
      alert('Please select a valid brand.'); 
      return; 
    }
    if (!formData.modelName?.trim()) { 
      setActiveTab('basic');
      alert('Please enter a Model Name.'); 
      return; 
    }
    if (!formData.slug?.trim()) { 
      setActiveTab('basic');
      alert('Please enter a Slug.'); 
      return; 
    }
    if (!formData.categoryIds || formData.categoryIds.length === 0) { 
      setActiveTab('basic');
      alert('Please select at least one category.'); 
      return; 
    }

    // Check mandatory spec fields
    const spec = formData.spec || {};
    const hasSpecData = Object.keys(spec).length > 0 && Object.values(spec).some(v => v !== null && v !== '' && v !== undefined);
    
    // If the user has entered any spec data (or it's an edit with existing specs), we must validate the mandatory spec fields
    if (hasSpecData) {
      if (!spec.engineCc) {
        setTouched(prev => ({ ...prev, spec_engineCc: true }));
        setActiveTab('specs');
        alert('Engine CC is required in Specifications.');
        return;
      }
      if (!spec.cylinders) {
        setTouched(prev => ({ ...prev, spec_cylinders: true }));
        setActiveTab('specs');
        alert('Cylinders is required in Specifications.');
        return;
      }
      if (!spec.liftingCapacityKg) {
        setTouched(prev => ({ ...prev, spec_liftingCapacityKg: true }));
        setActiveTab('specs');
        alert('Lifting Capacity is required in Specifications.');
        return;
      }
      // Define specific maximums based on Prisma schema (DECIMAL bounds)
      const decimalBounds: Record<string, number> = {
        maxTorqueNm: 999999.99,
        engineOilCapacityL: 999.99,
        maxSpeedFwdKmph: 999.99,
        maxSpeedRevKmph: 999.99,
        pumpFlowRateLpm: 9999.99,
        turningRadiusM: 999.99,
        fuelConsumptionLph: 999.99,
        batteryCapacityKwh: 999999.99,
        motorKw: 999999.99,
        chargingTimeHours: 99.99,
        annualServiceCostEstimate: 99999999.99,
      };

      for (const [key, val] of Object.entries(spec)) {
        if (typeof val === 'number') {
          const maxAllowed = decimalBounds[key] || 2000000000;
          if (val > maxAllowed) {
            setTouched(prev => ({ ...prev, [`spec_${key}`]: true }));
            setActiveTab('specs');
            alert(`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} must be less than or equal to ${maxAllowed.toLocaleString()}.`);
            return;
          }
          if (val < 0) {
            setTouched(prev => ({ ...prev, [`spec_${key}`]: true }));
            setActiveTab('specs');
            alert(`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} must be a positive number.`);
            return;
          }
        }
      }
    }

    setLoading(true);

    try {
      const sanitizedData = { ...formData };
      
      // Clean up optional numeric fields that default to 0
      if (!sanitizedData.hp) delete sanitizedData.hp;
      if (!sanitizedData.exShowroomPriceMin) delete sanitizedData.exShowroomPriceMin;
      if (!sanitizedData.exShowroomPriceMax) delete sanitizedData.exShowroomPriceMax;

      // Strip nulls, empty strings, and relations that backend Zod schema doesn't accept
      Object.keys(sanitizedData).forEach(key => {
        const k = key as keyof typeof sanitizedData;
        if (sanitizedData[k] === null || sanitizedData[k] === '') {
          delete sanitizedData[k];
        }
      });
      
      delete sanitizedData.brand;
      delete sanitizedData.categories;
      delete sanitizedData.media;
      delete sanitizedData.primaryMedia;
      delete sanitizedData.createdAt;
      delete sanitizedData.updatedAt;

      // Extract spec to handle it via a separate API call
      const tractorSpecData = sanitizedData.spec;
      delete sanitizedData.spec;

      // Format pros from comma-separated string to array if needed
      if (typeof sanitizedData.pros === 'string') {
        sanitizedData.pros = (sanitizedData.pros as string)
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      }

      if (!sanitizedData.brandId) {
        alert("Please select a valid brand.");
        setLoading(false);
        return;
      }
      
      if (!sanitizedData.categoryIds || sanitizedData.categoryIds.length === 0) {
        alert("Please select at least one category.");
        setLoading(false);
        return;
      }

      let res;
      let tractorId = initialData?.id;
      if (isEdit && tractorId) {
        res = await tractorAPI.updateTractor(tractorId, sanitizedData);
      } else {
        res = await tractorAPI.createTractor(sanitizedData);
        if (res.success && res.data) {
          tractorId = res.data.id;
        }
      }

      if (res.success && tractorId) {
        // Save Tractor Specs via separate API Call
        if (tractorSpecData && Object.keys(tractorSpecData).length > 0) {
          const specPayload: any = { ...tractorSpecData, tractorId };

          // Scrub null and empty strings perfectly on the frontend
          Object.keys(specPayload).forEach(key => {
            if (specPayload[key] === null || specPayload[key] === '') {
              delete specPayload[key];
            }
          });

          if (specPayload.id) {
            await tractorAPI.updateTractorSpec(specPayload.id, specPayload);
          } else {
            await tractorAPI.createTractorSpec(specPayload);
          }
        }

        // Upload media files if any
        if (mediaFiles.length > 0) {
          const mediaData = new FormData();
          mediaData.append('targetId', String(tractorId));
          mediaData.append('isPrimary', 'true'); // Automatically marks the first image as primary in the backend
          mediaData.append('mediaType', 'image');
          mediaFiles.forEach(file => mediaData.append('file', file));
          await mediaAPI.createMedia(mediaData);
        }

        // Upload brochure if any
        if (brochureFile.length > 0) {
          const brochureData = new FormData();
          brochureData.append('targetId', String(tractorId));
          brochureData.append('mediaType', 'pdf');
          brochureData.append('file', brochureFile[0]);
          await mediaAPI.createMedia(brochureData);
        }

        router.push('/admin/tractors');
      }
    } catch (error) {
      console.error("Failed to save tractor", error);
      alert("Error saving tractor. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start h-full pb-12 animate-fade-in">

      {/* Sidebar Tabs */}
      <div className="w-full md:w-64 shrink-0 glass-panel p-2 rounded-2xl sticky top-6">
        <nav className="flex flex-col gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                  ? 'bg-[var(--color-brand-green)] text-white shadow-md'
                  : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
                  }`}
              >
                <Icon size={18} />
                {tab.label}
                {isActive && <ChevronRight size={16} className="ml-auto" />}
              </button>
            );
          })}
        </nav>

        <div className="mt-8 pt-4 border-t border-[var(--border-subtle)] px-2 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-foreground text-background font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" /> : <Save size={18} />}
            {isEdit ? 'Save Changes' : 'Create Tractor'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/admin/tractors')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground font-bold transition-all"
          >
            <X size={18} />
            Cancel
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full">
        <form onSubmit={handleSubmit} className="glass-panel p-6 md:p-8 rounded-2xl">

          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h2 className="text-2xl font-black text-foreground mb-2">Basic Information</h2>
              <p className="text-xs text-muted mb-2">Fields marked with <span className="text-red-500 font-bold">*</span> are mandatory.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Brand Name <span className="text-red-500">*</span></label>
                  <select
                    name="brandId"
                    value={formData.brandId || 0}
                    onChange={(e) => { markTouched('brandId'); setFormData(prev => ({ ...prev, brandId: parseInt(e.target.value) || 0 })); }}
                    onBlur={() => markTouched('brandId')}
                    required
                    className={`${baseInputClass} ${fieldClass('brandId')} appearance-none`}
                  >
                    <option value={0}>Select a brand</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  {validationErrors.brandId && <p className="text-[11px] font-semibold text-red-500 animate-fade-in">{validationErrors.brandId}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Categories <span className="text-red-500">*</span></label>
                  <div className={`flex flex-wrap gap-2 mt-1 p-2 rounded-xl ${validationErrors.categoryIds ? 'ring-1 ring-red-500/50' : ''}`}>
                    {categories.map((c) => {
                      const isSelected = formData.categoryIds?.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all border ${
                            isSelected
                              ? 'bg-[var(--color-brand-green)]/10 border-[var(--color-brand-green)] text-[var(--color-brand-green)]'
                              : 'bg-foreground/5 border-transparent text-foreground hover:bg-foreground/10'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={isSelected}
                            onChange={(e) => {
                              markTouched('categoryIds');
                              const checked = e.target.checked;
                              setFormData((prev) => ({
                                ...prev,
                                categoryIds: checked
                                  ? [...(prev.categoryIds || []), c.id]
                                  : (prev.categoryIds || []).filter((id) => id !== c.id),
                              }));
                            }}
                          />
                          {c.name}
                        </label>
                      );
                    })}
                  </div>
                  {validationErrors.categoryIds && <p className="text-[11px] font-semibold text-red-500 animate-fade-in">{validationErrors.categoryIds}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Model Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="modelName"
                    value={formData.modelName}
                    onChange={handleChange}
                    onBlur={() => markTouched('modelName')}
                    required
                    placeholder="e.g. YUVO TECH+ 575"
                    className={`${baseInputClass} ${fieldClass('modelName')}`}
                  />
                  {validationErrors.modelName && <p className="text-[11px] font-semibold text-red-500 animate-fade-in">{validationErrors.modelName}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Slug <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    onBlur={() => markTouched('slug')}
                    required
                    className={`${baseInputClass} ${fieldClass('slug')}`}
                  />
                  {validationErrors.slug && <p className="text-[11px] font-semibold text-red-500 animate-fade-in">{validationErrors.slug}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Horsepower (HP)</label>
                  <input
                    type="number"
                    name="hp"
                    value={formData.hp ?? ''}
                    onChange={handleChange}
                    className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Fuel Type</label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all appearance-none"
                  >
                    {Object.values(FuelType).map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Drive Type</label>
                  <select
                    name="driveType"
                    value={formData.driveType}
                    onChange={handleChange}
                    className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all appearance-none"
                  >
                    {Object.values(DriveType).map(d => (
                      <option key={d} value={d}>{d.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <label className="text-xs font-bold text-muted uppercase tracking-wider">Overview / Description</label>
                <textarea
                  name="overview"
                  value={formData.overview || ''}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Detailed description of the tractor..."
                  className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-medium text-foreground focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: SPECS */}
          {activeTab === 'specs' && (
            <TractorSpecForm
              spec={formData.spec || {}}
              touched={touched}
              onChange={(field, value) => {
                setFormData(prev => ({
                  ...prev,
                  spec: {
                    ...(prev.spec || {}),
                    [field]: value
                  }
                }));
              }}
            />
          )}

          {/* TAB 3: PRICING */}
          {activeTab === 'pricing' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h2 className="text-2xl font-black text-foreground mb-2">Pricing & Features</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Ex-Showroom Price (Min)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold">₹</span>
                    <input
                      type="number"
                      name="exShowroomPriceMin"
                      value={formData.exShowroomPriceMin || ''}
                      onChange={handleChange}
                      placeholder="e.g. 500000"
                      className="w-full bg-foreground/5 border border-transparent rounded-xl pl-8 pr-4 py-3 text-sm font-bold text-foreground focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Ex-Showroom Price (Max)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold">₹</span>
                    <input
                      type="number"
                      name="exShowroomPriceMax"
                      value={formData.exShowroomPriceMax || ''}
                      onChange={handleChange}
                      placeholder="e.g. 600000"
                      className="w-full bg-foreground/5 border border-transparent rounded-xl pl-8 pr-4 py-3 text-sm font-bold text-foreground focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Launch Status</label>
                  <select
                    name="launchStatus"
                    value={formData.launchStatus}
                    onChange={handleChange}
                    className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all appearance-none"
                  >
                    {Object.values(LaunchStatus).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-8 p-6 rounded-2xl bg-foreground/5 mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="financeAvailable" checked={formData.financeAvailable} onChange={handleChange} className="w-5 h-5 rounded text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)] bg-background border-[var(--border-brand)]" />
                  <span className="text-sm font-bold">Finance Available</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5 rounded text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)] bg-background border-[var(--border-brand)]" />
                  <span className="text-sm font-bold">Is Active</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-5 h-5 rounded text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)] bg-background border-[var(--border-brand)]" />
                  <span className="text-sm font-bold">Is Featured</span>
                </label>
              </div>

                  <TractorStatePrices
                prices={formData.priceByState || []}
                onChange={(prices) => setFormData(prev => ({ ...prev, priceByState: prices }))}
              />
            </div>
          )}

          {/* TAB 4: MEDIA */}
          {activeTab === 'media' && (
            <div className="flex flex-col gap-8 animate-fade-in">
              <h2 className="text-2xl font-black text-foreground mb-2">Media & Gallery</h2>
              
              <div>
                <MediaUploader 
                  files={mediaFiles}
                  onFilesChange={setMediaFiles}
                  maxFiles={10}
                  accept="image/*"
                  label="Tractor Images"
                  description="Upload up to 10 high-quality images. The first image will be used as the primary thumbnail."
                />
              </div>

              <div className="pt-8 border-t border-[var(--border-subtle)]">
                <h2 className="text-xl font-black text-foreground mb-4">Brochure</h2>
                <MediaUploader 
                  files={brochureFile}
                  onFilesChange={setBrochureFile}
                  maxFiles={1}
                  accept=".pdf"
                  label="Brochure PDF"
                  description="Upload the official brochure PDF."
                />
              </div>
            </div>
          )}

          {/* TAB 5: CONTENT & SEO */}
          {activeTab === 'seo' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h2 className="text-2xl font-black text-foreground mb-2">Content & SEO</h2>
              
              <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Overview HTML</label>
                  <textarea
                    name="overview"
                    value={formData.overview || ''}
                    onChange={handleChange}
                    rows={4}
                    placeholder="<p>Detailed overview of the tractor...</p>"
                    className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Why Buy HTML</label>
                  <textarea
                    name="whyBuy"
                    value={formData.whyBuy || ''}
                    onChange={handleChange}
                    rows={4}
                    placeholder="<p>Reasons to buy this tractor...</p>"
                    className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Expert Review HTML</label>
                  <textarea
                    name="expertReview"
                    value={formData.expertReview || ''}
                    onChange={handleChange}
                    rows={4}
                    placeholder="<p>Expert review content...</p>"
                    className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Pros (Comma Separated)</label>
                  <input
                    type="text"
                    name="pros"
                    value={Array.isArray(formData.pros) ? formData.pros.join(', ') : formData.pros || ''}
                    onChange={handleChange}
                    placeholder="e.g. High fuel efficiency, Great lifting capacity"
                    className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Video URL (YouTube)</label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl || ''}
                    onChange={handleChange}
                    placeholder="https://youtube.com/..."
                    className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-black text-foreground">SEO Metadata</h3>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">SEO Title (Max 60 chars)</label>
                  <input
                    type="text"
                    name="seoTitle"
                    value={formData.seoTitle || ''}
                    onChange={handleChange}
                    maxLength={60}
                    placeholder="Best Mahindra Tractor..."
                    className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">SEO Description (Max 160 chars)</label>
                  <textarea
                    name="seoDescription"
                    value={formData.seoDescription || ''}
                    onChange={handleChange}
                    maxLength={160}
                    rows={2}
                    placeholder="Discover the best..."
                    className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Meta Keywords</label>
                  <input
                    type="text"
                    name="metaKeywords"
                    value={formData.metaKeywords || ''}
                    onChange={handleChange}
                    placeholder="tractor, mahindra, 4wd..."
                    className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}
