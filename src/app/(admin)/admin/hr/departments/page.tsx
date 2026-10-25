'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import Pagination from '@/components/shared/Pagination';
import { useDebounce } from '@/hooks/ui/use-debounce';
import { useDepartmentList, useDepartmentStats } from '@/hooks/hr/use-departments';
import type { Department } from '@/types/models/employee';
import { DepartmentHeader } from './components/DepartmentHeader';
import { DepartmentStatsCards } from './components/DepartmentStatsCards';
import { DepartmentFilters } from './components/DepartmentFilters';
import { DepartmentTable } from './components/DepartmentTable';
import { DepartmentFormModal } from './components/DepartmentFormModal';
import { DeleteDepartmentModal } from './components/DeleteDepartmentModal';

type FormState = { mode: 'create' } | { mode: 'edit'; department: Department };

const DEFAULT_LIMIT = 20;

export default function DepartmentsAdminPage() {
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput.trim(), 400);
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [refreshKey, setRefreshKey] = useState(0);

  const [formState, setFormState] = useState<FormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset page when search changes
  const [searchForPage, setSearchForPage] = useState(search);
  if (searchForPage !== search) {
    setSearchForPage(search);
    setPage(1);
  }

  const list = useDepartmentList(
    { page, limit, search: search || undefined, isActive },
    refreshKey
  );
  const stats = useDepartmentStats(refreshKey);

  const meta = list.data?.meta;
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
    setIsActive(undefined);
    setPage(1);
  };

  const withPageReset =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const closeForm = useCallback(() => setFormState(null), []);
  const closeDelete = useCallback(() => setDeleteTarget(null), []);

  const handleFormSuccess = (department: Department, mode: 'create' | 'edit') => {
    setFormState(null);
    setSuccessMessage(
      mode === 'create'
        ? `"${department.name}" was created successfully.`
        : `"${department.name}" was updated successfully.`
    );
    refreshAll();
  };

  const handleDeleteSuccess = (department: Department) => {
    setDeleteTarget(null);
    setSuccessMessage(`"${department.name}" was deleted.`);
    refreshAll();
  };

  const hasFilters = !!search || isActive !== undefined;

  // Names for duplicate-check in the form
  const existingNames = (list.data?.departments ?? []).map((d) => d.name);

  return (
    <div className="animate-fade-in flex h-full w-full max-w-full flex-col gap-5 overflow-x-hidden pb-6">
      <DepartmentHeader
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

      <DepartmentStatsCards
        stats={stats.data}
        statsLoading={stats.loading}
        statsError={stats.error}
        activeFilter={isActive}
        onFilterChange={withPageReset(setIsActive)}
      />

      <DepartmentFilters
        search={searchInput}
        onSearchChange={setSearchInput}
        isActive={isActive}
        onIsActiveChange={withPageReset(setIsActive)}
        onResetFilters={resetFilters}
      />

      <div className="flex flex-1 flex-col gap-4">
        <DepartmentTable
          departments={list.data?.departments ?? null}
          loading={list.loading}
          refreshing={list.loading && !!list.data}
          error={list.error}
          onRetry={list.reload}
          hasFilters={hasFilters}
          onClearFilters={resetFilters}
          onCreate={() => setFormState({ mode: 'create' })}
          onEdit={(dept) => setFormState({ mode: 'edit', department: dept })}
          onDelete={setDeleteTarget}
        />

        {meta && !list.error && meta.totalItems > 0 && (
          <div className="glass-panel rounded-2xl p-2">
            <Pagination
              page={page}
              limit={limit}
              totalCount={meta.totalItems}
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

      {formState && (
        <DepartmentFormModal
          key={formState.mode === 'edit' ? `edit-${formState.department.id}` : 'create'}
          department={formState.mode === 'edit' ? formState.department : null}
          existingNames={existingNames}
          onClose={closeForm}
          onSuccess={handleFormSuccess}
        />
      )}

      {deleteTarget && (
        <DeleteDepartmentModal
          department={deleteTarget}
          onClose={closeDelete}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
