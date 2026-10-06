'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { dealerAPI } from '@/lib/api/dealers';
import { Dealer, DealerType, VerificationStatus } from '@/types/models/dealer';
import { DealerHeader } from './components/DealerHeader';
import { DealerFilters } from './components/DealerFilters';
import { DealerTable } from './components/DealerTable';
import { DealerDetailsDrawer } from './components/DealerDetailsDrawer';
import { CreateDealerModal } from './components/CreateDealerModal';
import { EditDealerModal } from './components/EditDealerModal';
import { DealerModerationModal } from './components/DealerModerationModal';
import { DealerBrandManagementModal } from './components/DealerBrandManagementModal';
import { DealerServiceCenterModal } from './components/DealerServiceCenterModal';
import Pagination from '@/components/shared/Pagination';

export default function AdminDealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [dealerTypeFilter, setDealerTypeFilter] = useState<DealerType | ''>('');
  const [verificationStatusFilter, setVerificationStatusFilter] = useState<VerificationStatus | ''>(
    ''
  );
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // KPI Quick Counts (Calculated or overall)
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [certifiedCount, setCertifiedCount] = useState(0);

  // Modals & Drawers
  const [selectedDealerId, setSelectedDealerId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [moderatingDealer, setModeratingDealer] = useState<Dealer | null>(null);
  const [assigningBrandDealer, setAssigningBrandDealer] = useState<Dealer | null>(null);
  const [serviceCenterDealer, setServiceCenterDealer] = useState<Dealer | null>(null);

  const [error, setError] = useState<string | null>(null);

  const fetchDealers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let isActiveParam: boolean | undefined = undefined;
      if (activeFilter === 'active') isActiveParam = true;
      if (activeFilter === 'inactive') isActiveParam = false;

      const res = await dealerAPI.getAllDealers({
        page,
        limit,
        search: search || undefined,
        state: stateFilter || undefined,
        district: districtFilter || undefined,
        dealerType: dealerTypeFilter || undefined,
        verificationStatus: verificationStatusFilter || undefined,
        isActive: isActiveParam,
      });

      if (res.success && res.data) {
        setDealers(res.data.data || []);
        setTotalCount(res.data.totalCount || 0);
        setTotalPages(res.data.totalPages || 1);

        // Derive metric counts from returned set or page
        const verified = (res.data.data || []).filter(
          (d) => d.verificationStatus === 'VERIFIED'
        ).length;
        const pending = (res.data.data || []).filter(
          (d) => d.verificationStatus === 'PENDING'
        ).length;
        const certified = (res.data.data || []).filter((d) => d.isCertified).length;
        setVerifiedCount(verified);
        setPendingCount(pending);
        setCertifiedCount(certified);
      }
    } catch (err: any) {
      console.error('Error fetching dealers:', err);
      setError(err?.response?.data?.message || 'Failed to fetch dealership partners');
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    search,
    stateFilter,
    districtFilter,
    dealerTypeFilter,
    verificationStatusFilter,
    activeFilter,
  ]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchDealers();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [fetchDealers]);

  const handleResetFilters = () => {
    setSearch('');
    setStateFilter('');
    setDistrictFilter('');
    setDealerTypeFilter('');
    setVerificationStatusFilter('');
    setActiveFilter('all');
    setPage(1);
  };

  const handleOpenEdit = (dealer: Dealer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingDealer(dealer);
  };

  const handleOpenModeration = (dealer: Dealer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setModeratingDealer(dealer);
  };

  const handleOpenAssignBrand = (dealer: Dealer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAssigningBrandDealer(dealer);
  };

  const handleOpenServiceCenter = (dealer: Dealer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setServiceCenterDealer(dealer);
  };

  return (
    <div className="animate-fade-in flex h-full w-full max-w-full flex-col gap-6 overflow-x-hidden pb-12">
      {/* Header section with KPIs */}
      <DealerHeader
        totalCount={totalCount}
        verifiedCount={verifiedCount}
        pendingCount={pendingCount}
        certifiedCount={certifiedCount}
        loading={loading}
        onRefresh={fetchDealers}
        onCreateOpen={() => setIsCreateOpen(true)}
      />

      {/* Error alert banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-bold text-rose-400">
          <AlertCircle size={18} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Search & Filter Control Bar */}
      <DealerFilters
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        stateFilter={stateFilter}
        onStateChange={(val) => {
          setStateFilter(val);
          setPage(1);
        }}
        districtFilter={districtFilter}
        onDistrictChange={(val) => {
          setDistrictFilter(val);
          setPage(1);
        }}
        dealerTypeFilter={dealerTypeFilter}
        onDealerTypeChange={(val) => {
          setDealerTypeFilter(val);
          setPage(1);
        }}
        verificationStatusFilter={verificationStatusFilter}
        onVerificationStatusChange={(val) => {
          setVerificationStatusFilter(val);
          setPage(1);
        }}
        activeFilter={activeFilter}
        onActiveFilterChange={(val) => {
          setActiveFilter(val);
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
      />

      {/* Main Dealer Data Table */}
      <div className="flex flex-1 flex-col gap-4">
        <DealerTable
          dealers={dealers}
          loading={loading}
          onSelectDealer={(dealer) => setSelectedDealerId(dealer.id)}
          onEditDealer={handleOpenEdit}
          onModerateDealer={handleOpenModeration}
          onAssignBrandDealer={handleOpenAssignBrand}
          onManageServiceCenter={handleOpenServiceCenter}
        />

        {/* Pagination controls */}
        <div className="glass-panel rounded-2xl border border-white/5 p-2">
          <Pagination
            page={page}
            limit={limit}
            totalCount={totalCount}
            totalPages={totalPages}
            onPageChange={setPage}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Dealer Details Drawer */}
      {selectedDealerId !== null && (
        <DealerDetailsDrawer
          dealerId={selectedDealerId}
          onClose={() => setSelectedDealerId(null)}
          onOpenEdit={(d) => {
            setSelectedDealerId(null);
            setEditingDealer(d);
          }}
          onOpenModeration={(d) => {
            setSelectedDealerId(null);
            setModeratingDealer(d);
          }}
        />
      )}

      {/* Create Dealer Modal */}
      {isCreateOpen && (
        <CreateDealerModal
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            fetchDealers();
          }}
        />
      )}

      {/* Edit Dealer Modal */}
      {editingDealer && (
        <EditDealerModal
          dealer={editingDealer}
          onClose={() => setEditingDealer(null)}
          onSuccess={() => {
            setEditingDealer(null);
            fetchDealers();
          }}
        />
      )}

      {/* Admin Moderation Modal */}
      {moderatingDealer && (
        <DealerModerationModal
          dealer={moderatingDealer}
          onClose={() => setModeratingDealer(null)}
          onSuccess={() => {
            setModeratingDealer(null);
            fetchDealers();
          }}
        />
      )}

      {/* Assign Brand Modal */}
      {assigningBrandDealer && (
        <DealerBrandManagementModal
          dealer={assigningBrandDealer}
          onClose={() => setAssigningBrandDealer(null)}
          onSuccess={() => {
            setAssigningBrandDealer(null);
            fetchDealers();
          }}
        />
      )}

      {/* Service Center Modal */}
      {serviceCenterDealer && (
        <DealerServiceCenterModal
          dealer={serviceCenterDealer}
          onClose={() => setServiceCenterDealer(null)}
          onSuccess={() => {
            setServiceCenterDealer(null);
            fetchDealers();
          }}
        />
      )}
    </div>
  );
}
