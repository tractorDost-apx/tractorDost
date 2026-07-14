'use client';

import React, { useState, useEffect } from 'react';
import { implementCategoryAPI, ImplementCategory } from '@/lib/api/implementCategories';
import { X, Upload, Layers, ChevronDown } from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';

interface ImplementCategoryModalProps {
  category: ImplementCategory | null;
  categories: ImplementCategory[]; // The full tree for parent selection
  onClose: () => void;
}

export default function ImplementCategoryModal({ category, categories, onClose }: ImplementCategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    sortOrder: '0',
    isActive: true,
  });
  
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parentId: category.parentId ? String(category.parentId) : '',
        sortOrder: String(category.sortOrder),
        isActive: category.isActive,
      });
      setIconPreview(category.iconUrl || null);
    }
  }, [category]);

  // Auto-generate slug from name if creating new
  useEffect(() => {
    if (!category && formData.name) {
      const generatedSlug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('slug', formData.slug);
      
      if (formData.description) {
        submitData.append('description', formData.description);
      }
      
      if (formData.parentId) {
        submitData.append('parentId', formData.parentId);
      }
      
      submitData.append('sortOrder', formData.sortOrder);
      submitData.append('isActive', formData.isActive ? 'true' : 'false');
      
      if (iconFile) {
        submitData.append('icon', iconFile);
      }

      if (category) {
        await implementCategoryAPI.updateImplementCategory(category.id, submitData);
      } else {
        await implementCategoryAPI.createImplementCategory(submitData);
      }
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Failed to save category.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to flatten categories for the dropdown, avoiding self as parent
  const renderCategoryOptions = (cats: ImplementCategory[], level = 0): React.ReactNode[] => {
    let options: React.ReactNode[] = [];
    cats.forEach(cat => {
      // Don't allow selecting itself or its children as parent
      if (category && cat.id === category.id) return;
      
      options.push(
        <option key={cat.id} value={cat.id}>
          {'\u00A0'.repeat(level * 4)} {level > 0 ? '↳ ' : ''}{cat.name}
        </option>
      );
      
      if (cat.children && cat.children.length > 0) {
        options = options.concat(renderCategoryOptions(cat.children, level + 1));
      }
    });
    return options;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-background border border-[var(--border-subtle)] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)] bg-foreground/[0.02]">
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight">
              {category ? 'Edit Implement Category' : 'Add New Implement Category'}
            </h2>
            <p className="text-xs font-bold text-muted mt-1 uppercase tracking-wider">
              {category ? 'Update existing master data' : 'Create new master record'}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 bg-foreground/5 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="categoryForm" onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Icon Upload Section */}
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--border-subtle)] rounded-2xl bg-foreground/[0.01] hover:bg-foreground/[0.03] transition-colors relative group cursor-pointer">
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp, image/svg+xml"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              {iconPreview ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-24 w-24 rounded-2xl bg-white p-2 shadow-sm border border-[var(--border-subtle)] flex items-center justify-center relative overflow-hidden group-hover:border-[var(--color-brand-green)] transition-colors">
                    <img src={iconPreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload size={20} className="text-white" />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-muted tracking-wider uppercase">Click to change icon</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-muted group-hover:text-[var(--color-brand-green)] transition-colors">
                  <div className="p-4 bg-foreground/5 rounded-full group-hover:bg-[var(--color-brand-green)]/10 transition-colors">
                    <Layers size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">Upload Category Icon</p>
                    <p className="text-xs font-medium uppercase tracking-wider mt-1">SVG, PNG, JPG (Max 2MB)</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-muted tracking-wider">Category Name *</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Cultivators"
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
                  placeholder="e.g. cultivators"
                  className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:bg-background transition-all"
                />
              </div>
              
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-muted tracking-wider">Parent Category</label>
                <div className="relative">
                  <select
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleChange}
                    className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:bg-background transition-all appearance-none"
                  >
                    <option value="">None (Root Category)</option>
                    {renderCategoryOptions(categories)}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-muted">
                    <ChevronDown size={16} />
                  </div>
                </div>
                <p className="text-[10px] font-medium text-muted mt-0.5 ml-1">Leave empty to make this a top-level category</p>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-muted tracking-wider">Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of this implement category..."
                  rows={3}
                  className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:bg-background transition-all resize-none custom-scrollbar"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-muted tracking-wider">Sort Order *</label>
                <input 
                  type="number" 
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:bg-background transition-all"
                />
                <p className="text-[10px] font-medium text-muted mt-0.5 ml-1">Lower numbers appear first</p>
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
                <p className="text-[10px] font-medium text-muted uppercase tracking-wider mt-0.5">Show this category in public menus and listings</p>
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
            form="categoryForm"
            disabled={loading}
            className="px-8 py-2.5 bg-[var(--color-brand-green)] text-white font-black text-sm uppercase tracking-wider rounded-full hover:bg-[var(--color-brand-orange)] transition-colors shadow-lg shadow-[var(--color-brand-green)]/20 flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading && <TractorLoader size={20} />}
            {category ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </div>
    </div>
  );
}
