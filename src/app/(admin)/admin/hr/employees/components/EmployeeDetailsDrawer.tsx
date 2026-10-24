import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  Briefcase,
  CalendarDays,
  Edit2,
  Eye,
  EyeOff,
  IdCard,
  Landmark,
  Loader2,
  Network,
  Phone,
  RotateCcw,
  ShieldAlert,
  UserX,
  X,
} from 'lucide-react';
import type { EmployeeProfile, EmployeeSensitiveDetails } from '@/types/models/employee';
import { employeeAPI } from '@/lib/api/employees';
import { useEmployee } from '@/hooks/hr/use-employees';
import { formatDateTime } from '@/lib/utils/format-date';
import { formatINR } from '@/lib/utils/format-currency';
import { employeeInitials, formatEmployeeDate } from '@/lib/utils/employee-format';
import { terminationBlockedReason } from '@/lib/validators/employee.schema';
import { AccountDisabledBadge, EmployeeRoleBadge, EmployeeStatusBadge } from './EmployeeBadges';
import type { TerminationTarget } from './TerminateEmployeeModal';

interface EmployeeDetailsDrawerProps {
  employeeId: number;
  /** Changes after a write elsewhere on the page, so the profile is refetched */
  refreshKey: number;
  currentUserId: number | undefined;
  /** True while a dialog is open on top of the drawer, so Escape only closes that dialog */
  escapeDisabled: boolean;
  onClose: () => void;
  onEdit: (employeeId: number) => void;
  onTerminate: (target: TerminationTarget) => void;
  onShowReports: (manager: { id: number; label: string }) => void;
}

function Detail({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted text-[10px] font-black tracking-wider uppercase">{label}</dt>
      <dd
        className={`text-foreground mt-0.5 text-xs font-bold break-words ${mono ? 'font-mono' : ''}`}
      >
        {value === null || value === undefined || value === '' ? (
          <span className="text-muted">—</span>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-inner space-y-3 p-4">
      <h3 className="flex items-center gap-2 text-[11px] font-black tracking-wider text-lime-400 uppercase">
        <Icon size={14} /> {title}
      </h3>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

type BankField = 'bankAccountNo' | 'ifscCode' | 'panNumber';

/** Masked field with a per-field eye toggle; fetches sensitive data on first reveal. */
function MaskedDetail({
  label,
  maskedValue,
  sensitiveValue,
  revealed,
  loading,
  onToggle,
  mono,
}: {
  label: string;
  maskedValue: string | null | undefined;
  sensitiveValue: string | null | undefined;
  revealed: boolean;
  loading: boolean;
  onToggle: () => void;
  mono?: boolean;
}) {
  const display = revealed ? sensitiveValue : maskedValue;
  return (
    <div className="min-w-0">
      <dt className="text-muted text-[10px] font-black tracking-wider uppercase">{label}</dt>
      <dd
        className={`text-foreground mt-0.5 flex items-center gap-1.5 text-xs font-bold ${mono ? 'font-mono' : ''}`}
      >
        <span className="min-w-0 break-all">
          {display === null || display === undefined || display === '' ? (
            <span className="text-muted">—</span>
          ) : (
            display
          )}
        </span>
        <button
          type="button"
          onClick={onToggle}
          disabled={loading}
          aria-label={revealed ? `Hide ${label}` : `Reveal ${label}`}
          title={revealed ? `Hide ${label}` : `Reveal ${label}`}
          className="text-muted hover:text-foreground shrink-0 rounded p-0.5 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={11} className="animate-spin" />
          ) : revealed ? (
            <EyeOff size={11} />
          ) : (
            <Eye size={11} />
          )}
        </button>
      </dd>
    </div>
  );
}

/**
 * Salary panel — controlled. Bank/tax fields are revealed inline above; this section handles
 * salary only. The backend audit-logs every sensitive-data read.
 */
function SensitiveDetailsPanel({
  details,
  loading,
  error,
  onReveal,
  onHide,
}: {
  details: EmployeeSensitiveDetails | null;
  loading: boolean;
  error: string | null;
  onReveal: () => void;
  onHide: () => void;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-[11px] font-black tracking-wider text-amber-400 uppercase">
          <ShieldAlert size={14} /> Confidential: salary
        </h3>
        {details ? (
          <button
            type="button"
            onClick={onHide}
            className="text-foreground bg-foreground/5 hover:bg-foreground/10 flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-[11px] font-bold"
          >
            <EyeOff size={13} /> Hide
          </button>
        ) : (
          <button
            type="button"
            onClick={onReveal}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[11px] font-bold text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
            {loading ? 'Loading...' : 'Reveal'}
          </button>
        )}
      </div>
      {!details && (
        <p className="text-muted text-[11px] font-medium">
          Every reveal is recorded in the audit log under your account. Only reveal when you need
          it.
        </p>
      )}
      {error && (
        <p className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400" role="alert">
          <AlertCircle size={13} /> {error}
        </p>
      )}
      {details && (
        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
          <Detail
            label="Basic salary (monthly)"
            value={details.basicSalary !== null ? formatINR(details.basicSalary) : null}
          />
          <Detail
            label="CTC (annual)"
            value={details.ctc !== null ? formatINR(details.ctc) : null}
          />
        </dl>
      )}
    </section>
  );
}

const BANK_FIELD_LABELS: Record<BankField, string> = {
  bankAccountNo: 'Bank account',
  ifscCode: 'IFSC',
  panNumber: 'PAN',
};

function ProfileBody({ profile }: { profile: EmployeeProfile }) {
  const genderLabel = profile.gender
    ? profile.gender.charAt(0) + profile.gender.slice(1).toLowerCase()
    : null;

  // One fetch serves both the per-field bank toggles and the salary panel
  const [sensitiveDetails, setSensitiveDetails] = useState<EmployeeSensitiveDetails | null>(null);
  const [sensitiveLoading, setSensitiveLoading] = useState(false);
  const [sensitiveError, setSensitiveError] = useState<string | null>(null);

  // Which bank/tax fields are currently shown unmasked
  const [shownBankFields, setShownBankFields] = useState<Set<BankField>>(() => new Set());
  // Which field triggered the in-progress fetch (to show spinner on that button only)
  const [pendingBankField, setPendingBankField] = useState<BankField | null>(null);
  // Whether the salary panel is explicitly opened
  const [showSalary, setShowSalary] = useState(false);

  const doFetch = async (): Promise<EmployeeSensitiveDetails | null> => {
    setSensitiveLoading(true);
    setSensitiveError(null);
    const res = await employeeAPI.getEmployeeSensitiveDetails(profile.id);
    setSensitiveLoading(false);
    if (res.success && res.data) {
      setSensitiveDetails(res.data);
      return res.data;
    }
    setSensitiveError(res.message);
    return null;
  };

  const toggleBankField = async (field: BankField) => {
    if (shownBankFields.has(field)) {
      setShownBankFields((prev) => {
        const s = new Set(prev);
        s.delete(field);
        return s;
      });
      return;
    }
    let data = sensitiveDetails;
    if (!data) {
      setPendingBankField(field);
      data = await doFetch();
      setPendingBankField(null);
    }
    if (data) setShownBankFields((prev) => new Set([...prev, field]));
  };

  const revealSalary = async () => {
    if (!sensitiveDetails) await doFetch();
    setShowSalary(true);
  };

  return (
    <div className="space-y-4">
      <Section icon={Briefcase} title="Employment">
        <Detail label="Designation" value={profile.designation} />
        <Detail label="Role" value={<EmployeeRoleBadge role={profile.user.role.name} />} />
        <Detail label="Department" value={profile.department?.name ?? 'Unassigned'} />
        <Detail
          label="Reporting manager"
          value={
            profile.reportingManager ? (
              <>
                {profile.reportingManager.fullName ?? 'Unnamed'}{' '}
                <span className="text-muted font-mono text-[10px]">
                  {profile.reportingManager.employeeCode}
                </span>
              </>
            ) : null
          }
        />
        <Detail
          label="Login account"
          value={
            profile.user.isActive ? (
              <span className="text-emerald-400">Active</span>
            ) : (
              <AccountDisabledBadge />
            )
          }
        />
      </Section>

      <Section icon={CalendarDays} title="Key dates">
        <Detail label="Joining date" value={formatEmployeeDate(profile.joiningDate)} />
        <Detail
          label="Probation ends"
          value={profile.probationEndDate && formatEmployeeDate(profile.probationEndDate)}
        />
        <Detail
          label="Confirmed on"
          value={profile.confirmationDate && formatEmployeeDate(profile.confirmationDate)}
        />
        {profile.status === 'TERMINATED' && (
          <>
            <Detail
              label="Terminated on"
              value={profile.terminationDate && formatEmployeeDate(profile.terminationDate)}
            />
            <div className="sm:col-span-2">
              <Detail label="Termination reason" value={profile.terminationReason} />
            </div>
          </>
        )}
      </Section>

      <Section icon={Phone} title="Contact">
        <Detail label="Mobile" value={profile.user.mobile} mono />
        <Detail label="Email" value={profile.user.email} />
        <div className="sm:col-span-2">
          <Detail label="Emergency contact" value={profile.emergencyContact} />
        </div>
      </Section>

      <Section icon={IdCard} title="Personal">
        <Detail
          label="Date of birth"
          value={profile.dateOfBirth && formatEmployeeDate(profile.dateOfBirth)}
        />
        <Detail label="Gender" value={genderLabel} />
        <div className="sm:col-span-2">
          <Detail label="Address" value={profile.address} />
        </div>
      </Section>

      <Section icon={Landmark} title="Bank & tax (masked)">
        {(['bankAccountNo', 'ifscCode', 'panNumber'] as const).map((field) => (
          <MaskedDetail
            key={field}
            label={BANK_FIELD_LABELS[field]}
            maskedValue={profile[field]}
            sensitiveValue={sensitiveDetails?.[field]}
            revealed={shownBankFields.has(field)}
            loading={pendingBankField === field && sensitiveLoading}
            onToggle={() => toggleBankField(field)}
            mono
          />
        ))}
        {sensitiveError && (
          <div className="sm:col-span-2">
            <p
              className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400"
              role="alert"
            >
              <AlertCircle size={12} /> {sensitiveError}
            </p>
          </div>
        )}
      </Section>

      <SensitiveDetailsPanel
        details={showSalary ? sensitiveDetails : null}
        loading={sensitiveLoading}
        error={showSalary ? sensitiveError : null}
        onReveal={revealSalary}
        onHide={() => setShowSalary(false)}
      />

      <p className="text-muted text-[10px] font-medium">
        Record created {formatDateTime(profile.createdAt)} · last updated{' '}
        {formatDateTime(profile.updatedAt)}
      </p>
    </div>
  );
}

export function EmployeeDetailsDrawer({
  employeeId,
  refreshKey,
  currentUserId,
  escapeDisabled,
  onClose,
  onEdit,
  onTerminate,
  onShowReports,
}: EmployeeDetailsDrawerProps) {
  const { data: profile, loading, error, reload } = useEmployee(employeeId, refreshKey);
  // Ignore a profile still cached from a previously opened employee
  const current = profile && profile.id === employeeId ? profile : null;

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    if (escapeDisabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, escapeDisabled]);

  const blockedReason = current ? terminationBlockedReason(current, currentUserId) : null;

  return createPortal(
    <div
      onClick={onClose}
      className="animate-fade-in fixed inset-0 z-[100] flex justify-end bg-black/80 backdrop-blur-md"
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-drawer-title"
        className="flex h-full w-full max-w-xl flex-col border-l border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl"
      >
        <div className="bg-foreground/5 flex shrink-0 items-start justify-between gap-3 border-b border-[var(--border-subtle)] p-5 sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-lime-400/20 bg-lime-400/10 text-lg font-black text-lime-400">
              {current ? employeeInitials(current.user.fullName) : '…'}
            </div>
            <div className="min-w-0">
              <h2
                id="employee-drawer-title"
                className="text-foreground truncate text-lg font-black tracking-tight sm:text-xl"
              >
                {current ? (current.user.fullName ?? 'Unnamed employee') : 'Loading employee...'}
              </h2>
              {current && (
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-muted font-mono text-[11px] font-bold">
                    {current.employeeCode}
                  </span>
                  <EmployeeStatusBadge status={current.status} />
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-foreground hover:bg-foreground/10 shrink-0 rounded-xl p-2 transition-colors"
            aria-label="Close details"
            title="Close (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {current && (
          <div className="flex shrink-0 flex-wrap gap-2 border-b border-[var(--border-subtle)] px-5 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => onEdit(current.id)}
              className="text-foreground bg-foreground/5 hover:bg-foreground/10 flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3.5 py-2 text-xs font-bold transition-colors"
            >
              <Edit2 size={14} /> Edit
            </button>
            <button
              type="button"
              onClick={() =>
                onShowReports({
                  id: current.id,
                  label: `${current.user.fullName ?? 'Unnamed'} (${current.employeeCode})`,
                })
              }
              className="text-foreground bg-foreground/5 hover:bg-foreground/10 flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3.5 py-2 text-xs font-bold transition-colors"
            >
              <Network size={14} /> Direct reports
            </button>
            <button
              type="button"
              onClick={() =>
                onTerminate({
                  id: current.id,
                  employeeCode: current.employeeCode,
                  fullName: current.user.fullName,
                  joiningDate: current.joiningDate,
                })
              }
              disabled={blockedReason !== null}
              title={blockedReason ?? undefined}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-400 transition-colors hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <UserX size={14} /> Terminate
            </button>
            {blockedReason && current.status !== 'TERMINATED' && (
              <span className="text-muted self-center text-[10px] font-medium">
                {blockedReason}
              </span>
            )}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {error && !loading ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertCircle size={28} className="text-rose-400" />
              <p className="text-sm font-bold text-rose-400">{error}</p>
              <button
                type="button"
                onClick={reload}
                className="bg-foreground/5 text-foreground flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold hover:border-lime-400/40"
              >
                <RotateCcw size={14} /> Try again
              </button>
            </div>
          ) : current ? (
            <div className={loading ? 'opacity-60 transition-opacity' : ''}>
              <ProfileBody key={current.id} profile={current} />
            </div>
          ) : (
            <div className="space-y-4" aria-busy="true">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-foreground/5 h-28 animate-pulse rounded-2xl" />
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>,
    document.body
  );
}
