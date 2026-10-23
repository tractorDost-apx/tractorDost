'use client';

import React, { useState, useEffect } from 'react';
import { implementCategoryAPI, ImplementCategory } from '@/lib/api/implementCategories';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  ChevronRight,
  ChevronDown,
  AlignLeft,
  Info,
  Hash,
  Eye,
  X,
} from 'lucide-react';
import ImplementCategoryModal from './components/ImplementCategoryModal';
import Pagination from '@/components/shared/Pagination';

export default function ImplementCategoriesPage() {
  const [categories, setCategories] = useState<ImplementCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Track which categories are expanded in the tree view
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  // Category Details Popup Modal state
  const [detailCategory, setDetailCategory] = useState<ImplementCategory | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ImplementCategory | null>(null);

  // Keyboard accessibility and body scroll locking for Detail Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDetailCategory(null);
    };
    if (detailCategory) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [detailCategory]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await implementCategoryAPI.getImplementCategoryTree();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch implement categories', error);
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

  const handleEdit = (category: ImplementCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      confirm(
        'Are you sure you want to delete this category? (Note: Ensure it has no children or dependencies first)'
      )
    ) {
      try {
        await implementCategoryAPI.deleteImplementCategory(id);
        fetchCategories();
      } catch (error: any) {
        alert(error?.response?.data?.message || 'Failed to delete category.');
      }
    }
  };

  const handleToggleActive = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await implementCategoryAPI.toggleImplementCategoryActive(id);
      fetchCategories();
    } catch (error) {
      alert('Failed to toggle status.');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    fetchCategories();
  };

  // Recursive function to render rows
  const renderCategoryRows = (cats: ImplementCategory[], level = 0): React.ReactNode[] => {
    let rows: React.ReactNode[] = [];

    cats.forEach((category) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedIds.has(category.id);

      rows.push(
        <React.Fragment key={category.id}>
          <tr
            className="hover:bg-[var(--color-brand-green)]/[0.04] group cursor-pointer border-b border-[var(--border-subtle)] transition-colors last:border-0"
            onClick={() => setDetailCategory(category)}
          >
            <td className="px-6 py-4">
              <div className="flex items-center gap-3" style={{ paddingLeft: `${level * 2}rem` }}>
                {/* Expand/Collapse Tree Button */}
                <div className="flex w-6 shrink-0 items-center justify-center">
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(category.id, e)}
                      className="hover:bg-foreground/10 text-muted hover:text-foreground rounded-md p-1 transition-colors cursor-pointer"
                      title={isExpanded ? 'Collapse Sub-categories' : 'Expand Sub-categories'}
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  ) : (
                    <div className="w-6" /> // Placeholder for alignment
                  )}
                </div>

                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-white p-1 shadow-sm">
                  {category.iconUrl ? (
                    <img
                      src={category.iconUrl}
                      alt={category.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Layers size={18} className="text-muted" />
                  )}
                </div>

                {/* Name and Slug */}
                <div>
                  <div className="text-foreground flex items-center gap-2 text-sm font-black">
                    {category.name}
                    {level > 0 && (
                      <span className="bg-foreground/10 text-muted rounded px-1.5 py-0.5 text-[9px] font-black tracking-wider uppercase">
                        Sub
                      </span>
                    )}
                  </div>
                  <div
                    className="text-muted/80 max-w-[150px] truncate text-xs font-bold sm:max-w-[200px]"
                    title={category.slug}
                  >
                    {category.slug}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <span
                onClick={(e) => handleToggleActive(category.id, e)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black tracking-widest uppercase ${category.isActive ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
              >
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="text-foreground/80 px-6 py-4 font-bold">#{category.sortOrder}</td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-end gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetailCategory(category);
                  }}
                  className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-[var(--color-brand-green)]/10 hover:text-[var(--color-brand-green)] cursor-pointer"
                  title="View Category Profile"
                >
                  <Eye size={16} />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleEdit(category, e)}
                  className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-[var(--color-brand-orange)]/10 hover:text-[var(--color-brand-orange)] cursor-pointer"
                  title="Edit Category"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(category.id, e)}
                  className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
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
    <div className="animate-fade-in flex flex-1 h-full w-full flex-col gap-6 pb-2">
      {/* Header section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-black tracking-tight">
            Implement Categories
          </h1>
          <p className="text-muted mt-1 text-sm font-bold">
            Implement catalog taxonomy and hierarchical structure master.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setIsModalOpen(true);
          }}
          className="spatial-button flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm whitespace-nowrap shadow-lg cursor-pointer"
        >
          <Plus size={16} /> Add New Category
        </button>
      </div>

      {/* Stats */}
      <div className="glass-panel flex items-center gap-4 rounded-2xl p-4 text-sm font-bold">
        <div className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)]/10 px-4 py-2 text-[var(--color-brand-green)]">
          <Layers size={18} />
          Total Root Categories: {categories.length}
        </div>
        <p className="text-muted ml-2 text-xs font-medium">
          Click arrows to expand tree branches, or click any row to view complete category profile popup.
        </p>
      </div>

      {/* Table */}
      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-foreground/5 text-muted text-[11px] font-black tracking-wider uppercase">
              <tr>
                <th className="px-6 py-4">Category Tree</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Sort Order</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-muted px-6 py-12 text-center font-bold">
                    Loading deep category insights...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-muted px-6 py-12 text-center font-bold">
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
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      </div>

      {/* Implement Category Detail Profile Modal */}
      {detailCategory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-md animate-fade-in">
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setDetailCategory(null)}
          />

          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-background shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-foreground/[0.02] p-5 sm:p-6">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-white p-1.5 shadow-sm">
                  {detailCategory.iconUrl ? (
                    <img
                      src={detailCategory.iconUrl}
                      alt={detailCategory.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Layers size={22} className="text-[var(--color-brand-green)]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-foreground text-lg sm:text-xl font-black truncate">
                      {detailCategory.name}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase ${
                        detailCategory.isActive
                          ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]'
                          : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {detailCategory.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {detailCategory.parentId ? (
                      <span className="bg-foreground/10 text-muted rounded px-2 py-0.5 text-[10px] font-black tracking-wider uppercase">
                        Sub-Category
                      </span>
                    ) : (
                      <span className="bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded px-2 py-0.5 text-[10px] font-black tracking-wider uppercase">
                        Root Level
                      </span>
                    )}
                  </div>
                  <p className="text-muted text-xs font-bold truncate mt-0.5">
                    Slug: <span className="text-foreground/80 font-mono">{detailCategory.slug}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailCategory(null)}
                className="hover:bg-foreground/5 text-muted hover:text-foreground shrink-0 rounded-full p-2 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Quick Key Metrics */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Sub-Categories
                  </span>
                  <div className="text-[var(--color-brand-green)] text-base font-black mt-1">
                    {detailCategory.children?.length || 0} Sub-categories
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Status
                  </span>
                  <div className="text-foreground text-base font-black mt-1">
                    {detailCategory.isActive ? 'Published' : 'Hidden'}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Display Sort Order
                  </span>
                  <div className="text-foreground text-base font-black mt-1">
                    #{detailCategory.sortOrder ?? 0}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Database Record ID
                  </span>
                  <div className="text-foreground text-base font-black mt-1">
                    #{detailCategory.id}
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-background p-5 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-[var(--color-brand-green)]">
                  <AlignLeft size={16} />
                  <h3 className="text-xs font-black tracking-wider uppercase">
                    Category Description
                  </h3>
                </div>
                <p className="text-foreground/80 text-xs sm:text-sm font-medium leading-relaxed">
                  {detailCategory.description || 'No detailed description provided for this implement category yet.'}
                </p>
              </div>

              {/* Hierarchy & Relations */}
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-background p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-[var(--color-brand-orange)] border-b border-[var(--border-subtle)] pb-2.5">
                  <Info size={16} />
                  <h3 className="text-xs font-black tracking-wider uppercase">
                    Hierarchy & Database Relations
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-3.5">
                    <span className="text-muted text-[10px] font-black tracking-wider uppercase block">
                      Hierarchy Level
                    </span>
                    <span className="text-foreground text-xs sm:text-sm font-bold mt-1 block">
                      {detailCategory.parentId ? `Child Category (Parent ID: #${detailCategory.parentId})` : 'Root Category (Top Level)'}
                    </span>
                  </div>

                  <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-3.5">
                    <span className="text-muted text-[10px] font-black tracking-wider uppercase block">
                      Direct Children
                    </span>
                    <span className="text-foreground text-xs sm:text-sm font-bold mt-1 block">
                      {detailCategory.children?.length ? `${detailCategory.children.length} Sub-categories` : 'None (Leaf Node)'}
                    </span>
                  </div>

                  <div className="col-span-1 sm:col-span-2 rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-3.5">
                    <span className="text-muted text-[10px] font-black tracking-wider uppercase block">
                      Implement Route / URL Slug
                    </span>
                    <span className="text-foreground text-xs sm:text-sm font-mono font-bold mt-1 block">
                      /implements/category/{detailCategory.slug}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-foreground/[0.02] p-4 sm:p-6">
              <button
                type="button"
                onClick={() => setDetailCategory(null)}
                className="hover:bg-foreground/5 text-foreground rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Window
              </button>

              <button
                type="button"
                onClick={() => {
                  const cat = detailCategory;
                  setDetailCategory(null);
                  setSelectedCategory(cat);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black tracking-wider text-white uppercase shadow-[var(--color-brand-green)]/20 shadow-lg transition-colors hover:bg-[var(--color-brand-orange)] cursor-pointer"
              >
                <Edit2 size={14} /> Edit Category Master
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <ImplementCategoryModal
          category={selectedCategory}
          categories={categories} // Pass full tree for parent selection
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
