import React from 'react';
import { Eye, Edit2, ShieldCheck, Star, AlertTriangle, Phone, Mail, MapPin, Building2, Layers } from 'lucide-react';
import { Dealer } from '@/types/models/dealer';
import {
  VerificationBadge,
  CertifiedBadge,
  ActiveBadge,
  DealerTypeBadge,
} from './DealerStatusBadge';

interface DealerTableProps {
  dealers: Dealer[];
  loading: boolean;
  onSelectDealer: (dealer: Dealer) => void;
  onEditDealer: (dealer: Dealer, e: React.MouseEvent) => void;
  onModerateDealer: (dealer: Dealer, e: React.MouseEvent) => void;
  onAssignBrandDealer?: (dealer: Dealer, e: React.MouseEvent) => void;
}

export function DealerTable({
  dealers,
  loading,
  onSelectDealer,
  onEditDealer,
  onModerateDealer,
  onAssignBrandDealer,
}: DealerTableProps) {
  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-8 border border-white/5 w-full">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (dealers.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center border border-white/5 flex flex-col items-center justify-center gap-3 w-full">
        <div className="p-4 rounded-2xl bg-white/5 text-muted">
          <Building2 size={36} />
        </div>
        <h3 className="text-lg font-bold text-foreground">No dealers found</h3>
        <p className="text-sm font-medium text-muted max-w-sm">
          No dealership partners match your current filters or search term. Try resetting filters or adjusting search parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-white/5 flex-1 flex flex-col w-full max-w-full overflow-hidden shadow-xl">
      {/* Horizontal Scroll Container */}
      <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <table className="w-full min-w-[1000px] text-left text-sm whitespace-nowrap">
          <thead className="bg-white/5 text-muted uppercase text-[11px] font-black tracking-wider border-b border-white/5 sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="px-6 py-4 min-w-[240px]">Dealer & Type</th>
              <th className="px-6 py-4 min-w-[180px]">Location</th>
              <th className="px-6 py-4 min-w-[200px]">Contact</th>
              <th className="px-6 py-4 min-w-[160px]">Verification</th>
              <th className="px-6 py-4 min-w-[180px]">Rating & Feedback</th>
              <th className="px-6 py-4 min-w-[120px]">Status</th>
              <th className="px-6 py-4 min-w-[130px] text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {dealers.map((dealer) => {
              const ratingVal = dealer.rating != null ? Number(dealer.rating) : 0;
              const formattedDate = new Date(dealer.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });

              return (
                <tr
                  key={dealer.id}
                  onClick={() => onSelectDealer(dealer)}
                  className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                >
                  {/* Dealer & Type */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 whitespace-normal">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-foreground text-base tracking-tight group-hover:text-lime-400 transition-colors">
                          {dealer.businessName}
                        </span>
                        <CertifiedBadge isCertified={dealer.isCertified} />
                      </div>

                      <div className="flex items-center gap-2">
                        <DealerTypeBadge dealerType={dealer.dealerType} />
                        <span className="text-[10px] font-bold text-muted">Joined {formattedDate}</span>
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5 text-xs whitespace-normal">
                      <span className="font-bold text-foreground/90 flex items-center gap-1">
                        <MapPin size={13} className="text-lime-400 shrink-0" />
                        {dealer.district}, {dealer.state}
                      </span>
                      {dealer.pincode && (
                        <span className="text-muted text-[11px] font-medium pl-4">
                          PIN: {dealer.pincode}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      {dealer.phone && (
                        <span className="font-bold text-foreground/80 flex items-center gap-1.5">
                          <Phone size={12} className="text-muted shrink-0" />
                          {dealer.phone}
                        </span>
                      )}
                      {dealer.email && (
                        <span className="text-muted font-medium flex items-center gap-1.5 truncate max-w-[180px]">
                          <Mail size={12} className="shrink-0" />
                          {dealer.email}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Verification */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <VerificationBadge status={dealer.verificationStatus} />
                      {dealer.verificationStatus === 'REJECTED' && dealer.rejectionReason && (
                        <span className="text-[10px] font-semibold text-rose-400/80 truncate max-w-[150px]" title={dealer.rejectionReason}>
                          Reason: {dealer.rejectionReason}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Rating & Feedback */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-1 font-bold text-foreground">
                        <Star size={13} className="fill-amber-400 text-amber-400 shrink-0" />
                        <span>{ratingVal.toFixed(1)}</span>
                        <span className="text-muted font-normal text-[11px]">({dealer.reviewsCount ?? 0} reviews)</span>
                      </div>

                      {(dealer.complaintsCount ?? 0) > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                          <AlertTriangle size={12} />
                          {dealer.complaintsCount} complaints
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted font-medium">No active complaints</span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <ActiveBadge isActive={dealer.isActive} />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectDealer(dealer)}
                        className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/10 transition-colors"
                        title="View Full Dealer Details"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={(e) => onEditDealer(dealer, e)}
                        className="p-2 rounded-xl text-muted hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                        title="Edit Dealer Details"
                      >
                        <Edit2 size={16} />
                      </button>

                      {onAssignBrandDealer && (
                        <button
                          onClick={(e) => onAssignBrandDealer(dealer, e)}
                          className="p-2 rounded-xl text-muted hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                          title="Assign Brand"
                        >
                          <Layers size={16} />
                        </button>
                      )}

                      <button
                        onClick={(e) => onModerateDealer(dealer, e)}
                        className="p-2 rounded-xl text-muted hover:text-lime-400 hover:bg-lime-400/10 transition-colors"
                        title="Moderate / Verify Dealer"
                      >
                        <ShieldCheck size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
