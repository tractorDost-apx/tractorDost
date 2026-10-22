'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  X,
} from 'lucide-react';
import {
  appSettingAPI,
  getAppSettingErrorMessage,
  ListAppSettingsQuery,
} from '@/lib/api/appSettings';
import type { AppSetting, AppSettingListMeta } from '@/types/models/appSetting';
import Pagination from '@/components/shared/Pagination';
import AppSettingEditor from './app-setting-editor';

interface AlertState {
  type: 'success' | 'error';
  text: string;
}

const MASK = '••••••••';

const TYPE_BADGE_CLASS =
  'border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)]';

const filterInputClass =
  'rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs font-semibold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:outline-none';

const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

const formatCount = (n: number): string => n.toLocaleString('en-IN');

export default function AppSettingsManagement() {
  // Each response is stored with the request key it answers. Loading and errors are derived from
  // comparing that key to the current one, so the effect never sets state synchronously.
  const [result, setResult] = useState<{
    key: string;
    settings: AppSetting[];
    meta: AppSettingListMeta;
  } | null>(null);
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [limit, setLimit] = useState(10);

  // Values are masked until revealed. Reveal state lives only in this view and is never stored.
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(() => new Set());

  const [editor, setEditor] = useState<{ open: boolean; setting: AppSetting | null }>({
    open: false,
    setting: null,
  });
  const [settingToDelete, setSettingToDelete] = useState<AppSetting | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<AlertState | null>(null);

  const hasSearch = debouncedSearch !== '';

  const requestKey = JSON.stringify([debouncedSearch, pageNumber, limit, reloadKey]);
  const isFresh = result?.key === requestKey;
  const loadError = failure?.key === requestKey ? failure.message : null;
  const loading = !isFresh && loadError === null;
  // Rows from the last successful load stay on screen while a new request is in flight.
  const settings = result?.settings ?? [];
  const meta = result?.meta ?? null;
  const totalCount = meta?.totalItems ?? 0;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!alertMsg) return;
    const timer = setTimeout(() => setAlertMsg(null), 5000);
    return () => clearTimeout(timer);
  }, [alertMsg]);

  useEffect(() => {
    let active = true;
    const query: ListAppSettingsQuery = {
      page: pageNumber,
      limit,
      search: debouncedSearch || undefined,
    };

    appSettingAPI
      .getAll(query)
      .then((res) => {
        if (!res.data) throw new Error('Missing settings list in response');
        if (active) {
          setResult({ key: requestKey, settings: res.data.appSettings, meta: res.data.meta });
        }
      })
      .catch((err: unknown) => {
        // The error is logged without the response body, because a settings list can include values.
        console.error('Failed to load app settings');
        if (active) {
          setFailure({
            key: requestKey,
            message: getAppSettingErrorMessage(err, 'Could not load app settings.'),
          });
        }
      });

    return () => {
      active = false;
    };
  }, [requestKey, debouncedSearch, pageNumber, limit]);

  const resetSearch = () => {
    setSearch('');
    setDebouncedSearch('');
    setPageNumber(1);
  };

  const toggleReveal = (key: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Saves always reload the current page so the table matches the server's sort order and totals.
  const handleSaved = (setting: AppSetting, mode: 'create' | 'update') => {
    setAlertMsg({
      type: 'success',
      text:
        mode === 'create'
          ? `Setting "${setting.key}" created.`
          : `Setting "${setting.key}" updated.`,
    });
    setEditor({ open: false, setting: null });
    setReloadKey((k) => k + 1);
  };

  const handleConfirmDelete = async () => {
    if (!settingToDelete) return;
    setIsDeleting(true);
    try {
      await appSettingAPI.delete(settingToDelete.key);
      setAlertMsg({ type: 'success', text: `Setting "${settingToDelete.key}" was deleted.` });
      setSettingToDelete(null);
      // Step back a page if this was the last row on it.
      if (settings.length === 1 && pageNumber > 1) setPageNumber((p) => p - 1);
      setReloadKey((k) => k + 1);
    } catch (err: unknown) {
      console.error('Failed to delete app setting');
      setAlertMsg({
        type: 'error',
        text: getAppSettingErrorMessage(err, 'Could not delete the setting.'),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-foreground text-2xl font-black tracking-tight">App Settings</h1>
            <span className="rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/20 px-2.5 py-0.5 text-[11px] font-extrabold text-[var(--color-brand-green)]">
              {formatCount(totalCount)} {totalCount === 1 ? 'setting' : 'settings'}
            </span>
          </div>
          <p className="text-muted mt-1 max-w-xl text-xs leading-relaxed">
            Runtime configuration for the platform. Values are encrypted when stored and hidden here
            until you reveal them. Public settings can be read by anyone.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            disabled={loading}
            className="border-foreground/10 bg-foreground/5 text-muted hover:bg-foreground/10 hover:text-foreground flex h-10 w-10 items-center justify-center rounded-xl border transition-all disabled:opacity-50"
            title="Refresh settings"
            aria-label="Refresh settings"
          >
            <RefreshCw
              size={16}
              className={loading ? 'animate-spin text-[var(--color-brand-green)]' : ''}
            />
          </button>
          <button
            type="button"
            onClick={() => setEditor({ open: true, setting: null })}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-4 py-2.5 text-xs font-bold text-white shadow-[var(--color-brand-green)]/20 shadow-lg transition-all hover:opacity-90"
          >
            <Plus size={16} />
            <span>Add Setting</span>
          </button>
        </div>
      </div>

      {alertMsg && (
        <div
          role="status"
          className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 text-xs font-bold ${
            alertMsg.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMsg.type === 'success' ? (
              <CheckCircle2 size={16} className="shrink-0" />
            ) : (
              <AlertCircle size={16} className="shrink-0" />
            )}
            <span>{alertMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setAlertMsg(null)}
            className="hover:opacity-75"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={14} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageNumber(1);
            }}
            placeholder="Search by key or description..."
            aria-label="Search settings"
            className={`${filterInputClass} w-full pl-9`}
          />
        </div>
        {hasSearch && (
          <button
            type="button"
            onClick={resetSearch}
            className="text-muted hover:text-foreground text-xs font-bold transition-colors"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Mobile: one card per setting. */}
      <div className="flex flex-col gap-3 md:hidden">
        {loading && settings.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`card-skeleton-${i}`}
              aria-hidden="true"
              className="bg-foreground/5 h-28 animate-pulse rounded-2xl"
            />
          ))
        ) : loadError ? (
          <StateMessage
            icon={<AlertTriangle size={36} className="text-red-600 dark:text-red-400" />}
            title="Could not load settings"
            detail={loadError}
            actionLabel="Try again"
            onAction={() => setReloadKey((k) => k + 1)}
          />
        ) : settings.length === 0 ? (
          <EmptyState
            hasSearch={hasSearch}
            onReset={resetSearch}
            onAdd={() => setEditor({ open: true, setting: null })}
          />
        ) : (
          settings.map((setting) => (
            <div
              key={setting.id}
              className="glass-panel border-foreground/10 flex flex-col gap-3 rounded-2xl border p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-foreground min-w-0 font-mono text-xs font-bold break-all">
                  {setting.key}
                </p>
                <Actions setting={setting} onEdit={setEditor} onDelete={setSettingToDelete} />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <TypeBadge dataType={setting.dataType} />
                <VisibilityBadge isPublic={setting.isPublic} />
              </div>
              <ValueRow
                value={setting.value}
                revealed={revealedKeys.has(setting.key)}
                onToggle={() => toggleReveal(setting.key)}
              />
              {setting.description && (
                <p className="text-muted text-[11px]">{setting.description}</p>
              )}
              <p className="text-muted text-[11px]">Updated {formatDateTime(setting.updatedAt)}</p>
            </div>
          ))
        )}
      </div>

      {/* Tablet and desktop: table. */}
      <div className="glass-panel border-foreground/10 hidden flex-col overflow-hidden rounded-2xl border shadow-xl md:flex">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-foreground/10 bg-foreground/[0.02] text-muted border-b text-[11px] font-black tracking-wider uppercase select-none">
              <tr>
                <th className="min-w-[200px] px-4 py-3.5">Key</th>
                <th className="min-w-[200px] px-4 py-3.5">Value</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Visibility</th>
                <th className="min-w-[160px] px-4 py-3.5">Updated</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-foreground/5 divide-y font-medium">
              {loading && settings.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} aria-hidden="true">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="bg-foreground/5 h-8 animate-pulse rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : loadError ? (
                <tr>
                  <td colSpan={6} className="py-16">
                    <StateMessage
                      icon={<AlertTriangle size={36} className="text-red-600 dark:text-red-400" />}
                      title="Could not load settings"
                      detail={loadError}
                      actionLabel="Try again"
                      onAction={() => setReloadKey((k) => k + 1)}
                    />
                  </td>
                </tr>
              ) : settings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16">
                    <EmptyState
                      hasSearch={hasSearch}
                      onReset={resetSearch}
                      onAdd={() => setEditor({ open: true, setting: null })}
                    />
                  </td>
                </tr>
              ) : (
                settings.map((setting) => (
                  <tr key={setting.id} className="hover:bg-foreground/[0.02] transition-colors">
                    <td className="px-4 py-3 align-top">
                      <p className="text-foreground font-mono font-bold break-all">{setting.key}</p>
                      {setting.description && (
                        <p className="text-muted mt-0.5 max-w-[260px] text-[11px]">
                          {setting.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <ValueRow
                        value={setting.value}
                        revealed={revealedKeys.has(setting.key)}
                        onToggle={() => toggleReveal(setting.key)}
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <TypeBadge dataType={setting.dataType} />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <VisibilityBadge isPublic={setting.isPublic} />
                    </td>
                    <td className="text-muted px-4 py-3 align-top text-[11px]">
                      <p>{formatDateTime(setting.updatedAt)}</p>
                      {setting.updatedBy !== null && <p>User #{setting.updatedBy}</p>}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Actions setting={setting} onEdit={setEditor} onDelete={setSettingToDelete} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && !loadError && totalCount > 0 && meta && (
        <Pagination
          page={pageNumber}
          limit={limit}
          totalCount={totalCount}
          totalPages={meta.totalPages}
          onPageChange={(p) => setPageNumber(p)}
          onLimitChange={(l) => {
            setLimit(l);
            setPageNumber(1);
          }}
        />
      )}

      {editor.open && (
        <AppSettingEditor
          key={editor.setting?.id ?? 'new'}
          setting={editor.setting}
          onClose={() => setEditor({ open: false, setting: null })}
          onSaved={handleSaved}
        />
      )}

      {settingToDelete && (
        <DeleteAppSettingDialog
          setting={settingToDelete}
          isDeleting={isDeleting}
          onClose={() => setSettingToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

interface ActionsProps {
  setting: AppSetting;
  onEdit: (state: { open: boolean; setting: AppSetting | null }) => void;
  onDelete: (setting: AppSetting) => void;
}

function Actions({ setting, onEdit, onDelete }: ActionsProps) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={() => onEdit({ open: true, setting })}
        className="border-foreground/10 bg-foreground/5 text-muted hover:bg-foreground/10 hover:text-foreground rounded-lg border p-2 transition-all"
        title="Edit"
        aria-label={`Edit ${setting.key}`}
      >
        <Pencil size={14} />
      </button>
      <button
        type="button"
        onClick={() => onDelete(setting)}
        className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-600 transition-all hover:bg-red-500/20 dark:text-red-400"
        title="Delete"
        aria-label={`Delete ${setting.key}`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function ValueRow({
  value,
  revealed,
  onToggle,
}: {
  value: string;
  revealed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex max-w-[320px] items-start gap-2">
      <code
        className="text-foreground/80 min-w-0 flex-1 font-mono text-[11px] break-all whitespace-pre-wrap"
        aria-label={revealed ? 'Value' : 'Masked value'}
      >
        {revealed ? value : MASK}
      </code>
      <button
        type="button"
        onClick={onToggle}
        className="text-muted hover:text-foreground shrink-0 rounded-md p-1 transition-colors"
        aria-label={revealed ? 'Hide value' : 'Reveal value'}
        title={revealed ? 'Hide value' : 'Reveal value'}
      >
        {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
    </div>
  );
}

function TypeBadge({ dataType }: { dataType: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-extrabold uppercase ${TYPE_BADGE_CLASS}`}
    >
      {dataType}
    </span>
  );
}

function VisibilityBadge({ isPublic }: { isPublic: boolean }) {
  return isPublic ? (
    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
      Public
    </span>
  ) : (
    <span className="text-muted flex items-center gap-1 rounded-full border border-zinc-500/30 bg-zinc-500/15 px-2.5 py-0.5 text-[10px] font-extrabold">
      <Lock size={10} />
      Private
    </span>
  );
}

function StateMessage({
  icon,
  title,
  detail,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="px-4 text-center">
      <div className="mx-auto mb-3 flex justify-center">{icon}</div>
      <p className="text-foreground text-sm font-bold">{title}</p>
      <p className="text-muted mx-auto mt-1 max-w-sm text-xs">{detail}</p>
      <button
        type="button"
        onClick={onAction}
        className="border-foreground/10 bg-foreground/5 text-foreground hover:bg-foreground/10 mt-4 rounded-xl border px-4 py-2 text-xs font-bold"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function EmptyState({
  hasSearch,
  onReset,
  onAdd,
}: {
  hasSearch: boolean;
  onReset: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="px-4 py-4 text-center">
      <Settings size={40} className="mx-auto mb-3 text-[var(--color-brand-green)] opacity-30" />
      <p className="text-foreground text-sm font-bold">
        {hasSearch ? 'No settings match this search' : 'No settings yet'}
      </p>
      <p className="text-muted mx-auto mt-1 max-w-sm text-xs">
        {hasSearch
          ? 'Try a different key or description.'
          : 'Add a setting to configure the platform.'}
      </p>
      <button
        type="button"
        onClick={hasSearch ? onReset : onAdd}
        className="mt-4 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-xs font-bold text-white hover:opacity-90"
      >
        {hasSearch ? 'Clear search' : 'Add setting'}
      </button>
    </div>
  );
}

interface DeleteAppSettingDialogProps {
  setting: AppSetting;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteAppSettingDialog({
  setting,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteAppSettingDialogProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm dark:bg-black/75">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-red-500/20 dark:bg-[#121814]">
        <div className="mb-4 flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-500">
            <AlertTriangle size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-black text-zinc-900 dark:text-white">Delete setting?</h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              This permanently removes the setting and its stored value. Anything that depends on
              this key will no longer find it. It cannot be undone.
            </p>
          </div>
        </div>

        <div className="mb-5 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 dark:border-white/10 dark:bg-black/40">
          <p className="font-mono text-xs font-bold break-all text-zinc-900 dark:text-white">
            {setting.key}
          </p>
          {setting.description && (
            <p className="mt-1 line-clamp-2 text-[11px] text-zinc-600 dark:text-zinc-400">
              {setting.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-xs font-bold text-zinc-700 transition-all hover:bg-zinc-200 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 disabled:opacity-50"
          >
            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            <span>{isDeleting ? 'Deleting...' : 'Delete setting'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
