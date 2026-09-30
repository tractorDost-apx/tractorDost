import React from 'react';
import {
  Eye,
  Edit2,
  ShieldCheck,
  Star,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Building2,
  Layers,
} from 'lucide-react';
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
      <div className="glass-panel w-full rounded-2xl border border-white/5 p-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (dealers.length === 0) {
    return (
      <div className="glass-panel flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 p-12 text-center">
        <div className="text-muted rounded-2xl bg-white/5 p-4">
          <Building2 size={36} />
        </div>
        <h3 className="text-foreground text-lg font-bold">No dealers found</h3>
        <p className="text-muted max-w-sm text-sm font-medium">
          No dealership partners match your current filters or search term. Try resetting filters or
          adjusting search parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel flex w-full max-w-full flex-1 flex-col overflow-hidden rounded-2xl border border-white/5 shadow-xl">
      {/* Horizontal Scroll Container */}
      <div className="scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent w-full overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm whitespace-nowrap">
          <thead className="text-muted sticky top-0 z-10 border-b border-white/5 bg-white/5 text-[11px] font-black tracking-wider uppercase backdrop-blur-md">
            <tr>
              <th className="min-w-[240px] px-6 py-4">Dealer & Type</th>
              <th className="min-w-[180px] px-6 py-4">Location</th>
              <th className="min-w-[200px] px-6 py-4">Contact</th>
              <th className="min-w-[160px] px-6 py-4">Verification</th>
              <th className="min-w-[180px] px-6 py-4">Rating & Feedback</th>
              <th className="min-w-[120px] px-6 py-4">Status</th>
              <th className="min-w-[130px] px-6 py-4 text-right">Actions</th>
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
                  className="group cursor-pointer transition-colors hover:bg-white/[0.03]"
                >
                  {/* Dealer & Type */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 whitespace-normal">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-base font-black tracking-tight transition-colors group-hover:text-lime-400">
                          {dealer.businessName}
                        </span>
                        <CertifiedBadge isCertified={dealer.isCertified} />
                      </div>

                      <div className="flex items-center gap-2">
                        <DealerTypeBadge dealerType={dealer.dealerType} />
                        <span className="text-muted text-[10px] font-bold">
                          Joined {formattedDate}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5 text-xs whitespace-normal">
                      <span className="text-foreground/90 flex items-center gap-1 font-bold">
                        <MapPin size={13} className="shrink-0 text-lime-400" />
                        {dealer.district}, {dealer.state}
                      </span>
                      {dealer.pincode && (
                        <span className="text-muted pl-4 text-[11px] font-medium">
                          PIN: {dealer.pincode}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      {dealer.phone && (
                        <span className="text-foreground/80 flex items-center gap-1.5 font-bold">
                          <Phone size={12} className="text-muted shrink-0" />
                          {dealer.phone}
                        </span>
                      )}
                      {dealer.email && (
                        <span className="text-muted flex max-w-[180px] items-center gap-1.5 truncate font-medium">
                          <Mail size={12} className="shrink-0" />
                          {dealer.email}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Verification */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1">
                      <VerificationBadge status={dealer.verificationStatus} />
                      {dealer.verificationStatus === 'REJECTED' && dealer.rejectionReason && (
                        <span
                          className="max-w-[150px] truncate text-[10px] font-semibold text-rose-400/80"
                          title={dealer.rejectionReason}
                        >
                          Reason: {dealer.rejectionReason}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Rating & Feedback */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="text-foreground flex items-center gap-1 font-bold">
                        <Star size={13} className="shrink-0 fill-amber-400 text-amber-400" />
                        <span>{ratingVal.toFixed(1)}</span>
                        <span className="text-muted text-[11px] font-normal">
                          ({dealer.reviewsCount ?? 0} reviews)
                        </span>
                      </div>

                      {(dealer.complaintsCount ?? 0) > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                          <AlertTriangle size={12} />
                          {dealer.complaintsCount} complaints
                        </span>
                      ) : (
                        <span className="text-muted text-[11px] font-medium">
                          No active complaints
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <ActiveBadge isActive={dealer.isActive} />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div
                      className="flex items-center justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onSelectDealer(dealer)}
                        className="text-muted hover:text-foreground rounded-xl p-2 transition-colors hover:bg-white/10"
                        title="View Full Dealer Details"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={(e) => onEditDealer(dealer, e)}
                        className="text-muted rounded-xl p-2 transition-colors hover:bg-blue-500/10 hover:text-blue-400"
                        title="Edit Dealer Details"
                      >
                        <Edit2 size={16} />
                      </button>

                      {onAssignBrandDealer && (
                        <button
                          onClick={(e) => onAssignBrandDealer(dealer, e)}
                          className="text-muted rounded-xl p-2 transition-colors hover:bg-amber-400/10 hover:text-amber-400"
                          title="Assign Brand"
                        >
                          <Layers size={16} />
                        </button>
                      )}

                      <button
                        onClick={(e) => onModerateDealer(dealer, e)}
                        className="text-muted rounded-xl p-2 transition-colors hover:bg-lime-400/10 hover:text-lime-400"
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
