'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Brand, brandAPI } from '@/lib/api/brands';
import { X, Upload, Check, AlertCircle, FileText, BarChart, Settings2 } from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';

interface BrandModalProps {
  brand: Brand | null;
  onClose: () => void;
}

export default function BrandModal({ brand, onClose }: BrandModalProps) {
  const isEditing = !!brand;
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    country: '',
    foundedYear: '',
    aboutBrand: '',
    isActive: true,
    isFeatured: false,
    sortOrder: '0',
    seoTitle: '',
    seoDescription: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name,
        slug: brand.slug,
        country: brand.country || '',
        foundedYear: brand.foundedYear?.toString() || '',
        aboutBrand: brand.aboutBrand || '',
        isActive: brand.isActive,
        isFeatured: brand.isFeatured,
        sortOrder: brand.sortOrder?.toString() || '0',
        seoTitle: brand.seoTitle || '',
        seoDescription: brand.seoDescription || '',
      });
      if (brand.logoUrl) {
        setLogoPreview(brand.logoUrl);
      }
    }
  }, [brand]);

  // Auto-generate slug from name if not editing
  useEffect(() => {
    if (!isEditing && formData.name) {
      setFormData(prev => ({
        ...prev,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      }));
    }
  }, [formData.name, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('slug', formData.slug);
      data.append('country', formData.country || '');
      data.append('foundedYear', formData.foundedYear ? parseInt(formData.foundedYear).toString() : '');
      data.append('aboutBrand', formData.aboutBrand || '');
      data.append('isActive', formData.isActive.toString());
      data.append('isFeatured', formData.isFeatured.toString());
      data.append('sortOrder', parseInt(formData.sortOrder || '0').toString());
      data.append('seoTitle', formData.seoTitle || '');
      data.append('seoDescription', formData.seoDescription || '');
      
      if (logoFile) {
        data.append('logo', logoFile);
      }

      if (isEditing && brand) {
        await brandAPI.updateBrand(brand.id, data);
      } else {
        await brandAPI.createBrand(data);
      }
      
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 text-foreground mb-4 border-b border-foreground/10 pb-2">
      <Icon size={18} className="text-[var(--color-brand-green)]" />
      <h3 className="font-black text-sm uppercase tracking-wider">{title}</h3>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl animate-fade-in shadow-2xl border border-foreground/10 overflow-hidden"
        style={{ background: 'var(--background)' }}
      >
        {/* Sticky Header */}
        <div className="px-6 py-5 border-b border-foreground/10 flex justify-between items-center bg-background shrink-0 z-10">
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            {isEditing ? 'Edit Brand Master' : 'Create New Brand'}
          </h2>
          <button 
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-6 md:p-8 flex-1">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-500">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form id="brandForm" onSubmit={handleSubmit} className="flex flex-col gap-10">
            
            {/* SECTION 1: Identity */}
            <section>
              <SectionTitle icon={FileText} title="Brand Identity" />
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Logo Upload */}
                <div className="md:col-span-4 flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Brand Logo</label>
                  <div 
                    className="aspect-square w-full rounded-2xl border-2 border-dashed border-foreground/20 flex flex-col items-center justify-center bg-foreground/5 overflow-hidden cursor-pointer hover:border-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/5 transition-colors group relative"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {logoPreview ? (
                      <>
                        <img src={logoPreview} alt="Preview" className="h-full w-full object-contain p-4 bg-white" />
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload size={24} className="text-white mb-2" />
                          <span className="text-white text-xs font-bold">Change Logo</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-muted group-hover:text-[var(--color-brand-green)] transition-colors p-6 text-center">
                        <Upload size={32} />
                        <span className="text-xs font-bold leading-relaxed">Click to upload high-res transparent PNG</span>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                {/* Identity Fields */}
                <div className="md:col-span-8 flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider">Brand Name *</label>
                      <input 
                        type="text" 
                        name="name" 
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                        placeholder="e.g. Mahindra"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider">URL Slug *</label>
                      <input 
                        type="text" 
                        name="slug" 
                        value={formData.slug}
                        onChange={handleChange}
                        required
                        className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                        placeholder="e.g. mahindra"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider">Country of Origin</label>
                      <input 
                        type="text" 
                        name="country" 
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                        placeholder="e.g. India"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted uppercase tracking-wider">Founded Year</label>
                      <input 
                        type="number" 
                        name="foundedYear" 
                        value={formData.foundedYear}
                        onChange={handleChange}
                        className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                        placeholder="e.g. 1945"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider">About Brand</label>
                    <textarea 
                      name="aboutBrand" 
                      value={formData.aboutBrand}
                      onChange={handleChange}
                      rows={4}
                      className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all resize-none"
                      placeholder="Write a rich description about the brand's history and legacy..."
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: SEO */}
            <section>
              <SectionTitle icon={BarChart} title="SEO & Discovery" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-foreground/[0.02] p-6 rounded-2xl border border-foreground/5">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">SEO Title (Max 60 chars)</label>
                  <input 
                    type="text" 
                    name="seoTitle" 
                    value={formData.seoTitle}
                    onChange={handleChange}
                    maxLength={60}
                    className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                    placeholder="e.g. Mahindra Tractors - Best Price & Specs | TractorDost"
                  />
                  <div className="text-[10px] text-right font-bold text-muted mt-1">{formData.seoTitle.length}/60</div>
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">SEO Description (Max 160 chars)</label>
                  <textarea 
                    name="seoDescription" 
                    value={formData.seoDescription}
                    onChange={handleChange}
                    maxLength={160}
                    rows={2}
                    className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all resize-none"
                    placeholder="Discover all Mahindra tractor models, specifications, reviews, and latest on-road prices in India..."
                  />
                  <div className="text-[10px] text-right font-bold text-muted mt-1">{formData.seoDescription.length}/160</div>
                </div>
              </div>
            </section>

            {/* SECTION 3: Settings */}
            <section>
              <SectionTitle icon={Settings2} title="Visibility & Settings" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Sort Order (Priority)</label>
                  <input 
                    type="number" 
                    name="sortOrder" 
                    value={formData.sortOrder}
                    onChange={handleChange}
                    className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                    placeholder="0"
                  />
                </div>

                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-foreground/5 border border-transparent hover:border-[var(--color-brand-green)]/30 transition-colors">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        name="isActive" 
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="peer sr-only" 
                      />
                      <div className="w-6 h-6 rounded-md border-2 border-foreground/20 peer-checked:bg-[var(--color-brand-green)] peer-checked:border-[var(--color-brand-green)] transition-all flex items-center justify-center">
                        <Check size={14} className="text-white opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all" strokeWidth={4} />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">Active Status</span>
                      <span className="text-[10px] text-muted">Visible on frontend</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-foreground/5 border border-transparent hover:border-[var(--color-brand-orange)]/30 transition-colors">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        name="isFeatured" 
                        checked={formData.isFeatured}
                        onChange={handleChange}
                        className="peer sr-only" 
                      />
                      <div className="w-6 h-6 rounded-md border-2 border-foreground/20 peer-checked:bg-[var(--color-brand-orange)] peer-checked:border-[var(--color-brand-orange)] transition-all flex items-center justify-center">
                        <Check size={14} className="text-white opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all" strokeWidth={4} />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">Featured Brand</span>
                      <span className="text-[10px] text-muted">Showcase on homepage</span>
                    </div>
                  </label>
                </div>

              </div>
            </section>
            
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t border-foreground/10 bg-background shrink-0 flex justify-end gap-3 z-10">
          <button 
            type="button" 
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl font-bold text-foreground bg-foreground/5 hover:bg-foreground/10 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="brandForm"
            disabled={loading}
            className="px-8 py-2.5 rounded-xl font-black text-white bg-[var(--color-brand-green)] hover:shadow-[0_10px_20px_rgba(29,191,115,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none flex items-center gap-2"
          >
            {loading ? (
              <>
                <TractorLoader size={16} className="text-white" />
                Saving...
              </>
            ) : (
              <>
                <Check size={18} />
                {isEditing ? 'Save Changes' : 'Create Brand'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
