'use client';

import React, { useState, useEffect } from 'react';
import { categoryAPI, Category } from '@/lib/api/categories';
import { Plus, Edit2, Trash2, Layers, ChevronRight, ChevronDown } from 'lucide-react';
import CategoryModal from './components/CategoryModal';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Track which categories are expanded in the tree view
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryAPI.getAllCategories();
      if (response.success) {
        // The API returns a paginated response, so the array is in response.data.data
        const responseData = response.data as any;
        const categoriesArray = Array.isArray(responseData) 
          ? responseData 
          : (responseData?.data || []);
        setCategories(categoriesArray);
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this category? (Note: Ensure it has no children or dependencies first)')) {
      try {
        await categoryAPI.deleteCategory(id);
        fetchCategories();
      } catch (error: any) {
        alert(error?.response?.data?.message || 'Failed to delete category.');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    fetchCategories(); // Refresh list after add/edit
  };

  // Recursive function to render rows
  const renderCategoryRows = (cats: Category[], level = 0): React.ReactNode[] => {
    let rows: React.ReactNode[] = [];

    cats.forEach(category => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedIds.has(category.id);

      rows.push(
        <tr key={category.id} className="hover:bg-foreground/5 transition-colors border-b border-foreground/5 last:border-0">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3" style={{ paddingLeft: `${level * 2}rem` }}>
              {/* Expand/Collapse Button */}
              <div className="w-6 flex items-center justify-center shrink-0">
                {hasChildren ? (
                  <button 
                    onClick={() => toggleExpand(category.id)}
                    className="p-1 rounded-md hover:bg-foreground/10 text-muted hover:text-foreground transition-colors"
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                ) : (
                  <div className="w-6" /> // Placeholder for alignment
                )}
              </div>

              {/* Icon */}
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center p-1 border border-foreground/10 shrink-0">
                {category.iconUrl ? (
                  <img src={category.iconUrl} alt={category.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <Layers size={18} className="text-gray-400" />
                )}
              </div>

              {/* Name and Slug */}
              <div>
                <div className="font-bold text-foreground text-sm flex items-center gap-2">
                  {category.name}
                  {level > 0 && <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-foreground/10 text-muted tracking-wider">Sub</span>}
                </div>
                <div className="text-xs text-muted">{category.slug}</div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 text-xs font-medium text-foreground/70 max-w-[200px] truncate">
            {category.description || '-'}
          </td>
          <td className="px-6 py-4">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black tracking-wide uppercase ${category.isActive ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' : 'bg-red-500/10 text-red-500'}`}>
              {category.isActive ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td className="px-6 py-4 font-bold text-foreground/80">{category.sortOrder}</td>
          <td className="px-6 py-4">
            <div className="flex items-center justify-end gap-2">
              <button 
                onClick={() => handleEdit(category)}
                className="p-2 rounded-xl text-foreground/70 hover:text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10 transition-colors"
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => handleDelete(category.id)}
                className="p-2 rounded-xl text-foreground/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </td>
        </tr>
      );

      // Render children if expanded
      if (hasChildren && isExpanded) {
        rows = rows.concat(renderCategoryRows(category.children!, level + 1));
      }
    });

    return rows;
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Tractor Categories</h1>
          <p className="text-sm font-bold text-muted mt-1">Manage the catalog tree (e.g. Tractors -{'>'} Mini Tractors).</p>
        </div>
        <button 
          onClick={() => { setSelectedCategory(null); setIsModalOpen(true); }}
          className="spatial-button px-5 py-2.5 text-sm rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <Plus size={16} /> Add New Category
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm font-bold glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-2 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] px-4 py-2 rounded-xl">
          <Layers size={18} />
          Total Root Categories: {categories.length}
        </div>
        <p className="text-xs text-muted font-medium ml-2">Click on the arrows to expand sub-categories.</p>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-foreground/5 text-muted uppercase text-[11px] font-black tracking-wider">
              <tr>
                <th className="px-6 py-4">Category Tree</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Sort Order</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted font-bold">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted font-bold">
                    No categories found. Click "Add New Category" to create one.
                  </td>
                </tr>
              ) : (
                renderCategoryRows(categories)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <CategoryModal 
          category={selectedCategory} 
          categories={categories} // Pass full tree for parent selection
          onClose={handleModalClose} 
        />
      )}
    </div>
  );
}
