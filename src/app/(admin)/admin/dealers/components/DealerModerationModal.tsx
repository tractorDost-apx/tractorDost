import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, XCircle, Award, Power, AlertCircle } from 'lucide-react';
import { dealerAPI } from '@/lib/api/dealers';
import { Dealer, VerificationStatus, UpdateDealerAdminPayload } from '@/types/models/dealer';

interface DealerModerationModalProps {
  dealer: Dealer;
  onClose: () => void;
  onSuccess: () => void;
}

export function DealerModerationModal({ dealer, onClose, onSuccess }: DealerModerationModalProps) {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(
    dealer.verificationStatus || 'PENDING'
  );
  const [rejectionReason, setRejectionReason] = useState(dealer.rejectionReason || '');
  const [isCertified, setIsCertified] = useState<boolean>(!!dealer.isCertified);
  const [certificationReason, setCertificationReason] = useState('');
  const [isActive, setIsActive] = useState<boolean>(dealer.isActive !== false);

  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleApplyModeration = async () => {
    setApiError(null);

    if (verificationStatus === 'REJECTED' && !rejectionReason.trim()) {
      setApiError('Rejection reason is required when status is REJECTED');
      return;
    }

    const payload: UpdateDealerAdminPayload = {
      verificationStatus,
      rejectionReason: verificationStatus === 'REJECTED' ? rejectionReason : undefined,
      isCertified,
      certificationReason: isCertified ? certificationReason || undefined : undefined,
      isActive,
    };

    try {
      setSubmitting(true);
      const res = await dealerAPI.updateDealerByAdmin(dealer.id, payload);
      if (res.success) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error applying admin moderation:', err);
      setApiError(err?.response?.data?.message || 'Failed to update dealer moderation status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md sm:p-6">
      <div className="flex w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--background)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-foreground/5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-lime-400/20 bg-lime-400/10 p-2.5 text-lime-400">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-foreground text-xl font-black tracking-tight">
                Admin Moderation
              </h2>
              <p className="text-muted mt-0.5 text-xs font-bold">
                Verify, certify, or alter operational status for{' '}
                <strong className="text-foreground">{dealer.businessName}</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-muted hover:text-foreground rounded-xl p-2 transition-colors hover:bg-foreground/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {apiError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-bold text-rose-400">
              <AlertCircle size={16} className="shrink-0" />
              <p>{apiError}</p>
            </div>
          )}

          {/* Verification Status Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-black tracking-wider text-lime-400 uppercase">
              1. Dealership Verification Status
            </label>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setVerificationStatus('VERIFIED')}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-xs font-black transition-all ${
                  verificationStatus === 'VERIFIED'
                    ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10'
                    : 'text-muted border-[var(--border-subtle)] bg-foreground/5 hover:bg-foreground/10'
                }`}
              >
                <CheckCircle2 size={20} />
                VERIFY DEALER
              </button>

              <button
                type="button"
                onClick={() => setVerificationStatus('PENDING')}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-xs font-black transition-all ${
                  verificationStatus === 'PENDING'
                    ? 'border-amber-500/50 bg-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/10'
                    : 'text-muted border-[var(--border-subtle)] bg-foreground/5 hover:bg-foreground/10'
                }`}
              >
                <ShieldCheck size={20} />
                PENDING
              </button>

              <button
                type="button"
                onClick={() => setVerificationStatus('REJECTED')}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-xs font-black transition-all ${
                  verificationStatus === 'REJECTED'
                    ? 'border-rose-500/50 bg-rose-500/20 text-rose-400 shadow-lg shadow-rose-500/10'
                    : 'text-muted border-[var(--border-subtle)] bg-foreground/5 hover:bg-foreground/10'
                }`}
              >
                <XCircle size={20} />
                REJECT DEALER
              </button>
            </div>

            {verificationStatus === 'REJECTED' && (
              <div className="animate-fade-in space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-rose-400">
                  Rejection Reason <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Specify clear reason for rejecting dealership application..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 text-xs font-medium focus:border-rose-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          <hr className="border-[var(--border-subtle)]" />

          {/* Certified Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-black tracking-wider text-lime-400 uppercase">
                  2. Certified Dealership Badge
                </label>
                <p className="text-muted text-[11px] font-medium">
                  Grants official TractorDost Certified status & verified seal.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCertified(!isCertified)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black tracking-wider transition-all ${
                  isCertified
                    ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                    : 'text-muted border border-[var(--border-subtle)] bg-foreground/5 hover:bg-foreground/10'
                }`}
              >
                <Award size={16} />
                {isCertified ? 'CERTIFIED' : 'UNCERTIFIED'}
              </button>
            </div>

            {isCertified && (
              <div className="animate-fade-in space-y-1.5 pt-1">
                <label className="text-muted block text-xs font-bold">
                  Certification Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Reason or criteria met for certification..."
                  value={certificationReason}
                  onChange={(e) => setCertificationReason(e.target.value)}
                  className="text-foreground w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-2 text-xs font-medium focus:border-lime-400/50 focus:outline-none"
                />
              </div>
            )}
          </div>

          <hr className="border-[var(--border-subtle)]" />

          {/* Operational Active Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-black tracking-wider text-lime-400 uppercase">
                  3. Operational Status
                </label>
                <p className="text-muted text-[11px] font-medium">
                  Active dealers appear publicly across search & dealership listings.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black tracking-wider transition-all ${
                  isActive
                    ? 'bg-lime-400 text-black shadow-lg shadow-lime-400/20'
                    : 'border border-rose-500/30 bg-rose-500/20 text-rose-400'
                }`}
              >
                <Power size={16} />
                {isActive ? 'ACTIVE' : 'INACTIVE'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[var(--border-subtle)] bg-foreground/5 p-6">
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-foreground rounded-xl px-5 py-2.5 text-xs font-bold transition-colors hover:bg-foreground/10"
          >
            Cancel
          </button>

          {!confirmAction ? (
            <button
              type="button"
              onClick={() => setConfirmAction('CONFIRM')}
              className="rounded-xl bg-lime-400 px-6 py-2.5 text-xs font-black tracking-wider text-black uppercase shadow-lg shadow-lime-400/20 transition-all hover:bg-lime-300"
            >
              Apply Moderation
            </button>
          ) : (
            <div className="animate-fade-in flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400">Confirm changes?</span>
              <button
                type="button"
                onClick={handleApplyModeration}
                disabled={submitting}
                className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-black tracking-wider text-black uppercase shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 disabled:opacity-50"
              >
                {submitting ? 'Applying...' : 'Yes, Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
