'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import Pagination from '@/components/shared/Pagination';
import { useAuth } from '@/store/AuthContext';
import { useDebounce } from '@/hooks/ui/use-debounce';
import { useEmployeeStats, useEmployees } from '@/hooks/hr/use-employees';
import { useDepartments } from '@/hooks/hr/use-hr-options';
import type {
  EmployeeListItem,
  EmployeeProfile,
  EmployeeSortBy,
  EmployeeStatus,
  SortOrder,
} from '@/types/models/employee';
import { EmployeeHeader } from './components/EmployeeHeader';
import { EmployeeStatsCards } from './components/EmployeeStatsCards';
import { EmployeeFilters, type ManagerFilter } from './components/EmployeeFilters';
import { EmployeeTable } from './components/EmployeeTable';
import { EmployeeDetailsDrawer } from './components/EmployeeDetailsDrawer';
import { EmployeeFormModal } from './components/EmployeeFormModal';
import {
  TerminateEmployeeModal,
  type TerminationTarget,
} from './components/TerminateEmployeeModal';

type FormState = { mode: 'create' } | { mode: 'edit'; employeeId: number } | null;

const DEFAULT_LIMIT = 20; // the backend default for GET /employees/getAll

export default function EmployeesAdminPage() {
  const { user } = useAuth();
  const currentUserId = user?.id;

  // Filters (all applied on the server)
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput.trim(), 400);
  const [status, setStatus] = useState<EmployeeStatus | ''>('');
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [manager, setManager] = useState<ManagerFilter | null>(null);
  const [sortBy, setSortBy] = useState<EmployeeSortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  // Bumped after every write and on Refresh: refetches list, stats, departments and the open drawer
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [formState, setFormState] = useState<FormState>(null);
  const [terminationTarget, setTerminationTarget] = useState<TerminationTarget | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // A new debounced search starts again from page 1
  const [searchForPage, setSearchForPage] = useState(search);
  if (searchForPage !== search) {
    setSearchForPage(search);
    setPage(1);
  }

  const list = useEmployees(
    {
      page,
      limit,
      search: search || undefined,
      status: status || undefined,
      departmentId: departmentId ?? undefined,
      reportingManagerId: manager?.id,
      sortBy,
      sortOrder,
    },
    refreshKey
  );
  const stats = useEmployeeStats(refreshKey);
  const departments = useDepartments(refreshKey);

  const meta = list.data?.meta;
  // After a write the current page can end up past the last one (e.g. terminating the last row of a filtered page)
  if (!list.loading && meta && meta.totalPages > 0 && page > meta.totalPages) {
    setPage(meta.totalPages);
  }

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 6000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const refreshAll = () => setRefreshKey((k) => k + 1);

  const resetFilters = () => {
    setSearchInput('');
    setStatus('');
    setDepartmentId(null);
    setManager(null);
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const withPageReset =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const handleSort = (field: EmployeeSortBy) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder(field === 'createdAt' || field === 'joiningDate' ? 'desc' : 'asc');
    }
    setPage(1);
  };

  const showReports = (target: ManagerFilter) => {
    setManager(target);
    setPage(1);
    setSelectedEmployeeId(null);
  };

  const closeDrawer = useCallback(() => setSelectedEmployeeId(null), []);
  const closeForm = useCallback(() => setFormState(null), []);
  const closeTermination = useCallback(() => setTerminationTarget(null), []);

  const handleFormSuccess = (employee: EmployeeProfile, mode: 'create' | 'edit') => {
    const name = employee.user.fullName ?? employee.employeeCode;
    setFormState(null);
    setSuccessMessage(
      mode === 'create'
        ? `${name} was registered as ${employee.employeeCode}.`
        : `${name}'s details were updated.`
    );
    refreshAll();
  };

  const handleTerminated = (employee: EmployeeProfile) => {
    setTerminationTarget(null);
    setSuccessMessage(
      `${employee.user.fullName ?? employee.employeeCode} was terminated and their login was deactivated.`
    );
    refreshAll();
  };

  const toTerminationTarget = (employee: EmployeeListItem): TerminationTarget => ({
    id: employee.id,
    employeeCode: employee.employeeCode,
    fullName: employee.user.fullName,
    joiningDate: employee.joiningDate,
  });

  const hasFilters = !!search || !!status || departmentId !== null || manager !== null;

  return (
    <div className="animate-fade-in flex h-full w-full max-w-full flex-col gap-5 overflow-x-hidden pb-6">
      <EmployeeHeader
        totalCount={stats.data?.total ?? null}
        loading={list.loading || stats.loading}
        onRefresh={refreshAll}
        onCreateOpen={() => setFormState({ mode: 'create' })}
      />

      {successMessage && (
        <div
          className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-400"
          role="status"
        >
          <CheckCircle2 size={18} className="shrink-0" />
          <p className="flex-1">{successMessage}</p>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="rounded-lg p-1 hover:bg-emerald-500/20"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <EmployeeStatsCards
        stats={stats.data}
        statsLoading={stats.loading}
        statsError={stats.error}
        departments={departments.data}
        activeStatus={status}
        activeDepartmentId={departmentId}
        onStatusSelect={withPageReset(setStatus)}
        onDepartmentSelect={withPageReset(setDepartmentId)}
      />

      <EmployeeFilters
        search={searchInput}
        onSearchChange={setSearchInput}
        status={status}
        onStatusChange={withPageReset(setStatus)}
        departmentId={departmentId}
        onDepartmentChange={withPageReset(setDepartmentId)}
        departments={departments.data}
        departmentsLoading={departments.loading}
        departmentsError={departments.error}
        manager={manager}
        onManagerClear={() => withPageReset(setManager)(null)}
        sortBy={sortBy}
        onSortByChange={withPageReset(setSortBy)}
        sortOrder={sortOrder}
        onSortOrderChange={withPageReset(setSortOrder)}
        onResetFilters={resetFilters}
      />

      <div className="flex flex-1 flex-col gap-4">
        <EmployeeTable
          employees={list.data?.data ?? null}
          loading={list.loading}
          refreshing={list.loading && !!list.data}
          error={list.error}
          onRetry={list.reload}
          currentUserId={currentUserId}
          hasFilters={hasFilters}
          directReportsOf={
            manager && !search && !status && departmentId === null ? manager.label : null
          }
          onClearFilters={resetFilters}
          onCreate={() => setFormState({ mode: 'create' })}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onView={(employee) => setSelectedEmployeeId(employee.id)}
          onEdit={(employee) => setFormState({ mode: 'edit', employeeId: employee.id })}
          onTerminate={(employee) => setTerminationTarget(toTerminationTarget(employee))}
          onShowReports={(employee) =>
            showReports({
              id: employee.id,
              label: `${employee.user.fullName ?? 'Unnamed'} (${employee.employeeCode})`,
            })
          }
        />

        {meta && !list.error && meta.total > 0 && (
          <div className="glass-panel rounded-2xl p-2">
            <Pagination
              page={page}
              limit={limit}
              totalCount={meta.total}
              totalPages={meta.totalPages}
              onPageChange={setPage}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>

      {selectedEmployeeId !== null && (
        <EmployeeDetailsDrawer
          employeeId={selectedEmployeeId}
          refreshKey={refreshKey}
          currentUserId={currentUserId}
          escapeDisabled={formState !== null || terminationTarget !== null}
          onClose={closeDrawer}
          onEdit={(employeeId) => setFormState({ mode: 'edit', employeeId })}
          onTerminate={setTerminationTarget}
          onShowReports={showReports}
        />
      )}

      {formState && (
        <EmployeeFormModal
          key={formState.mode === 'edit' ? `edit-${formState.employeeId}` : 'create'}
          mode={formState.mode}
          employeeId={formState.mode === 'edit' ? formState.employeeId : undefined}
          currentUserId={currentUserId}
          onClose={closeForm}
          onSuccess={handleFormSuccess}
          onDepartmentCreated={departments.reload}
        />
      )}

      {terminationTarget && (
        <TerminateEmployeeModal
          employee={terminationTarget}
          onClose={closeTermination}
          onSuccess={handleTerminated}
        />
      )}
    </div>
  );
}
