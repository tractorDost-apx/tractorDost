import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  MoreVertical,
  Wrench,
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
  onManageServiceCenter?: (dealer: Dealer, e: React.MouseEvent) => void;
}

interface DealerActionMenuProps {
  dealer: Dealer;
  isOpen: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onClose: () => void;
  onSelectDealer: (dealer: Dealer) => void;
  onEditDealer: (dealer: Dealer, e: React.MouseEvent) => void;
  onModerateDealer: (dealer: Dealer, e: React.MouseEvent) => void;
  onAssignBrandDealer?: (dealer: Dealer, e: React.MouseEvent) => void;
  onManageServiceCenter?: (dealer: Dealer, e: React.MouseEvent) => void;
}

function DealerActionMenu({
  dealer,
  isOpen,
  onToggle,
  onClose,
  onSelectDealer,
  onEditDealer,
  onModerateDealer,
  onAssignBrandDealer,
  onManageServiceCenter,
}: DealerActionMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const menuWidth = 224; // w-56 (14rem = 224px)
        let left = rect.right - menuWidth;
        if (left < 10) left = 10;

        let top = rect.bottom + 6;
        if (top + 260 > window.innerHeight && rect.top > 260) {
          top = rect.top - 260;
        }

        setMenuPos({ top, left });
      }
    };

    updatePosition();

    const handleScrollOrResize = () => {
      onClose();
    };

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        onClose();
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isOpen, onClose]);

  const menuPortal =
    isOpen && mounted && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: `${menuPos.top}px`,
              left: `${menuPos.left}px`,
              zIndex: 99999,
            }}
            className="w-56 rounded-2xl border border-white/10 bg-[#16191e]/95 p-1.5 shadow-2xl backdrop-blur-2xl ring-1 ring-black/50 animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                  onSelectDealer(dealer);
                }}
                className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-foreground/90 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Eye
                  size={15}
                  className="text-muted group-hover:text-foreground shrink-0 transition-colors"
                />
                <span>View Full Dealer Details</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                  onEditDealer(dealer, e);
                }}
                className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-foreground/90 transition-colors hover:bg-blue-500/10 hover:text-blue-400"
              >
                <Edit2
                  size={15}
                  className="text-muted group-hover:text-blue-400 shrink-0 transition-colors"
                />
                <span>Edit Dealer Details</span>
              </button>

              {onAssignBrandDealer && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                    onAssignBrandDealer(dealer, e);
                  }}
                  className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-foreground/90 transition-colors hover:bg-amber-400/10 hover:text-amber-400"
                >
                  <Layers
                    size={15}
                    className="text-muted group-hover:text-amber-400 shrink-0 transition-colors"
                  />
                  <span>Assign Brand</span>
                </button>
              )}

              {onManageServiceCenter && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                    onManageServiceCenter(dealer, e);
                  }}
                  className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-foreground/90 transition-colors hover:bg-orange-500/10 hover:text-orange-400"
                >
                  <Wrench
                    size={15}
                    className="text-muted group-hover:text-orange-400 shrink-0 transition-colors"
                  />
                  <span>Service Center</span>
                </button>
              )}

              <div className="my-1 border-t border-white/5" />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                  onModerateDealer(dealer, e);
                }}
                className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-foreground/90 transition-colors hover:bg-lime-400/10 hover:text-lime-400"
              >
                <ShieldCheck
                  size={15}
                  className="text-muted group-hover:text-lime-400 shrink-0 transition-colors"
                />
                <span>Moderate / Verify Dealer</span>
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(e);
        }}
        className={`inline-flex items-center justify-center rounded-xl p-2 transition-all duration-200 focus:outline-none ${
          isOpen
            ? 'bg-white/15 text-foreground ring-2 ring-white/10'
            : 'text-muted hover:bg-white/10 hover:text-foreground'
        }`}
        title="Actions Menu"
        aria-expanded={isOpen}
      >
        <MoreVertical size={18} />
      </button>
      {menuPortal}
    </>
  );
}

export function DealerTable({
  dealers,
  loading,
  onSelectDealer,
  onEditDealer,
  onModerateDealer,
  onAssignBrandDealer,
  onManageServiceCenter,
}: DealerTableProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

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
      <div className="scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent min-h-[320px] w-full overflow-x-auto pb-16">
        <table className="w-full min-w-[1000px] text-left text-sm whitespace-nowrap">
          <thead className="text-muted sticky top-0 z-10 border-b border-white/5 bg-white/5 text-[11px] font-black tracking-wider uppercase backdrop-blur-md">
            <tr>
              <th className="min-w-[240px] px-6 py-4">Dealer & Type</th>
              <th className="min-w-[180px] px-6 py-4">Location</th>
              <th className="min-w-[200px] px-6 py-4">Contact</th>
              <th className="min-w-[160px] px-6 py-4">Verification</th>
              <th className="min-w-[180px] px-6 py-4">Rating & Feedback</th>
              <th className="min-w-[120px] px-6 py-4">Status</th>
              <th className="min-w-[90px] px-6 py-4 text-right">Actions</th>
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
                    <DealerActionMenu
                      dealer={dealer}
                      isOpen={openMenuId === dealer.id}
                      onToggle={(e) => {
                        e.stopPropagation();
                        setOpenMenuId((prev) => (prev === dealer.id ? null : dealer.id));
                      }}
                      onClose={() => setOpenMenuId(null)}
                      onSelectDealer={onSelectDealer}
                      onEditDealer={onEditDealer}
                      onModerateDealer={onModerateDealer}
                      onAssignBrandDealer={onAssignBrandDealer}
                      onManageServiceCenter={onManageServiceCenter}
                    />
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
