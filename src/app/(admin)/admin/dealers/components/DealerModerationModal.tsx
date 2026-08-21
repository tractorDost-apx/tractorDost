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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="w-full max-w-xl bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-lime-400/10 text-lime-400 border border-lime-400/20">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-foreground">Admin Moderation</h2>
              <p className="text-xs font-bold text-muted mt-0.5">
                Verify, certify, or alter operational status for <strong className="text-foreground">{dealer.businessName}</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {apiError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <p>{apiError}</p>
            </div>
          )}

          {/* Verification Status Selector */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase text-lime-400 tracking-wider block">
              1. Dealership Verification Status
            </label>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setVerificationStatus('VERIFIED')}
                className={`p-3 rounded-2xl border text-xs font-black flex flex-col items-center gap-2 transition-all ${
                  verificationStatus === 'VERIFIED'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                    : 'bg-white/5 text-muted border-white/10 hover:bg-white/10'
                }`}
              >
                <CheckCircle2 size={20} />
                VERIFY DEALER
              </button>

              <button
                type="button"
                onClick={() => setVerificationStatus('PENDING')}
                className={`p-3 rounded-2xl border text-xs font-black flex flex-col items-center gap-2 transition-all ${
                  verificationStatus === 'PENDING'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'bg-white/5 text-muted border-white/10 hover:bg-white/10'
                }`}
              >
                <ShieldCheck size={20} />
                PENDING
              </button>

              <button
                type="button"
                onClick={() => setVerificationStatus('REJECTED')}
                className={`p-3 rounded-2xl border text-xs font-black flex flex-col items-center gap-2 transition-all ${
                  verificationStatus === 'REJECTED'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-lg shadow-rose-500/10'
                    : 'bg-white/5 text-muted border-white/10 hover:bg-white/10'
                }`}
              >
                <XCircle size={20} />
                REJECT DEALER
              </button>
            </div>

            {verificationStatus === 'REJECTED' && (
              <div className="space-y-1.5 animate-fade-in pt-2">
                <label className="text-xs font-bold text-rose-400 block">
                  Rejection Reason <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Specify clear reason for rejecting dealership application..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-rose-500/5 border border-rose-500/30 rounded-xl p-3 text-xs font-medium text-foreground focus:outline-none focus:border-rose-500"
                />
              </div>
            )}
          </div>

          <hr className="border-white/10" />

          {/* Certified Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-black uppercase text-lime-400 tracking-wider block">
                  2. Certified Dealership Badge
                </label>
                <p className="text-[11px] font-medium text-muted">
                  Grants official TractorDost Certified status & verified seal.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCertified(!isCertified)}
                className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition-all flex items-center gap-2 ${
                  isCertified
                    ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                    : 'bg-white/5 text-muted border border-white/10 hover:bg-white/10'
                }`}
              >
                <Award size={16} />
                {isCertified ? 'CERTIFIED' : 'UNCERTIFIED'}
              </button>
            </div>

            {isCertified && (
              <div className="space-y-1.5 animate-fade-in pt-1">
                <label className="text-xs font-bold text-muted block">Certification Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Reason or criteria met for certification..."
                  value={certificationReason}
                  onChange={(e) => setCertificationReason(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-lime-400/50"
                />
              </div>
            )}
          </div>

          <hr className="border-white/10" />

          {/* Operational Active Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-black uppercase text-lime-400 tracking-wider block">
                  3. Operational Status
                </label>
                <p className="text-[11px] font-medium text-muted">
                  Active dealers appear publicly across search & dealership listings.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-lime-400 text-black shadow-lg shadow-lime-400/20'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                <Power size={16} />
                {isActive ? 'ACTIVE' : 'INACTIVE'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-zinc-900/30 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-muted hover:text-foreground hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>

          {!confirmAction ? (
            <button
              type="button"
              onClick={() => setConfirmAction('CONFIRM')}
              className="px-6 py-2.5 bg-lime-400 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-lime-300 transition-all shadow-lg shadow-lime-400/20"
            >
              Apply Moderation
            </button>
          ) : (
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="text-xs font-bold text-amber-400">Confirm changes?</span>
              <button
                type="button"
                onClick={handleApplyModeration}
                disabled={submitting}
                className="px-5 py-2.5 bg-emerald-500 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
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
