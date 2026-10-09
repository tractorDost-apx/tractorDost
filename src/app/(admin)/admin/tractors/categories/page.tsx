'use client';

import React, { useState, useEffect } from 'react';
import { categoryAPI, Category } from '@/lib/api/categories';
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
} from 'lucide-react';
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
          : responseData?.data || [];
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
    if (
      confirm(
        'Are you sure you want to delete this category? (Note: Ensure it has no children or dependencies first)'
      )
    ) {
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

    cats.forEach((category) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedIds.has(category.id);
      const isDeepExpanded = deepExpandedId === category.id;

      rows.push(
        <React.Fragment key={category.id}>
          <tr
            className={`hover:bg-foreground/5 cursor-pointer border-b border-[var(--border-subtle)] transition-colors last:border-0 ${isDeepExpanded ? 'bg-foreground/5' : ''}`}
            onClick={() => toggleDeepExpand(category.id)}
          >
            <td className="px-6 py-4">
              <div className="flex items-center gap-3" style={{ paddingLeft: `${level * 2}rem` }}>
                {/* Expand/Collapse Tree Button */}
                <div className="flex w-6 shrink-0 items-center justify-center">
                  {hasChildren ? (
                    <button
                      onClick={(e) => toggleExpand(category.id, e)}
                      className="hover:bg-foreground/10 text-muted hover:text-foreground rounded-md p-1 transition-colors"
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
              <div className="flex gap-2">
                <span className="bg-foreground/5 text-foreground/80 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black tracking-wide">
                  {category._count?.tractors || 0} Tractors
                </span>
              </div>
            </td>
            <td className="px-6 py-4">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black tracking-widest uppercase ${category.isActive ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' : 'bg-red-500/10 text-red-500'}`}
              >
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="text-foreground/80 px-6 py-4 font-bold">#{category.sortOrder}</td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={(e) => handleEdit(category, e)}
                  className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-[var(--color-brand-orange)]/10 hover:text-[var(--color-brand-orange)]"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={(e) => handleDelete(category.id, e)}
                  className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-red-500/10 hover:text-red-500"
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
              <td colSpan={5} className="bg-foreground/[0.02] px-0 py-0">
                <div
                  className="animate-fade-in flex flex-col gap-6 border-b-2 border-[var(--color-brand-green)] p-6 md:p-8"
                  style={{ paddingLeft: `calc(1.5rem + ${level * 2}rem)` }}
                >
                  <div className="grid w-full grid-cols-1 gap-8 whitespace-normal md:grid-cols-2">
                    {/* Description Area */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-[var(--color-brand-green)]">
                        <AlignLeft size={18} />
                        <h3 className="text-sm font-black tracking-wide uppercase">
                          Category Description
                        </h3>
                      </div>
                      <p className="text-foreground/80 bg-background rounded-xl border border-[var(--border-subtle)] p-4 text-sm leading-relaxed font-medium shadow-sm">
                        {category.description || 'No description provided for this category.'}
                      </p>
                    </div>

                    {/* Meta Info Area */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 text-[var(--color-brand-orange)]">
                        <Info size={18} />
                        <h3 className="text-sm font-black tracking-wide uppercase">
                          Database & Relations
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-background flex flex-col gap-1 rounded-xl border border-[var(--border-subtle)] p-4 shadow-sm">
                          <span className="text-muted flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase">
                            <Hash size={12} /> DB ID
                          </span>
                          <span className="text-foreground text-lg font-black">#{category.id}</span>
                        </div>
                        <div className="bg-background flex flex-col gap-1 rounded-xl border border-[var(--border-subtle)] p-4 shadow-sm">
                          <span className="text-muted flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase">
                            <Layers size={12} /> Sub-Categories
                          </span>
                          <span className="text-foreground text-lg font-black">
                            {category._count?.children || 0}
                          </span>
                        </div>
                        <div className="bg-background col-span-2 flex flex-col gap-1 rounded-xl border border-[var(--border-subtle)] p-4 shadow-sm">
                          <span className="text-muted flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase">
                            <Hash size={12} /> Parent Category ID
                          </span>
                          <span className="text-foreground text-lg font-black">
                            {category.parentId ? `#${category.parentId}` : 'None (Root Level)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={(e) => handleEdit(category, e)}
                      className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-sm font-black tracking-wider text-white uppercase shadow-[var(--color-brand-green)]/20 shadow-lg transition-colors hover:bg-[var(--color-brand-orange)]"
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
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-black tracking-tight">Tractor Categories</h1>
          <p className="text-muted mt-1 text-sm font-bold">
            Deep analysis & master view of the catalog tree structure.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setIsModalOpen(true);
          }}
          className="spatial-button flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm whitespace-nowrap shadow-lg"
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
          Click on the arrows to expand tree, click rows for deep analysis.
        </p>
      </div>

      {/* Table */}
      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-foreground/5 text-muted text-[11px] font-black tracking-wider uppercase">
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
                  <td colSpan={5} className="text-muted px-6 py-12 text-center font-bold">
                    Loading deep category insights...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-muted px-6 py-12 text-center font-bold">
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
