'use client';

import React, { useState, useEffect } from 'react';
import { categoryAPI, Category } from '@/lib/api/categories';
import { Plus, Edit2, Trash2, Layers, ChevronRight, ChevronDown, AlignLeft, Info, Hash } from 'lucide-react';
import CategoryModal from './components/CategoryModal';
import Pagination from '@/components/shared/Pagination';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Track which categories are expanded in the tree view
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  // Track which row has its "Deep Analysis" view open
  const [deepExpandedId, setDeepExpandedId] = useState<number | null>(null);

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

  const toggleExpand = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const toggleDeepExpand = (id: number) => {
    setDeepExpandedId(deepExpandedId === id ? null : id);
  };

  const handleEdit = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
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
      const isDeepExpanded = deepExpandedId === category.id;

      rows.push(
        <React.Fragment key={category.id}>
          <tr 
            className={`hover:bg-foreground/5 transition-colors cursor-pointer border-b border-[var(--border-subtle)] last:border-0 ${isDeepExpanded ? 'bg-foreground/5' : ''}`}
            onClick={() => toggleDeepExpand(category.id)}
          >
            <td className="px-6 py-4">
              <div className="flex items-center gap-3" style={{ paddingLeft: `${level * 2}rem` }}>
                {/* Expand/Collapse Tree Button */}
                <div className="w-6 flex items-center justify-center shrink-0">
                  {hasChildren ? (
                    <button 
                      onClick={(e) => toggleExpand(category.id, e)}
                      className="p-1 rounded-md hover:bg-foreground/10 text-muted hover:text-foreground transition-colors"
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  ) : (
                    <div className="w-6" /> // Placeholder for alignment
                  )}
                </div>

                {/* Icon */}
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center p-1 border border-[var(--border-subtle)] shrink-0 shadow-sm">
                  {category.iconUrl ? (
                    <img src={category.iconUrl} alt={category.name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <Layers size={18} className="text-gray-400" />
                  )}
                </div>

                {/* Name and Slug */}
                <div>
                  <div className="font-black text-foreground text-sm flex items-center gap-2">
                    {category.name}
                    {level > 0 && <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-foreground/10 text-muted tracking-wider">Sub</span>}
                  </div>
                  <div className="text-xs text-muted/80 font-bold truncate max-w-[150px] sm:max-w-[200px]" title={category.slug}>{category.slug}</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black tracking-wide bg-foreground/5 text-foreground/80">
                  {category._count?.tractors || 0} Tractors
                </span>
              </div>
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${category.isActive ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' : 'bg-red-500/10 text-red-500'}`}>
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="px-6 py-4 font-bold text-foreground/80">
              #{category.sortOrder}
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-end gap-2">
                <button 
                  onClick={(e) => handleEdit(category, e)}
                  className="p-2 rounded-xl text-foreground/70 hover:text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10 transition-colors"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={(e) => handleDelete(category.id, e)}
                  className="p-2 rounded-xl text-foreground/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>

          {/* DEEP ANALYSIS VIEW */}
          {isDeepExpanded && (
            <tr>
              <td colSpan={5} className="px-0 py-0 bg-foreground/[0.02]">
                <div className="p-6 md:p-8 flex flex-col gap-6 animate-fade-in border-b-2 border-[var(--color-brand-green)]" style={{ paddingLeft: `calc(1.5rem + ${level * 2}rem)` }}>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full whitespace-normal">
                    {/* Description Area */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 text-[var(--color-brand-green)] border-b border-[var(--border-subtle)] pb-2">
                        <AlignLeft size={18} />
                        <h3 className="font-black text-sm uppercase tracking-wide">Category Description</h3>
                      </div>
                      <p className="text-sm text-foreground/80 font-medium leading-relaxed bg-background p-4 rounded-xl border border-[var(--border-subtle)] shadow-sm">
                        {category.description || "No description provided for this category."}
                      </p>
                    </div>

                    {/* Meta Info Area */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 text-[var(--color-brand-orange)] border-b border-[var(--border-subtle)] pb-2">
                        <Info size={18} />
                        <h3 className="font-black text-sm uppercase tracking-wide">Database & Relations</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-background border border-[var(--border-subtle)] p-4 rounded-xl shadow-sm flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase text-muted tracking-wider flex items-center gap-1.5"><Hash size={12}/> DB ID</span>
                          <span className="text-lg font-black text-foreground">#{category.id}</span>
                        </div>
                        <div className="bg-background border border-[var(--border-subtle)] p-4 rounded-xl shadow-sm flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase text-muted tracking-wider flex items-center gap-1.5"><Layers size={12}/> Sub-Categories</span>
                          <span className="text-lg font-black text-foreground">{category._count?.children || 0}</span>
                        </div>
                        <div className="bg-background border border-[var(--border-subtle)] p-4 rounded-xl shadow-sm flex flex-col gap-1 col-span-2">
                          <span className="text-[10px] font-black uppercase text-muted tracking-wider flex items-center gap-1.5"><Hash size={12}/> Parent Category ID</span>
                          <span className="text-lg font-black text-foreground">{category.parentId ? `#${category.parentId}` : 'None (Root Level)'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                      <button 
                        onClick={(e) => handleEdit(category, e)}
                        className="px-6 py-2.5 bg-[var(--color-brand-green)] text-white font-black text-sm uppercase tracking-wider rounded-xl hover:bg-[var(--color-brand-orange)] transition-colors shadow-lg shadow-[var(--color-brand-green)]/20 flex items-center gap-2"
                      >
                        <Edit2 size={16} /> Edit Category Master
                      </button>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </React.Fragment>
      );

      // Render children if expanded
      if (hasChildren && isExpanded) {
        rows = rows.concat(renderCategoryRows(category.children!, level + 1));
      }
    });

    return rows;
  };

  const paginatedCategories = categories.slice((page - 1) * limit, page * limit);

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Tractor Categories</h1>
          <p className="text-sm font-bold text-muted mt-1">Deep analysis & master view of the catalog tree structure.</p>
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
        <p className="text-xs text-muted font-medium ml-2">Click on the arrows to expand tree, click rows for deep analysis.</p>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-foreground/5 text-muted uppercase text-[11px] font-black tracking-wider">
              <tr>
                <th className="px-6 py-4">Category Tree</th>
                <th className="px-6 py-4">Tractors Linked</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Sort Order</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted font-bold">
                    Loading deep category insights...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted font-bold">
                    No categories found. Click "Add New Category" to create one.
                  </td>
                </tr>
              ) : (
                renderCategoryRows(paginatedCategories)
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <Pagination
          page={page}
          limit={limit}
          totalCount={categories.length}
          totalPages={Math.ceil(categories.length / limit)}
          onPageChange={setPage}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
        />
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
