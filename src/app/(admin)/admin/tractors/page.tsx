'use client';

import React, { useState, useEffect } from 'react';
import { tractorAPI, Tractor, LaunchStatus, FuelType } from '@/lib/api/tractors';
import { Plus, Search, Edit2, Trash2, Tractor as TractorIcon, Settings2, AlignLeft, Info, Hash, Image as ImageIcon, CheckCircle, BarChart } from 'lucide-react';
import Link from 'next/link';
import Pagination from '@/components/shared/Pagination';


export default function TractorsPage() {
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Track which row has its "Deep Analysis" view open
  const [deepExpandedId, setDeepExpandedId] = useState<number | null>(null);

  const fetchTractors = async () => {
    setLoading(true);
    try {
      const response = await tractorAPI.getAllTractors({ page, limit, search });
      if (response.success) {
        const payload = response.data as any;
        setTractors(payload.tractors || payload.data || []);
        setTotalPages(payload.pagination?.totalPages || payload.totalPages || 1);
        setTotalCount(payload.pagination?.total || payload.totalCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch tractors', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTractors();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, page, limit]);

  const toggleDeepExpand = (id: number) => {
    setDeepExpandedId(deepExpandedId === id ? null : id);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this tractor?')) {
      try {
        await tractorAPI.deleteTractor(id);
        fetchTractors();
      } catch (error) {
        alert('Failed to delete tractor.');
      }
    }
  };

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  const getStatusColor = (status: LaunchStatus) => {
    switch(status) {
      case LaunchStatus.LATEST: return 'bg-blue-500/10 text-blue-500';
      case LaunchStatus.POPULAR: return 'bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)]';
      case LaunchStatus.UPCOMING: return 'bg-purple-500/10 text-purple-500';
      case LaunchStatus.DISCONTINUED: return 'bg-red-500/10 text-red-500';
      default: return 'bg-foreground/10 text-foreground';
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Tractor Catalog</h1>
          <p className="text-sm font-bold text-muted mt-1">Deep analysis & master view of all tractors in the database.</p>
        </div>
        <Link 
          href="/admin/tractors/new"
          className="spatial-button px-5 py-2.5 text-sm rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <Plus size={16} /> Add New Tractor
        </Link>
      </div>

      {/* Stats and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-4 text-sm font-bold w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] px-4 py-2 rounded-xl">
            <TractorIcon size={18} />
            Total Tractors: {totalCount}
          </div>
          <p className="text-xs text-muted font-medium ml-2 hidden sm:block">Click on any row for deep insights.</p>
        </div>

        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted group-focus-within:text-[var(--color-brand-green)] transition-colors">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search tractors by name..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-foreground/5 border border-transparent rounded-full py-2.5 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-foreground/5 text-muted uppercase text-[11px] font-black tracking-wider">
              <tr>
                <th className="px-6 py-4">Tractor Profile</th>
                <th className="px-6 py-4">Power & Engine</th>
                <th className="px-6 py-4">Categories</th>
                <th className="px-6 py-4">Status & Visibility</th>
                <th className="px-6 py-4">Price Range</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted font-bold">
                    Loading deep catalog insights...
                  </td>
                </tr>
              ) : tractors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted font-bold">
                    No tractors found matching your search.
                  </td>
                </tr>
              ) : (
                tractors.map((tractor) => {
                  const isDeepExpanded = deepExpandedId === tractor.id;
                  const primaryImage = tractor.media?.find(m => m.isPrimary) || tractor.media?.[0];

                  return (
                    <React.Fragment key={tractor.id}>
                      <tr 
                        className={`hover:bg-foreground/5 transition-colors cursor-pointer ${isDeepExpanded ? 'bg-foreground/5' : ''}`}
                        onClick={() => toggleDeepExpand(tractor.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center border border-[var(--border-subtle)] shrink-0 shadow-sm overflow-hidden p-1">
                              {primaryImage ? (
                                <img src={primaryImage.url} alt={tractor.modelName} className="w-full h-full object-contain" />
                              ) : (
                                <TractorIcon size={20} className="text-muted" />
                              )}
                            </div>
                            <div>
                              <div className="font-black text-foreground text-base">
                                {tractor.brand?.name} {tractor.modelName}
                              </div>
                              <div className="text-xs font-bold text-muted/80 truncate max-w-[150px] sm:max-w-[200px]" title={tractor.slug}>{tractor.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-black text-foreground/80">{tractor.hp ? `${tractor.hp} HP` : 'HP N/A'}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-muted bg-foreground/5 px-1.5 py-0.5 rounded">{tractor.fuelType}</span>
                              <span className="text-[10px] uppercase tracking-wider text-muted font-black">{tractor.driveType.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {tractor.categories && tractor.categories.length > 0 ? (
                              tractor.categories.map((c, i) => (
                                <span key={i} className="text-[10px] font-bold bg-foreground/5 text-foreground/70 px-2 py-0.5 rounded-md">
                                  {c.category?.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted">None</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2 items-start">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide uppercase ${getStatusColor(tractor.launchStatus)}`}>
                              {tractor.launchStatus}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`inline-block w-2 h-2 rounded-full ${tractor.isActive ? 'bg-[var(--color-brand-green)]' : 'bg-red-500'}`} />
                              <span className="text-[10px] font-black uppercase tracking-wider text-muted">{tractor.isActive ? 'Active' : 'Inactive'}</span>
                              {tractor.isFeatured && (
                                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-brand-orange)]">Featured</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-black text-[var(--color-brand-green)]">
                          {tractor.exShowroomPriceMin ? (
                            <span>{formatPrice(tractor.exShowroomPriceMin)} {tractor.exShowroomPriceMax ? `- ${formatPrice(tractor.exShowroomPriceMax)}` : ''}</span>
                          ) : (
                            <span className="text-muted font-medium">Not Set</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link 
                              href={`/admin/tractors/${tractor.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 rounded-xl text-foreground/70 hover:text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10 transition-colors"
                              title="Edit Tractor"
                            >
                              <Edit2 size={16} />
                            </Link>
                            <button 
                              onClick={(e) => handleDelete(tractor.id, e)}
                              className="p-2 rounded-xl text-foreground/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                              title="Delete Tractor"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* DEEP ANALYSIS VIEW */}
                      {isDeepExpanded && (
                        <tr>
                          <td colSpan={6} className="px-0 py-0 bg-foreground/[0.02]">
                            <div className="p-6 md:p-8 flex flex-col gap-6 animate-fade-in border-b-2 border-[var(--color-brand-green)] shadow-inner">
                              
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full whitespace-normal">
                                
                                {/* SEO & Meta Data */}
                                <div className="md:col-span-5 flex flex-col gap-4">
                                  <div className="flex items-center gap-2 text-[var(--color-brand-orange)] border-b border-[var(--border-subtle)] pb-2">
                                    <BarChart size={18} />
                                    <h3 className="font-black text-sm uppercase tracking-wide">SEO & Engagement</h3>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4 mb-2">
                                    <div className="bg-background border border-[var(--border-subtle)] p-4 rounded-xl shadow-sm flex flex-col gap-1">
                                      <span className="text-[10px] font-black uppercase text-muted tracking-wider">Total Views</span>
                                      <span className="text-lg font-black text-foreground">{tractor.viewsCount || 0}</span>
                                    </div>
                                    <div className="bg-background border border-[var(--border-subtle)] p-4 rounded-xl shadow-sm flex flex-col gap-1">
                                      <span className="text-[10px] font-black uppercase text-muted tracking-wider">Total Leads</span>
                                      <span className="text-lg font-black text-[var(--color-brand-green)]">{tractor.leadsCount || 0}</span>
                                    </div>
                                  </div>

                                  <div className="bg-background border border-[var(--border-subtle)] p-4 rounded-xl shadow-sm flex flex-col gap-3">
                                    <div>
                                      <span className="text-[10px] font-black uppercase text-muted tracking-wider block mb-1">SEO Title</span>
                                      <p className="text-sm font-bold text-foreground">{tractor.seoTitle || "Not specified"}</p>
                                    </div>
                                    <div className="h-px w-full bg-foreground/5" />
                                    <div>
                                      <span className="text-[10px] font-black uppercase text-muted tracking-wider block mb-1">SEO Description</span>
                                      <p className="text-xs text-foreground/70 font-medium">{tractor.seoDescription || "Not specified"}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Quick Specs Highlight */}
                                <div className="md:col-span-7 flex flex-col gap-4">
                                  <div className="flex items-center gap-2 text-[var(--color-brand-green)] border-b border-[var(--border-subtle)] pb-2">
                                    <Settings2 size={18} />
                                    <h3 className="font-black text-sm uppercase tracking-wide">Key Technical Specs</h3>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-background border border-[var(--border-subtle)] p-4 rounded-xl shadow-sm flex flex-col items-center text-center gap-1">
                                      <span className="text-[10px] font-black uppercase text-muted tracking-wider">Engine CC</span>
                                      <span className="text-sm font-black text-foreground">{tractor.spec?.engineCc || '-'}</span>
                                    </div>
                                    <div className="bg-background border border-[var(--border-subtle)] p-4 rounded-xl shadow-sm flex flex-col items-center text-center gap-1">
                                      <span className="text-[10px] font-black uppercase text-muted tracking-wider">Cylinders</span>
                                      <span className="text-sm font-black text-foreground">{tractor.spec?.cylinders || '-'}</span>
                                    </div>
                                    <div className="bg-background border border-[var(--border-subtle)] p-4 rounded-xl shadow-sm flex flex-col items-center text-center gap-1">
                                      <span className="text-[10px] font-black uppercase text-muted tracking-wider">PTO HP</span>
                                      <span className="text-sm font-black text-foreground">{tractor.spec?.ptoHp || '-'}</span>
                                    </div>
                                    <div className="bg-background border border-[var(--border-subtle)] p-4 rounded-xl shadow-sm flex flex-col items-center text-center gap-1">
                                      <span className="text-[10px] font-black uppercase text-muted tracking-wider">Lift Cap.</span>
                                      <span className="text-sm font-black text-foreground">{tractor.spec?.liftingCapacityKg ? `${tractor.spec.liftingCapacityKg} kg` : '-'}</span>
                                    </div>
                                  </div>

                                  <div className="mt-2 flex flex-col gap-3">
                                    <div className="flex items-start gap-2">
                                      <Info size={16} className="text-muted mt-0.5 shrink-0" />
                                      <div>
                                        <span className="text-[10px] font-black uppercase text-muted tracking-wider block">Overview</span>
                                        <p className="text-xs text-foreground/80 font-medium line-clamp-2">{tractor.overview || "No overview provided."}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <CheckCircle size={16} className="text-[var(--color-brand-green)] mt-0.5 shrink-0" />
                                      <div>
                                        <span className="text-[10px] font-black uppercase text-muted tracking-wider block">Why Buy?</span>
                                        <p className="text-xs text-foreground/80 font-medium line-clamp-2">{tractor.whyBuy || "No reason provided."}</p>
                                      </div>
                                    </div>
                                  </div>

                                </div>

                              </div>
                              
                              <div className="flex justify-between items-center pt-4 border-t border-[var(--border-subtle)]">
                                <div className="flex items-center gap-2 text-xs font-bold text-muted">
                                  <ImageIcon size={14} />
                                  {tractor.media?.length || 0} Media File(s) Attached
                                </div>
                                <Link 
                                  href={`/admin/tractors/${tractor.id}`}
                                  className="px-6 py-2.5 bg-[var(--color-brand-green)] text-white font-black text-sm uppercase tracking-wider rounded-xl hover:bg-[var(--color-brand-orange)] transition-colors shadow-lg shadow-[var(--color-brand-green)]/20 flex items-center gap-2"
                                >
                                  <Edit2 size={16} /> Edit Full Profile
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          limit={limit}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={setPage}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
        />
      </div>
    </div>
  );
}
