'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Award, Save, CheckCircle2, Star, Trash2 } from 'lucide-react';
import { brandAPI, Brand } from '@/lib/api/brands';
import { TractorLoader } from '@/components/ui/TractorLoader';

export default function AdminBrandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const brandId = Number(resolvedParams.id);

  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [country, setCountry] = useState('India');
  const [foundedYear, setFoundedYear] = useState<number>(1960);
  const [aboutBrand, setAboutBrand] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadBrand() {
      try {
        setLoading(true);
        const res = await brandAPI.getBrandById(brandId);
        if (res.success && res.data) {
          const b = res.data;
          setBrand(b);
          setName(b.name);
          setCountry(b.country || 'India');
          setFoundedYear(b.foundedYear || 1960);
          setAboutBrand(b.aboutBrand || '');
          setIsFeatured(b.isFeatured);
          setIsActive(b.isActive);
        }
      } catch (err: any) {
        console.error('Failed to load brand:', err);
        setErrorMsg('Brand not found or failed to load.');
      } finally {
        setLoading(false);
      }
    }
    loadBrand();
  }, [brandId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('country', country);
      formData.append('foundedYear', String(foundedYear));
      formData.append('aboutBrand', aboutBrand);
      formData.append('isFeatured', String(isFeatured));
      formData.append('isActive', String(isActive));

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const res = await brandAPI.updateBrand(brandId, formData);
      if (res.success) {
        setSuccessMsg('Brand updated successfully!');
        if (res.data) setBrand(res.data);
      }
    } catch (err: any) {
      console.error('Failed to update brand:', err);
      setErrorMsg(err?.response?.data?.message || 'Failed to update brand.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
        <TractorLoader size={48} />
        <p className="text-muted-foreground mt-3 text-xs font-bold">Loading brand details...</p>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-foreground">Brand Not Found</h2>
        <Link
          href="/admin/brands"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-2 text-xs font-bold text-black"
        >
          <ArrowLeft size={14} /> Back to Brands List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/brands"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Back to Brands
        </Link>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-4 border-b border-border/40 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-white p-2 dark:bg-zinc-900">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.name} className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-2xl font-black text-muted-foreground">{brand.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Edit {brand.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Slug: <span className="font-mono text-lime-400">{brand.slug}</span> | Total Models:{' '}
              {brand.totalModels || 0}
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 rounded-xl border border-lime-400/30 bg-lime-400/10 p-3 text-xs font-bold text-lime-400 flex items-center gap-2">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
              Brand Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-lime-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                Origin Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-lime-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                Founded Year
              </label>
              <input
                type="number"
                value={foundedYear}
                onChange={(e) => setFoundedYear(Number(e.target.value))}
                className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-lime-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
              Update Logo Image (Optional)
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="text-xs text-muted-foreground file:mr-3 file:rounded-xl file:border-0 file:bg-lime-400 file:px-4 file:py-2 file:text-xs file:font-black file:text-black hover:file:bg-lime-300"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
              About Brand
            </label>
            <textarea
              rows={4}
              value={aboutBrand}
              onChange={(e) => setAboutBrand(e.target.value)}
              className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-lime-400 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-6 border-t border-border/40 pt-4 text-xs font-bold text-foreground">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded accent-lime-400"
              />
              <span>Active in Public Catalog</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded accent-amber-500"
              />
              <span>Featured Brand Partner</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/brands')}
              className="rounded-xl border border-border/60 px-6 py-3 text-xs font-bold text-foreground hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-8 py-3 text-xs font-black uppercase text-black hover:bg-lime-300 disabled:opacity-70 shadow-md"
            >
              <Save size={16} /> {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
