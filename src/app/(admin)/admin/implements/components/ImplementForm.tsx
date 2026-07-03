'use client';

import React, { useState, useEffect } from 'react';
import { implementAPI, Implement, ImplementCategory, EquipmentBrand } from '@/lib/api/implements';
import { useRouter } from 'next/navigation';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
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
    brochureUrl: initialData?.brochureUrl || '',
    videoUrl: initialData?.videoUrl || '',
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
    isActive: initialData?.isActive ?? true,
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          implementAPI.getAllImplementCategories(),
          implementAPI.getAllEquipmentBrands()
        ]);
        if (catRes.success) {
          // Some APIs return paginated, some don't. Assuming standard response format:
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up empty strings to undefined or null equivalent (Zod handles undefined properly for optionals)
      const submitData: any = { ...formData };
      ['brandId', 'compatibleHpMin', 'compatibleHpMax', 'workingWidthFt', 'weightKg', 'priceMin', 'priceMax'].forEach(field => {
        if (submitData[field] === '') delete submitData[field];
        else submitData[field] = Number(submitData[field]);
      });

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
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Brand *</label>
              <select
                name="brandId"
                value={formData.brandId}
                onChange={handleChange}
                className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30"
              >
                <option value="">Select Brand</option>
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
              className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30 resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Brochure URL</label>
              <input
                type="url"
                name="brochureUrl"
                value={formData.brochureUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Video URL</label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
                className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30"
              />
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
