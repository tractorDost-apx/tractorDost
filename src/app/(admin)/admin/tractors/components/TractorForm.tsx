'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tractorAPI, Tractor, LaunchStatus, FuelType, DriveType } from '@/lib/api/tractors';
import { brandAPI, Brand } from '@/lib/api/brands';
import { categoryAPI, Category } from '@/lib/api/categories';
import MediaUploader from '@/components/shared/MediaUploader';
import { Save, X, Info, Settings, IndianRupee, Image as ImageIcon, ChevronRight } from 'lucide-react';

interface TractorFormProps {
  initialData?: Tractor;
  isEdit?: boolean;
}

const TABS = [
  { id: 'basic', label: 'Basic Info', icon: Info },
  { id: 'specs', label: 'Specifications', icon: Settings },
  { id: 'pricing', label: 'Pricing', icon: IndianRupee },
  { id: 'media', label: 'Media', icon: ImageIcon },
];

export default function TractorForm({ initialData, isEdit = false }: TractorFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // State for Form Data
  const [formData, setFormData] = useState<Partial<Tractor>>({
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
  });

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [brochureFile, setBrochureFile] = useState<File[]>([]);

  useEffect(() => {
    fetchDependencies();
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const fetchDependencies = async () => {
    try {
      const [brandRes, catRes] = await Promise.all([
        brandAPI.getAllBrands({ limit: 100 }),
        categoryAPI.getAllCategories()
      ]);
      if (brandRes.success) setBrands(brandRes.data.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (error) {
      console.error("Failed to load dependencies");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
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
    setLoading(true);

    try {
      // In a real implementation, you would append mediaFiles to FormData 
      // along with nested relations for specs and categories.
      // For now, we simulate a JSON save for basic data according to the current API stub.
      
      let res;
      if (isEdit && initialData?.id) {
        res = await tractorAPI.updateTractor(initialData.id, formData);
      } else {
        res = await tractorAPI.createTractor(formData);
      }
      
      if (res.success) {
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive 
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

        <div className="mt-8 pt-4 border-t border-foreground/10 px-2 flex flex-col gap-3">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Brand *</label>
                  <select 
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleChange}
                    required
                    className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all appearance-none"
                  >
                    <option value={0}>Select a brand</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Model Name *</label>
                  <input 
                    type="text" 
                    name="modelName"
                    value={formData.modelName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. YUVO TECH+ 575"
                    className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Slug *</label>
                  <input 
                    type="text" 
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                  />
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

          {/* TAB 2: SPECS (Placeholder for large nested objects) */}
          {activeTab === 'specs' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h2 className="text-2xl font-black text-foreground mb-2">Technical Specifications</h2>
              <div className="p-12 text-center rounded-2xl bg-foreground/5 border-2 border-dashed border-foreground/10">
                <Settings className="mx-auto text-muted mb-4" size={32} />
                <h3 className="text-lg font-bold text-foreground mb-2">Detailed Specs Engine</h3>
                <p className="text-sm text-muted">
                  This section will contain the complex nested form for Engine, Transmission, Hydraulics, Tyres, and Dimensions. 
                  (To be implemented based on exact TractorSpec schema)
                </p>
              </div>
            </div>
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

              <div className="mt-6 flex gap-8 p-6 rounded-2xl bg-foreground/5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="financeAvailable" checked={formData.financeAvailable} onChange={handleChange} className="w-5 h-5 rounded text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)] bg-background border-foreground/20" />
                  <span className="text-sm font-bold">Finance Available</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5 rounded text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)] bg-background border-foreground/20" />
                  <span className="text-sm font-bold">Is Active</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-5 h-5 rounded text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)] bg-background border-foreground/20" />
                  <span className="text-sm font-bold">Is Featured</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA */}
          {activeTab === 'media' && (
            <div className="flex flex-col gap-8 animate-fade-in">
              <div>
                <h2 className="text-2xl font-black text-foreground mb-4">Media Gallery</h2>
                <MediaUploader 
                  files={mediaFiles} 
                  onFilesChange={setMediaFiles} 
                  maxFiles={10} 
                  label="Tractor Images" 
                  description="Upload up to 10 high-quality images of the tractor."
                />
              </div>

              <div className="pt-8 border-t border-foreground/10">
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
          
        </form>
      </div>
    </div>
  );
}
