'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Category, categoryAPI } from '@/lib/api/categories';
import { X, Upload, Check, AlertCircle } from 'lucide-react';

interface CategoryModalProps {
  category: Category | null;
  categories: Category[]; // For parent selection
  onClose: () => void;
}

export default function CategoryModal({ category, categories, onClose }: CategoryModalProps) {
  const isEditing = !!category;
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    isActive: true,
    sortOrder: '0',
  });

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parentId: category.parentId?.toString() || '',
        isActive: category.isActive,
        sortOrder: category.sortOrder.toString(),
      });
      if (category.iconUrl) {
        setIconPreview(category.iconUrl);
      }
    }
  }, [category]);

  // Auto-generate slug from name if not editing
  useEffect(() => {
    if (!isEditing && formData.name) {
      setFormData(prev => ({
        ...prev,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      }));
    }
  }, [formData.name, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
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
      if (formData.description) data.append('description', formData.description);
      if (formData.parentId) data.append('parentId', formData.parentId);
      data.append('isActive', formData.isActive.toString());
      data.append('sortOrder', parseInt(formData.sortOrder).toString());
      
      if (iconFile) {
        data.append('image', iconFile);
      }

      if (isEditing && category) {
        await categoryAPI.updateCategory(category.id, data);
      } else {
        await categoryAPI.createCategory(data);
      }
      
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Helper to flatten categories for the dropdown, avoiding self-referencing if editing
  const renderCategoryOptions = (cats: Category[], level = 0) => {
    let options: React.ReactNode[] = [];
    cats.forEach(c => {
      // Don't allow a category to be its own parent, or a child of its own children (simplified: just exclude self)
      if (isEditing && category && c.id === category.id) return;
      
      options.push(
        <option key={c.id} value={c.id}>
          {'- '.repeat(level)}{c.name}
        </option>
      );
      if (c.children && c.children.length > 0) {
        options = options.concat(renderCategoryOptions(c.children, level + 1));
      }
    });
    return options;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 animate-fade-in shadow-2xl border border-foreground/10"
        style={{ background: 'var(--background)' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-foreground">
            {isEditing ? 'Edit Category' : 'Add New Category'}
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
          
          {/* Icon Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-foreground">Category Icon</label>
            <div className="flex items-start gap-4">
              <div 
                className="h-24 w-24 rounded-2xl border-2 border-dashed border-foreground/20 flex items-center justify-center bg-foreground/5 overflow-hidden shrink-0 cursor-pointer hover:border-[var(--color-brand-green)] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {iconPreview ? (
                  <img src={iconPreview} alt="Preview" className="h-full w-full object-contain p-2" />
                ) : (
                  <Upload size={24} className="text-muted" />
                )}
              </div>
              <div className="flex flex-col justify-center gap-2">
                <p className="text-xs font-bold text-muted">Upload a clear icon representing this category.</p>
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
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Category Name *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                placeholder="e.g. Mini Tractors"
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
                placeholder="e.g. mini-tractors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Parent Category</label>
              <select 
                name="parentId" 
                value={formData.parentId}
                onChange={handleChange}
                className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all appearance-none"
              >
                <option value="">-- None (Root Category) --</option>
                {renderCategoryOptions(categories)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Sort Order</label>
              <input 
                type="number" 
                name="sortOrder" 
                value={formData.sortOrder}
                onChange={handleChange}
                className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                placeholder="e.g. 0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted uppercase tracking-wider">Description</label>
            <textarea 
              name="description" 
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-foreground/5 border border-transparent rounded-xl px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all resize-none"
              placeholder="Short description of this category..."
            />
          </div>

          <div className="p-4 rounded-2xl bg-foreground/5">
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
              <span className="text-sm font-bold text-foreground">Active Category</span>
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
                  {isEditing ? 'Save Changes' : 'Create Category'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
