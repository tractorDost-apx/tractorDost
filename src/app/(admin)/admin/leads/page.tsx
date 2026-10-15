'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import {
  MessageSquareText,
  UserCheck,
  Download,
  AlertCircle,
  X,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import {
  leadAPI,
  Lead,
  LeadStats,
  GetLeadsParams,
  LeadStatus,
} from '@/lib/api/leads';
import { usersAPI } from '@/lib/api/users';
import { dealerAPI } from '@/lib/api/dealers';
import { brandAPI } from '@/lib/api/brands';

import { LeadStatsCards } from './components/LeadStatsCards';
import { LeadFilters } from './components/LeadFilters';
import { LeadTable } from './components/LeadTable';
import { LeadDetailsDrawer } from './components/LeadDetailsDrawer';
import { BulkAssignModal } from './components/BulkAssignModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { LogCallModal } from './components/LogCallModal';
import { AddNoteModal } from './components/AddNoteModal';
import Pagination from '@/components/shared/Pagination';

export default function AdminLeadsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role?.name === 'ADMIN' || user?.role?.name === 'SUPER_ADMIN';

  // Leads list and pagination state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Stats state
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters state
  const [filters, setFilters] = useState<GetLeadsParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    assignment: 'all',
  });

  // Reference data
  const [agents, setAgents] = useState<{ id: number; fullName: string }[]>([]);
  const [dealers, setDealers] = useState<{ id: number; businessName: string }[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);

  // Selection & Modals
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [drawerLeadId, setDrawerLeadId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  const [deleteTargetLead, setDeleteTargetLead] = useState<Lead | null>(null);
  const [logCallTargetLead, setLogCallTargetLead] = useState<Lead | null>(null);
  const [addNoteTargetLead, setAddNoteTargetLead] = useState<Lead | null>(null);

  const [exporting, setExporting] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Fetch reference data (Agents, Dealers, Brands) once
  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const [usersRes, dealersRes, brandsRes] = await Promise.allSettled([
          usersAPI.getAllUsers({ limit: 100 }),
          dealerAPI.getAllDealers({ limit: 100 }),
          brandAPI.getAllBrands({ limit: 100 }),
        ]);

        if (usersRes.status === 'fulfilled' && usersRes.value.success) {
          const userList = (usersRes.value.data as any)?.data || usersRes.value.data || [];
          // Filter agents and admins
          const staffUsers = userList
            .filter((u: any) => u.role === 'AGENT' || u.role === 'ADMIN' || u.role === 'SUPER_ADMIN')
            .map((u: any) => ({
              id: u.id,
              fullName: u.fullName || u.name || `User #${u.id}`,
            }));
          setAgents(staffUsers);
        }

        if (dealersRes.status === 'fulfilled' && dealersRes.value.success) {
          const dealerList = (dealersRes.value.data as any)?.data || [];
          setDealers(
            dealerList.map((d: any) => ({
              id: d.id,
              businessName: d.businessName,
            }))
          );
        }

        if (brandsRes.status === 'fulfilled' && brandsRes.value.success) {
          const brandList = (brandsRes.value.data as any)?.brands || (brandsRes.value.data as any)?.data || [];
          setBrands(
            brandList.map((b: any) => ({
              id: b.id,
              name: b.name,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch reference data', err);
      }
    };

    fetchReferences();
  }, []);

  // Fetch KPI Stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await leadAPI.getLeadStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch lead stats', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Fetch Leads with current filters
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await leadAPI.getLeads(filters);
      if (res.success && res.data) {
        setLeads(res.data.leads || []);
        setTotalCount(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err: any) {
      console.error('Failed to fetch leads', err);
      setError(err?.response?.data?.message || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchLeads]);

  // Filter updates
  const handleFilterChange = (updated: Partial<GetLeadsParams>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      assignment: 'all',
      search: undefined,
      status: undefined,
      leadType: undefined,
      assignedTo: undefined,
      dealerId: undefined,
      tractorId: undefined,
      interestedBrand: undefined,
      interestedModel: undefined,
      sourcePage: undefined,
      state: undefined,
      district: undefined,
      isDuplicate: undefined,
      followupDue: undefined,
      needsAttention: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
    setSelectedLeadIds([]);
  };

  // Sorting
  const handleSortChange = (field: any) => {
    setFilters((prev) => {
      if (prev.sortBy === field) {
        return { ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc', page: 1 };
      }
      return { ...prev, sortBy: field, sortOrder: 'desc', page: 1 };
    });
  };

  // Bulk Selection
  const handleToggleSelect = (id: number) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map((l) => l.id));
    }
  };

  // Export to Excel
  const handleExport = async () => {
    setExporting(true);
    try {
      await leadAPI.exportLeads(filters);
      showNotification('Leads exported successfully!');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to export leads');
    } finally {
      setExporting(false);
    }
  };

  // Quick inline status change
  const handleQuickStatusChange = async (lead: Lead, newStatus: LeadStatus) => {
    if (lead.status === newStatus) return;
    try {
      await leadAPI.updateLead(lead.id, { status: newStatus });
      showNotification(`Lead #${lead.id} status updated to ${newStatus}`);
      fetchLeads();
      fetchStats();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Status transition not permitted');
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200 ${
            notification.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-950/80 text-emerald-300'
              : 'border-rose-500/30 bg-rose-950/80 text-rose-300'
          }`}
        >
          <div className="text-sm font-bold">{notification.text}</div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-muted hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4a7635]/30 to-amber-500/20 text-[#4a7635] shadow-inner">
              <MessageSquareText size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Lead Management CRM
              </h1>
              <p className="text-xs font-semibold text-muted">
                Track, qualify, assign and advance customer enquiries across all tractor channels.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              fetchLeads();
              fetchStats();
            }}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2 text-xs font-bold text-muted transition-colors hover:bg-foreground/10 hover:text-foreground disabled:opacity-50"
            title="Refresh leads and metrics"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-black text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
          >
            <Download size={14} />
            <span>{exporting ? 'Exporting...' : 'Export XLS'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <LeadStatsCards
        stats={stats}
        loading={statsLoading}
        onRefresh={() => fetchStats()}
      />

      {/* Advanced Filters Panel */}
      <LeadFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onApplyFilters={fetchLeads}
        onExport={handleExport}
        exporting={exporting}
        agents={agents}
        brands={brands}
      />

      {/* Error banner if fetching fails */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-bold text-rose-400">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Leads Table */}
      <LeadTable
        leads={leads}
        loading={loading}
        selectedLeadIds={selectedLeadIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        onViewLead={(l) => {
          setDrawerLeadId(l.id);
          setIsDrawerOpen(true);
        }}
        onQuickStatusChange={handleQuickStatusChange}
        onQuickAssign={(l) => {
          setSelectedLeadIds([l.id]);
          setIsBulkAssignOpen(true);
        }}
        onLogCall={(l) => setLogCallTargetLead(l)}
        onAddNote={(l) => setAddNoteTargetLead(l)}
        onDeleteLead={(l) => setDeleteTargetLead(l)}
        onSortChange={handleSortChange}
        sortBy={filters.sortBy || 'createdAt'}
        sortOrder={filters.sortOrder || 'desc'}
        canDelete={isAdmin}
      />

      {/* Pagination Controls */}
      <Pagination
        page={filters.page || 1}
        limit={filters.limit || 20}
        totalCount={totalCount}
        totalPages={totalPages}
        onPageChange={(page) => handleFilterChange({ page })}
        onLimitChange={(limit) => handleFilterChange({ limit, page: 1 })}
      />

      {/* Floating Bulk Action Bar */}
      {selectedLeadIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-background/95 px-5 py-3 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-bottom-4">
          <span className="text-xs font-black text-foreground">
            {selectedLeadIds.length} lead(s) selected
          </span>

          <div className="h-4 w-px bg-[var(--border-subtle)]" />

          <button
            type="button"
            onClick={() => setIsBulkAssignOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-black text-white hover:bg-sky-500 transition-colors"
          >
            <UserCheck size={14} />
            <span>Assign to Agent</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedLeadIds([])}
            className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-1.5 text-xs font-bold text-muted hover:bg-foreground/10 hover:text-foreground transition-colors"
          >
            Deselect All
          </button>
        </div>
      )}

      {/* Slide-over Lead Details Drawer */}
      <LeadDetailsDrawer
        leadId={drawerLeadId}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setDrawerLeadId(null);
        }}
        onLeadUpdated={() => {
          fetchLeads();
          fetchStats();
        }}
        agents={agents}
        dealers={dealers}
        currentUserId={user?.id}
        isAdmin={isAdmin}
      />

      {/* Bulk Assign Modal */}
      <BulkAssignModal
        isOpen={isBulkAssignOpen}
        onClose={() => setIsBulkAssignOpen(false)}
        selectedLeadIds={selectedLeadIds}
        agents={agents}
        onSuccess={() => {
          showNotification(`Successfully assigned ${selectedLeadIds.length} lead(s)!`);
          setSelectedLeadIds([]);
          fetchLeads();
          fetchStats();
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        lead={deleteTargetLead}
        isOpen={Boolean(deleteTargetLead)}
        onClose={() => setDeleteTargetLead(null)}
        onSuccess={() => {
          showNotification('Lead deleted successfully');
          fetchLeads();
          fetchStats();
        }}
      />

      {/* Standalone Log Call Modal */}
      <LogCallModal
        lead={logCallTargetLead}
        isOpen={Boolean(logCallTargetLead)}
        onClose={() => setLogCallTargetLead(null)}
        onSuccess={() => {
          showNotification('Call logged successfully');
          fetchLeads();
          fetchStats();
        }}
      />

      {/* Standalone Add Note Modal */}
      <AddNoteModal
        lead={addNoteTargetLead}
        isOpen={Boolean(addNoteTargetLead)}
        onClose={() => setAddNoteTargetLead(null)}
        onSuccess={() => {
          showNotification('Note posted successfully');
          fetchLeads();
          fetchStats();
        }}
      />
    </div>
  );
}
