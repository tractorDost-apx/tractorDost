'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Brand, brandAPI } from '@/lib/api/brands';
import { X, Upload, Check, AlertCircle } from 'lucide-react';

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
        sortOrder: brand.sortOrder.toString(),
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
      if (formData.country) data.append('country', formData.country);
      if (formData.foundedYear) data.append('foundedYear', parseInt(formData.foundedYear).toString());
      if (formData.aboutBrand) data.append('aboutBrand', formData.aboutBrand);
      data.append('isActive', formData.isActive.toString());
      data.append('isFeatured', formData.isFeatured.toString());
      data.append('sortOrder', parseInt(formData.sortOrder).toString());
      if (formData.seoTitle) data.append('seoTitle', formData.seoTitle);
      if (formData.seoDescription) data.append('seoDescription', formData.seoDescription);
      
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 animate-fade-in shadow-2xl border border-foreground/10"
        style={{ background: 'var(--background)' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-foreground">
            {isEditing ? 'Edit Brand' : 'Add New Brand'}
          </h2>
          <button 
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-500">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Logo Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground">Brand Logo</label>
            <div className="flex items-start gap-4">
              <div 
                className="h-24 w-24 rounded-2xl border-2 border-dashed border-foreground/20 flex items-center justify-center bg-foreground/5 overflow-hidden shrink-0 cursor-pointer hover:border-[var(--color-brand-green)] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Preview" className="h-full w-full object-contain p-2 bg-white" />
                ) : (
                  <Upload size={24} className="text-muted" />
                )}
              </div>
              <div className="flex flex-col justify-center gap-2">
                <p className="text-xs font-bold text-muted">Upload a clear, transparent PNG logo.</p>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-foreground/10 hover:bg-foreground/15 text-foreground rounded-lg text-xs font-bold transition-colors w-max"
                >
                  Choose Image
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Slug *</label>
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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Country</label>
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
              placeholder="Write a short description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-foreground/5">
            <label className="flex items-center gap-3 cursor-pointer">
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
              <span className="text-sm font-bold text-foreground">Active Brand</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  name="isFeatured" 
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="peer sr-only" 
                />
                <div className="w-6 h-6 rounded-md border-2 border-foreground/20 peer-checked:bg-[var(--color-brand-green)] peer-checked:border-[var(--color-brand-green)] transition-all flex items-center justify-center">
                  <Check size={14} className="text-white opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all" strokeWidth={4} />
                </div>
              </div>
              <span className="text-sm font-bold text-foreground">Featured (Homepage)</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-foreground/10">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 rounded-xl font-bold text-foreground bg-foreground/5 hover:bg-foreground/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl font-black text-white bg-[var(--color-brand-green)] hover:shadow-[0_10px_20px_rgba(29,191,115,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
        </form>
      </div>
    </div>
  );
}
