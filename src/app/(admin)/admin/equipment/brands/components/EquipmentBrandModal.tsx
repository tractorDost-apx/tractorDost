'use client';

import React, { useState, useEffect } from 'react';
import { equipmentBrandAPI, EquipmentBrand } from '@/lib/api/equipmentBrands';
import { X, Upload, Loader2 } from 'lucide-react';

interface EquipmentBrandModalProps {
  brand: EquipmentBrand | null;
  onClose: () => void;
}

export default function EquipmentBrandModal({ brand, onClose }: EquipmentBrandModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    country: '',
    isActive: true,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name,
        slug: brand.slug,
        country: brand.country || '',
        isActive: brand.isActive,
      });
      setLogoPreview(brand.logoUrl || null);
    }
  }, [brand]);

  // Auto-generate slug from name if creating new
  useEffect(() => {
    if (!brand && formData.name) {
      const generatedSlug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, brand]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
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

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('slug', formData.slug);
      if (formData.country) submitData.append('country', formData.country);
      submitData.append('isActive', formData.isActive ? 'true' : 'false');
      
      if (logoFile) {
        submitData.append('logo', logoFile);
      }

      if (brand) {
        await equipmentBrandAPI.updateEquipmentBrand(brand.id, submitData);
      } else {
        await equipmentBrandAPI.createEquipmentBrand(submitData);
      }
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Failed to save brand.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-background border border-[var(--border-subtle)] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)] bg-foreground/[0.02]">
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight">
              {brand ? 'Edit Equipment Brand' : 'Add New Equipment Brand'}
            </h2>
            <p className="text-xs font-bold text-muted mt-1 uppercase tracking-wider">
              {brand ? 'Update existing master data' : 'Create new master record'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-foreground/5 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="brandForm" onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Logo Upload Section */}
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--border-subtle)] rounded-2xl bg-foreground/[0.01] hover:bg-foreground/[0.03] transition-colors relative group cursor-pointer">
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp, image/svg+xml"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              {logoPreview ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-24 w-24 rounded-2xl bg-white p-2 shadow-sm border border-[var(--border-subtle)] flex items-center justify-center relative overflow-hidden group-hover:border-[var(--color-brand-green)] transition-colors">
                    <img src={logoPreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload size={20} className="text-white" />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-muted tracking-wider uppercase">Click to change logo</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-muted group-hover:text-[var(--color-brand-green)] transition-colors">
                  <div className="p-4 bg-foreground/5 rounded-full group-hover:bg-[var(--color-brand-green)]/10 transition-colors">
                    <Upload size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">Upload Brand Logo</p>
                    <p className="text-xs font-medium uppercase tracking-wider mt-1">SVG, PNG, JPG (Max 2MB)</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-muted tracking-wider">Brand Name *</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Lemken"
                  className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:bg-background transition-all"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-muted tracking-wider">Slug *</label>
                <input 
                  type="text" 
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  placeholder="e.g. lemken"
                  className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:bg-background transition-all"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-muted tracking-wider">Country of Origin</label>
                <input 
                  type="text" 
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="e.g. Germany"
                  className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:bg-background transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-foreground/5 rounded-xl border border-transparent hover:border-[var(--border-subtle)] transition-colors">
              <input 
                type="checkbox" 
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 rounded bg-background border-[var(--border-subtle)] text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]"
              />
              <label htmlFor="isActive" className="text-sm font-bold text-foreground cursor-pointer select-none">
                Active & Visible
                <p className="text-[10px] font-medium text-muted uppercase tracking-wider mt-0.5">Show this brand in public listings</p>
              </label>
            </div>
            
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--border-subtle)] bg-foreground/[0.02] flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-sm font-bold text-foreground/70 bg-foreground/5 hover:bg-foreground/10 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="brandForm"
            disabled={loading}
            className="px-8 py-2.5 bg-[var(--color-brand-green)] text-white font-black text-sm uppercase tracking-wider rounded-full hover:bg-[var(--color-brand-orange)] transition-colors shadow-lg shadow-[var(--color-brand-green)]/20 flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {brand ? 'Save Changes' : 'Create Brand'}
          </button>
        </div>
      </div>
    </div>
  );
}
