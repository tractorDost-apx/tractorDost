'use client';

import React, { useState, useEffect } from 'react';
import { usedTractorEnquiryAPI } from '@/lib/api/used-enquiries';
import type { LeadStatus } from '@/types/models/used-listing';
import { EnquiryFilters } from '@/components/admin/used-enquiries/EnquiryFilters';
import { EnquiryTable } from '@/components/admin/used-enquiries/EnquiryTable';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import Pagination from '@/components/shared/Pagination';

export default function AdminUsedEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOption, setSortOption] = useState('createdAt-desc');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 15;

  // Banner messages
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch enquiries when page, tab, search, or sorting changes
  useEffect(() => {
    fetchEnquiries();
  }, [currentPage, activeTab, debouncedSearch, sortOption]);

  const fetchEnquiries = () => {
    setLoading(true);
    const [sortBy, sortOrder] = sortOption.split('-');
    const params: any = {
      page: currentPage,
      limit,
      sortBy,
      sortOrder,
    };

    if (activeTab !== 'ALL') {
      params.status = activeTab;
    }

    if (debouncedSearch.trim() !== '') {
      params.mobile = debouncedSearch.trim();
    }

    usedTractorEnquiryAPI
      .getAllEnquiries(params)
      .then((res: any) => {
        if (res.success && res.data) {
          // Backend wraps results in { data: Enquiry[], meta: { total, page, limit, totalPages } }
          const resData = res.data;
          const enquiriesArray = Array.isArray(resData.data)
            ? resData.data
            : Array.isArray(resData)
              ? resData
              : [];
          setEnquiries(enquiriesArray);

          if (resData.meta) {
            setTotalPages(resData.meta.totalPages || 1);
            setTotalCount(resData.meta.total || enquiriesArray.length);
          } else {
            setTotalPages(1);
            setTotalCount(enquiriesArray.length);
          }
        } else {
          setEnquiries([]);
          setTotalPages(1);
          setTotalCount(0);
          showAlert('error', res.message || 'Failed to fetch enquiries.');
        }
        setLoading(false);
      })
      .catch((err) => {
        setEnquiries([]);
        setLoading(false);
        showAlert('error', 'An unexpected error occurred while fetching enquiries.');
      });
  };

  const showAlert = (type: 'success' | 'error', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSortChange = (option: string) => {
    setSortOption(option);
    setCurrentPage(1);
  };

  // EnquiryRow only offers statuses allowed by the backend transition map
  const updateStatus = (id: number, status: string) => {
    setUpdatingId(id);
    usedTractorEnquiryAPI
      .updateEnquiryStatus(id, status as LeadStatus)
      .then((res: any) => {
        if (res.success) {
          setEnquiries(enquiries.map((e) => (e.id === id ? { ...e, status } : e)));
          showAlert('success', 'Enquiry status updated successfully.');
        } else {
          showAlert('error', res.message || 'Failed to update status.');
        }
        setUpdatingId(null);
      })
      .catch(() => {
        showAlert('error', 'Failed to update status due to a server error.');
        setUpdatingId(null);
      });
  };

  const handleDelete = (id: number) => {
    usedTractorEnquiryAPI
      .deleteEnquiry(id)
      .then((res: any) => {
        if (res && res.success === false) {
          showAlert('error', res.message || 'Failed to delete enquiry.');
        } else {
          setEnquiries(enquiries.filter((e) => e.id !== id));
          setTotalCount((prev) => Math.max(0, prev - 1));
          showAlert('success', 'Enquiry deleted successfully.');
        }
      })
      .catch(() => {
        showAlert('error', 'Failed to delete enquiry.');
      });
  };

  return (
    <div className="animate-fade-in w-full space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-black tracking-tight">
            Used Tractor Enquiries
          </h1>
          <p className="text-muted mt-1 font-medium">
            Manage and advance status leads for used tractor enquiries ({totalCount} total).
          </p>
        </div>
      </div>

      {alertMsg && (
        <div
          className={`flex items-center gap-3 rounded-2xl border p-4 transition-all duration-300 ${
            alertMsg.type === 'success'
              ? 'border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400'
              : 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
          }`}
        >
          {alertMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold">{alertMsg.text}</span>
        </div>
      )}

      <EnquiryFilters
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        sortOption={sortOption}
        setSortOption={handleSortChange}
      />

      <EnquiryTable
        enquiries={enquiries}
        loading={loading}
        updatingId={updatingId}
        onUpdateStatus={updateStatus}
        onDelete={handleDelete}
      />

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="bg-foreground/5 flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] p-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="bg-background hover:bg-foreground/5 flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="text-muted text-sm font-bold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="bg-background hover:bg-foreground/5 flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
