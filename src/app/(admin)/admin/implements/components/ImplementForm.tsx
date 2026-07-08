'use client';

import React, { useState, useEffect } from 'react';
import { implementAPI, Implement, ImplementCategory, EquipmentBrand } from '@/lib/api/implements';
import { implementCategoryAPI } from '@/lib/api/implementCategories';
import { equipmentBrandAPI } from '@/lib/api/equipmentBrands';
import { useRouter } from 'next/navigation';
import { Save, Loader2, ArrowLeft, Upload, FileText, Video, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface ImplementFormProps {
  initialData?: Implement;
  isEditing?: boolean;
}

export default function ImplementForm({ initialData, isEditing = false }: ImplementFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ImplementCategory[]>([]);
  const [brands, setBrands] = useState<EquipmentBrand[]>([]);

  const [formData, setFormData] = useState({
    categoryId: initialData?.categoryId || '',
    brandId: initialData?.brandId || '',
    modelName: initialData?.modelName || '',
    slug: initialData?.slug || '',
    compatibleHpMin: initialData?.compatibleHpMin || '',
    compatibleHpMax: initialData?.compatibleHpMax || '',
    workingWidthFt: initialData?.workingWidthFt || '',
    weightKg: initialData?.weightKg || '',
    usageType: initialData?.usageType || '',
    priceMin: initialData?.priceMin || '',
    priceMax: initialData?.priceMax || '',
    description: initialData?.description || '',
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
    isActive: initialData?.isActive ?? true,
  });

  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          implementCategoryAPI.getAllImplementCategories(),
          equipmentBrandAPI.getAllEquipmentBrands()
        ]);
        if (catRes.success) {
          const payload = catRes.data as any;
          setCategories(payload.data || payload || []);
        }
        if (brandRes.success) {
          const payload = brandRes.data as any;
          setBrands(payload.data || payload || []);
        }
      } catch (error) {
        console.error('Failed to fetch metadata:', error);
      }
    };
    fetchMetadata();
  }, []);

  // Auto-generate slug from modelName and brand if not editing
  useEffect(() => {
    if (!isEditing && formData.modelName) {
      const selectedBrand = brands.find(b => b.id.toString() === formData.brandId.toString());
      const brandStr = selectedBrand ? selectedBrand.name + ' ' : '';
      const slugBase = `${brandStr}${formData.modelName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, slug: slugBase }));
    }
  }, [formData.modelName, formData.brandId, isEditing, brands]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Append string data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          submitData.append(key, String(value));
        }
      });

      // Append files
      if (brochureFile) submitData.append('brochure', brochureFile);
      if (videoFile) submitData.append('video', videoFile);
      if (thumbnailFile) submitData.append('videoThumbnail', thumbnailFile);

      if (isEditing && initialData) {
        await implementAPI.updateImplement(initialData.id, submitData);
        alert('Implement updated successfully');
      } else {
        await implementAPI.createImplement(submitData);
        alert('Implement created successfully');
      }
      router.push('/admin/implements');
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Failed to save implement. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/implements" 
          className="p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {isEditing ? 'Edit Implement' : 'Add New Implement'}
          </h1>
          <p className="text-sm font-bold text-muted mt-1">
            {isEditing ? 'Update the details of the implement below.' : 'Fill in the details to list a new implement.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="glass-panel p-6 rounded-3xl flex flex-col gap-6">
          <h2 className="text-lg font-black text-foreground border-b border-foreground/5 pb-2">Basic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Brand</label>
              <select
                name="brandId"
                value={formData.brandId}
                onChange={handleChange}
                className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30"
              >
                <option value="">No Brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Category *</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30"
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Model Name *</label>
              <input
                type="text"
                name="modelName"
                value={formData.modelName}
                onChange={handleChange}
                required
                placeholder="e.g. Rotavator 5000"
                className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Slug *</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30"
              />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex flex-col gap-6">
          <h2 className="text-lg font-black text-foreground border-b border-foreground/5 pb-2">Technical Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Compatible HP Range (Min - Max)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="compatibleHpMin"
                  value={formData.compatibleHpMin}
                  onChange={handleChange}
                  placeholder="Min HP"
                  className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30"
                />
                <input
                  type="number"
                  name="compatibleHpMax"
                  value={formData.compatibleHpMax}
                  onChange={handleChange}
                  placeholder="Max HP"
                  className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Working Width (ft)</label>
              <input
                type="number"
                step="0.01"
                name="workingWidthFt"
                value={formData.workingWidthFt}
                onChange={handleChange}
                className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Weight (kg)</label>
              <input
                type="number"
                name="weightKg"
                value={formData.weightKg}
                onChange={handleChange}
                className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Usage Type</label>
              <input
                type="text"
                name="usageType"
                value={formData.usageType}
                onChange={handleChange}
                placeholder="e.g. Land Preparation"
                className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30"
              />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex flex-col gap-6">
          <h2 className="text-lg font-black text-foreground border-b border-foreground/5 pb-2">Pricing & Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Price Range (₹ Min - Max)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="priceMin"
                  value={formData.priceMin}
                  onChange={handleChange}
                  placeholder="Min Price"
                  className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30"
                />
                <input
                  type="number"
                  name="priceMax"
                  value={formData.priceMax}
                  onChange={handleChange}
                  placeholder="Max Price"
                  className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 rounded bg-foreground/10 border-transparent text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]"
              />
              <label htmlFor="isActive" className="text-sm font-bold text-foreground">
                Active Listing (Visible to Users)
              </label>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex flex-col gap-6">
          <h2 className="text-lg font-black text-foreground border-b border-foreground/5 pb-2">Description & Media</h2>
          
          <div>
            <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Detailed Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30 resize-none custom-scrollbar"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Brochure Upload */}
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--border-subtle)] rounded-2xl bg-foreground/[0.01] hover:bg-foreground/[0.03] transition-colors relative cursor-pointer group">
              <input 
                type="file" 
                accept="application/pdf"
                onChange={(e) => handleFileChange(e, setBrochureFile)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center gap-2 text-muted group-hover:text-[var(--color-brand-green)] transition-colors">
                <FileText size={28} />
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">Upload Brochure</p>
                  <p className="text-[10px] font-medium uppercase tracking-wider mt-1">{brochureFile ? brochureFile.name : 'PDF (Max 10MB)'}</p>
                </div>
              </div>
            </div>

            {/* Video Upload */}
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--border-subtle)] rounded-2xl bg-foreground/[0.01] hover:bg-foreground/[0.03] transition-colors relative cursor-pointer group">
              <input 
                type="file" 
                accept="video/mp4, video/webm"
                onChange={(e) => handleFileChange(e, setVideoFile)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center gap-2 text-muted group-hover:text-[var(--color-brand-orange)] transition-colors">
                <Video size={28} />
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">Upload Video</p>
                  <p className="text-[10px] font-medium uppercase tracking-wider mt-1">{videoFile ? videoFile.name : 'MP4/WebM (Max 50MB)'}</p>
                </div>
              </div>
            </div>

            {/* Video Thumbnail Upload */}
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--border-subtle)] rounded-2xl bg-foreground/[0.01] hover:bg-foreground/[0.03] transition-colors relative cursor-pointer group">
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp"
                onChange={(e) => handleFileChange(e, setThumbnailFile)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center gap-2 text-muted group-hover:text-[var(--color-brand-green)] transition-colors">
                <ImageIcon size={28} />
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">Video Thumbnail</p>
                  <p className="text-[10px] font-medium uppercase tracking-wider mt-1">{thumbnailFile ? thumbnailFile.name : 'JPG/PNG (Max 5MB)'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="spatial-button px-8 py-3 rounded-full text-sm font-black shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isEditing ? 'Save Changes' : 'Create Implement'}
          </button>
        </div>
      </form>
    </div>
  );
}
