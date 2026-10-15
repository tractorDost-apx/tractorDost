import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Eye,
  PhoneCall,
  FileText,
  UserCheck,
  Trash2,
  MoreVertical,
  MapPin,
  Mail,
  Phone,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  Inbox,
  AlertCircle,
  Copy,
  ChevronDown,
} from 'lucide-react';
import { Lead, LeadStatus, LeadType } from '@/lib/api/leads';
import {
  LeadStatusBadge,
  LeadTypeBadge,
  IntentScoreBadge,
  FollowupBadge,
} from './LeadStatusBadge';
import { LEAD_STATUSES } from './LeadFilters';

interface LeadTableProps {
  leads: Lead[];
  loading: boolean;
  selectedLeadIds: number[];
  onToggleSelect: (id: number) => void;
  onSelectAll: () => void;
  onViewLead: (lead: Lead) => void;
  onQuickStatusChange: (lead: Lead, status: LeadStatus) => void;
  onQuickAssign: (lead: Lead) => void;
  onLogCall: (lead: Lead) => void;
  onAddNote: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onSortChange: (sortBy: any) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  canDelete: boolean;
}

interface ActionMenuProps {
  lead: Lead;
  isOpen: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onClose: () => void;
  onView: () => void;
  onQuickAssign: () => void;
  onLogCall: () => void;
  onAddNote: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

function LeadActionMenu({
  lead,
  isOpen,
  onToggle,
  onClose,
  onView,
  onQuickAssign,
  onLogCall,
  onAddNote,
  onDelete,
  canDelete,
}: ActionMenuProps) {
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
        const menuWidth = 200;
        let left = rect.right - menuWidth;
        if (left < 10) left = 10;

        let top = rect.bottom + 6;
        if (top + 230 > window.innerHeight && rect.top > 230) {
          top = rect.top - 230;
        }

        setMenuPos({ top, left });
      }
    };

    updatePosition();

    const handleScrollOrResize = () => onClose();
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
    mounted && isOpen
      ? createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: `${menuPos.top}px`,
              left: `${menuPos.left}px`,
              zIndex: 9999,
            }}
            className="w-48 overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-background/95 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onView();
                }}
                className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-foreground transition-colors hover:bg-[#4a7635]/15 hover:text-[#4a7635]"
              >
                <Eye size={14} className="text-muted group-hover:text-[#4a7635]" />
                <span>View Details</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onQuickAssign();
                }}
                className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-foreground transition-colors hover:bg-sky-500/15 hover:text-sky-400"
              >
                <UserCheck size={14} className="text-muted group-hover:text-sky-400" />
                <span>Assign Agent</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogCall();
                }}
                className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-foreground transition-colors hover:bg-indigo-500/15 hover:text-indigo-400"
              >
                <PhoneCall size={14} className="text-muted group-hover:text-indigo-400" />
                <span>Log Phone Call</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAddNote();
                }}
                className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-foreground transition-colors hover:bg-amber-500/15 hover:text-amber-400"
              >
                <FileText size={14} className="text-muted group-hover:text-amber-400" />
                <span>Add Note</span>
              </button>

              {canDelete && lead.status !== 'CONVERTED' && (
                <>
                  <div className="my-1 border-t border-[var(--border-subtle)]" />
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onDelete();
                    }}
                    className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-400 transition-colors hover:bg-rose-500/15"
                  >
                    <Trash2 size={14} className="text-rose-400" />
                    <span>Delete Lead</span>
                  </button>
                </>
              )}
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
        className={`inline-flex items-center justify-center rounded-xl p-2 transition-all ${
          isOpen
            ? 'bg-foreground/15 text-foreground'
            : 'text-muted hover:bg-foreground/10 hover:text-foreground'
        }`}
        title="More Actions"
      >
        <MoreVertical size={16} />
      </button>
      {menuPortal}
    </>
  );
}

export function LeadTable({
  leads,
  loading,
  selectedLeadIds,
  onToggleSelect,
  onSelectAll,
  onViewLead,
  onQuickStatusChange,
  onQuickAssign,
  onLogCall,
  onAddNote,
  onDeleteLead,
  onSortChange,
  sortBy,
  sortOrder,
  canDelete,
}: LeadTableProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const formatBudget = (budget?: number | null) => {
    if (!budget || budget === 0) return 'Not specified';
    if (budget >= 100000) {
      return `₹${(budget / 100000).toFixed(2)} Lakh`;
    }
    return `₹${budget.toLocaleString('en-IN')}`;
  };

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown size={12} className="text-muted/60 opacity-0 group-hover:opacity-100" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp size={12} className="text-[#4a7635]" />
    ) : (
      <ArrowDown size={12} className="text-[#4a7635]" />
    );
  };

  if (loading) {
    return (
      <div className="glass-panel w-full rounded-2xl border border-[var(--border-subtle)] p-6">
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-foreground/5" />
          ))}
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="glass-panel flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--border-subtle)] p-12 text-center">
        <div className="rounded-2xl bg-foreground/5 p-4 text-muted">
          <Inbox size={40} className="text-muted" />
        </div>
        <h3 className="text-lg font-bold text-foreground">No leads found</h3>
        <p className="max-w-md text-xs font-medium text-muted">
          No customer inquiries matched your current filter criteria or search query. Try clearing or
          loosening filter attributes.
        </p>
      </div>
    );
  }

  const allSelected = leads.length > 0 && selectedLeadIds.length === leads.length;

  return (
    <div className="glass-panel relative flex w-full flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="sticky top-0 z-10 border-b border-[var(--border-subtle)] bg-foreground/5 text-[10px] font-black tracking-wider uppercase text-muted backdrop-blur-md">
            <tr>
              {/* Checkbox */}
              <th className="w-10 px-3 py-3.5 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="h-4 w-4 rounded border-[var(--border-subtle)] bg-background text-[#4a7635] accent-[#4a7635] focus:ring-0 cursor-pointer"
                  title="Select All"
                />
              </th>

              {/* ID & Date */}
              <th
                onClick={() => onSortChange('createdAt')}
                className="group cursor-pointer px-3 py-3.5 hover:text-foreground transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Lead # / Created</span>
                  {renderSortIcon('createdAt')}
                </div>
              </th>

              {/* Customer */}
              <th
                onClick={() => onSortChange('name')}
                className="group cursor-pointer px-3 py-3.5 hover:text-foreground transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Customer Info</span>
                  {renderSortIcon('name')}
                </div>
              </th>

              {/* Lead Type & Source */}
              <th
                onClick={() => onSortChange('leadType')}
                className="group cursor-pointer px-3 py-3.5 hover:text-foreground transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Enquiry Type</span>
                  {renderSortIcon('leadType')}
                </div>
              </th>

              {/* Interested Product */}
              <th className="px-3 py-3.5">Interested Product & Budget</th>

              {/* Assignment */}
              <th className="px-3 py-3.5">Assigned Agent / Dealer</th>

              {/* Intent Score */}
              <th
                onClick={() => onSortChange('intentScore')}
                className="group cursor-pointer px-3 py-3.5 hover:text-foreground transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Intent</span>
                  {renderSortIcon('intentScore')}
                </div>
              </th>

              {/* Status */}
              <th
                onClick={() => onSortChange('status')}
                className="group cursor-pointer px-3 py-3.5 hover:text-foreground transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>CRM Status</span>
                  {renderSortIcon('status')}
                </div>
              </th>

              {/* Next Follow-up */}
              <th
                onClick={() => onSortChange('nextFollowupAt')}
                className="group cursor-pointer px-3 py-3.5 hover:text-foreground transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Next Follow-up</span>
                  {renderSortIcon('nextFollowupAt')}
                </div>
              </th>

              {/* Actions */}
              <th className="px-3 py-3.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border-subtle)]/50">
            {leads.map((lead) => {
              const isSelected = selectedLeadIds.includes(lead.id);
              const formattedDate = new Date(lead.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });
              const formattedTime = new Date(lead.createdAt).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });

              return (
                <tr
                  key={lead.id}
                  onClick={() => onViewLead(lead)}
                  className={`group cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#4a7635]/10 hover:bg-[#4a7635]/15' : 'hover:bg-foreground/5'
                  }`}
                >
                  {/* Checkbox */}
                  <td
                    className="px-3 py-3.5 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(lead.id)}
                      className="h-4 w-4 rounded border-[var(--border-subtle)] bg-background text-[#4a7635] accent-[#4a7635] focus:ring-0 cursor-pointer"
                    />
                  </td>

                  {/* ID & Date */}
                  <td className="px-3 py-3.5">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-black text-foreground">
                          #{lead.id}
                        </span>
                        {lead.isDuplicate && (
                          <span
                            className="inline-flex items-center gap-0.5 rounded bg-purple-500/10 px-1 py-0.2 text-[9px] font-black text-purple-400 border border-purple-500/20"
                            title="Duplicate Inquiry"
                          >
                            <Copy size={9} />
                            DUP
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted font-medium">
                        {formattedDate} {formattedTime}
                      </span>
                    </div>
                  </td>

                  {/* Customer Information */}
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4a7635]/30 to-amber-500/20 text-xs font-black text-foreground">
                        {getInitials(lead.name || 'User')}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-foreground group-hover:text-[#4a7635] transition-colors">
                          {lead.name}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-muted">
                          <span className="flex items-center gap-0.5 font-mono text-foreground/80">
                            <Phone size={10} className="text-muted" />
                            {lead.mobile}
                          </span>
                          {(lead.district || lead.state) && (
                            <span className="flex items-center gap-0.5 font-medium text-muted truncate max-w-[120px]">
                              <MapPin size={10} className="shrink-0 text-muted" />
                              {lead.district || lead.state}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Enquiry Type & Source */}
                  <td className="px-3 py-3.5">
                    <div className="flex flex-col gap-1 items-start">
                      <LeadTypeBadge type={lead.leadType} />
                      {lead.sourcePage && (
                        <span className="text-[10px] text-muted font-mono truncate max-w-[110px]" title={lead.sourcePage}>
                          src: {lead.sourcePage}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Interested Product & Budget */}
                  <td className="px-3 py-3.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[12px] font-bold text-foreground/90">
                        {lead.interestedModel || lead.tractor?.modelName || (
                          <span className="text-muted italic">General Enquiry</span>
                        )}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted">
                        {lead.interestedBrand && (
                          <span className="font-semibold text-foreground/70">
                            {lead.interestedBrand}
                          </span>
                        )}
                        {lead.budget ? (
                          <span className="font-bold text-emerald-400">
                            Budget: {formatBudget(Number(lead.budget))}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  {/* Assigned Agent / Dealer */}
                  <td className="px-3 py-3.5">
                    <div className="flex flex-col gap-0.5 items-start">
                      {lead.assignedAgent ? (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[11px] font-bold text-sky-400">
                          👤 {lead.assignedAgent.fullName}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickAssign(lead);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-400 hover:bg-amber-500/20 transition-colors"
                        >
                          ⚡ Unassigned
                        </button>
                      )}
                      {lead.dealer && (
                        <span className="text-[10px] font-semibold text-muted truncate max-w-[130px]" title={lead.dealer.businessName}>
                          Dealer: {lead.dealer.businessName}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Intent Score */}
                  <td className="px-3 py-3.5">
                    <IntentScoreBadge score={lead.intentScore} />
                  </td>

                  {/* Status & Inline Changer */}
                  <td
                    className="px-3 py-3.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative inline-block">
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          onQuickStatusChange(lead, e.target.value as LeadStatus)
                        }
                        className="cursor-pointer appearance-none rounded-full border border-transparent py-1 pr-6 pl-2 text-xs font-black outline-none transition-all hover:ring-2 hover:ring-[var(--border-subtle)] focus:ring-2 focus:ring-[#4a7635]"
                        style={{ background: 'transparent' }}
                      >
                        {LEAD_STATUSES.map((st) => (
                          <option key={st.value} value={st.value} className="bg-background text-foreground">
                            {st.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2.5">
                        <LeadStatusBadge status={lead.status} />
                        <ChevronDown size={11} className="ml-1 text-muted" />
                      </div>
                    </div>
                  </td>

                  {/* Follow-up */}
                  <td className="px-3 py-3.5">
                    <FollowupBadge date={lead.nextFollowupAt} status={lead.status} />
                  </td>

                  {/* Actions */}
                  <td
                    className="px-3 py-3.5 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <LeadActionMenu
                      lead={lead}
                      isOpen={openMenuId === lead.id}
                      onToggle={() =>
                        setOpenMenuId(openMenuId === lead.id ? null : lead.id)
                      }
                      onClose={() => setOpenMenuId(null)}
                      onView={() => onViewLead(lead)}
                      onQuickAssign={() => onQuickAssign(lead)}
                      onLogCall={() => onLogCall(lead)}
                      onAddNote={() => onAddNote(lead)}
                      onDelete={() => onDeleteLead(lead)}
                      canDelete={canDelete}
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
