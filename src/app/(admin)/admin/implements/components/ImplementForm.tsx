'use client';

import React, { useState, useEffect } from 'react';
import { implementAPI, Implement, ImplementCategory, EquipmentBrand } from '@/lib/api/implements';
import { implementCategoryAPI } from '@/lib/api/implementCategories';
import { equipmentBrandAPI } from '@/lib/api/equipmentBrands';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Upload, FileText, Video, Image as ImageIcon } from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
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
          equipmentBrandAPI.getAllEquipmentBrands(),
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
      const selectedBrand = brands.find((b) => b.id.toString() === formData.brandId.toString());
      const brandStr = selectedBrand ? selectedBrand.name + ' ' : '';
      const slugBase = `${brandStr}${formData.modelName}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData((prev) => ({ ...prev, slug: slugBase }));
    }
  }, [formData.modelName, formData.brandId, isEditing, brands]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
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
      alert(
        error?.response?.data?.message || 'Failed to save implement. Check console for details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-12">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/implements"
          className="bg-foreground/5 hover:bg-foreground/10 rounded-full p-2 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-foreground text-3xl font-black tracking-tight">
            {isEditing ? 'Edit Implement' : 'Add New Implement'}
          </h1>
          <p className="text-muted mt-1 text-sm font-bold">
            {isEditing
              ? 'Update the details of the implement below.'
              : 'Fill in the details to list a new implement.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="glass-panel flex flex-col gap-6 rounded-3xl p-6">
          <h2 className="text-foreground border-foreground/5 border-b pb-2 text-lg font-black">
            Basic Details
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-muted mb-2 block text-xs font-bold tracking-wider uppercase">
                Brand
              </label>
              <select
                name="brandId"
                value={formData.brandId}
                onChange={handleChange}
                className="bg-foreground/5 text-foreground w-full rounded-xl border border-transparent px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:outline-none"
              >
                <option value="">No Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-muted mb-2 block text-xs font-bold tracking-wider uppercase">
                Category *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="bg-foreground/5 text-foreground w-full rounded-xl border border-transparent px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-muted mb-2 block text-xs font-bold tracking-wider uppercase">
                Model Name *
              </label>
              <input
                type="text"
                name="modelName"
                value={formData.modelName}
                onChange={handleChange}
                required
                placeholder="e.g. Rotavator 5000"
                className="bg-foreground/5 text-foreground w-full rounded-xl border border-transparent px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-muted mb-2 block text-xs font-bold tracking-wider uppercase">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="bg-foreground/5 text-foreground w-full rounded-xl border border-transparent px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="glass-panel flex flex-col gap-6 rounded-3xl p-6">
          <h2 className="text-foreground border-foreground/5 border-b pb-2 text-lg font-black">
            Technical Specifications
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-muted mb-2 block text-xs font-bold tracking-wider uppercase">
                Compatible HP Range (Min - Max)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="compatibleHpMin"
                  value={formData.compatibleHpMin}
                  onChange={handleChange}
                  placeholder="Min HP"
                  className="bg-foreground/5 text-foreground w-full rounded-xl border border-transparent px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:outline-none"
                />
                <input
                  type="number"
                  name="compatibleHpMax"
                  value={formData.compatibleHpMax}
                  onChange={handleChange}
                  placeholder="Max HP"
                  className="bg-foreground/5 text-foreground w-full rounded-xl border border-transparent px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-muted mb-2 block text-xs font-bold tracking-wider uppercase">
                Working Width (ft)
              </label>
              <input
                type="number"
                step="0.01"
                name="workingWidthFt"
                value={formData.workingWidthFt}
                onChange={handleChange}
                className="bg-foreground/5 text-foreground w-full rounded-xl border border-transparent px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-muted mb-2 block text-xs font-bold tracking-wider uppercase">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weightKg"
                value={formData.weightKg}
                onChange={handleChange}
                className="bg-foreground/5 text-foreground w-full rounded-xl border border-transparent px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-muted mb-2 block text-xs font-bold tracking-wider uppercase">
                Usage Type
              </label>
              <input
                type="text"
                name="usageType"
                value={formData.usageType}
                onChange={handleChange}
                placeholder="e.g. Land Preparation"
                className="bg-foreground/5 text-foreground w-full rounded-xl border border-transparent px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="glass-panel flex flex-col gap-6 rounded-3xl p-6">
          <h2 className="text-foreground border-foreground/5 border-b pb-2 text-lg font-black">
            Pricing & Status
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-muted mb-2 block text-xs font-bold tracking-wider uppercase">
                Price Range (₹ Min - Max)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="priceMin"
                  value={formData.priceMin}
                  onChange={handleChange}
                  placeholder="Min Price"
                  className="bg-foreground/5 text-foreground w-full rounded-xl border border-transparent px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:outline-none"
                />
                <input
                  type="number"
                  name="priceMax"
                  value={formData.priceMax}
                  onChange={handleChange}
                  placeholder="Max Price"
                  className="bg-foreground/5 text-foreground w-full rounded-xl border border-transparent px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:outline-none"
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
                className="bg-foreground/10 h-5 w-5 rounded border-transparent text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]"
              />
              <label htmlFor="isActive" className="text-foreground text-sm font-bold">
                Active Listing (Visible to Users)
              </label>
            </div>
          </div>
        </div>

        <div className="glass-panel flex flex-col gap-6 rounded-3xl p-6">
          <h2 className="text-foreground border-foreground/5 border-b pb-2 text-lg font-black">
            Description & Media
          </h2>

          <div>
            <label className="text-muted mb-2 block text-xs font-bold tracking-wider uppercase">
              Detailed Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="bg-foreground/5 text-foreground custom-scrollbar w-full resize-none rounded-xl border border-transparent px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:outline-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Brochure Upload */}
            <div className="bg-foreground/[0.01] hover:bg-foreground/[0.03] group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-subtle)] p-6 transition-colors">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileChange(e, setBrochureFile)}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />
              <div className="text-muted flex flex-col items-center gap-2 transition-colors group-hover:text-[var(--color-brand-green)]">
                <FileText size={28} />
                <div className="text-center">
                  <p className="text-foreground text-sm font-bold">Upload Brochure</p>
                  <p className="mt-1 text-[10px] font-medium tracking-wider uppercase">
                    {brochureFile ? brochureFile.name : 'PDF (Max 10MB)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Video Upload */}
            <div className="bg-foreground/[0.01] hover:bg-foreground/[0.03] group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-subtle)] p-6 transition-colors">
              <input
                type="file"
                accept="video/mp4, video/webm"
                onChange={(e) => handleFileChange(e, setVideoFile)}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />
              <div className="text-muted flex flex-col items-center gap-2 transition-colors group-hover:text-[var(--color-brand-orange)]">
                <Video size={28} />
                <div className="text-center">
                  <p className="text-foreground text-sm font-bold">Upload Video</p>
                  <p className="mt-1 text-[10px] font-medium tracking-wider uppercase">
                    {videoFile ? videoFile.name : 'MP4/WebM (Max 50MB)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Video Thumbnail Upload */}
            <div className="bg-foreground/[0.01] hover:bg-foreground/[0.03] group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-subtle)] p-6 transition-colors">
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                onChange={(e) => handleFileChange(e, setThumbnailFile)}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />
              <div className="text-muted flex flex-col items-center gap-2 transition-colors group-hover:text-[var(--color-brand-green)]">
                <ImageIcon size={28} />
                <div className="text-center">
                  <p className="text-foreground text-sm font-bold">Video Thumbnail</p>
                  <p className="mt-1 text-[10px] font-medium tracking-wider uppercase">
                    {thumbnailFile ? thumbnailFile.name : 'JPG/PNG (Max 5MB)'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="spatial-button flex items-center gap-2 rounded-full px-8 py-3 text-sm font-black shadow-lg disabled:opacity-50"
          >
            {loading ? <TractorLoader size={20} /> : <Save size={18} />}
            {isEditing ? 'Save Changes' : 'Create Implement'}
          </button>
        </div>
      </form>
    </div>
  );
}
