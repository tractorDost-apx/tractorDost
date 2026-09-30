import React from 'react';
import { User, Phone, Trash2, ShieldCheck, Mail, MessageSquare } from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';

export interface EnquiryListing {
  id: number;
  tractorBrand?: string | { name: string };
  tractorModel?: string | { name: string };
  sellerId?: number;
  listingStatus?: string;
}

export interface Enquiry {
  id: number;
  listingId: number;
  buyerId: number | null;
  name: string;
  mobile: string;
  message: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  listing?: EnquiryListing;
}

interface EnquiryRowProps {
  enquiry: Enquiry;
  updatingId: number | null;
  onUpdateStatus: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  NEW: ['ATTEMPTED', 'SPAM'],
  ATTEMPTED: ['CONTACTED', 'SPAM'],
  CONTACTED: ['QUALIFIED', 'LOST', 'SPAM'],
  QUALIFIED: ['INTERESTED', 'LOST', 'SPAM'],
  INTERESTED: ['CONVERTED', 'LOST', 'SPAM'],
  DEALER_ASSIGNED: ['CONTACTED', 'CONVERTED', 'LOST', 'SPAM'],
  CONVERTED: [],
  LOST: ['SPAM'],
  SPAM: [],
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'NEW':
      return (
        <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-black text-blue-500 uppercase">
          New
        </span>
      );
    case 'ATTEMPTED':
      return (
        <span className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-xs font-black text-indigo-500 uppercase">
          Attempted
        </span>
      );
    case 'CONTACTED':
      return (
        <span className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-black text-amber-500 uppercase">
          Contacted
        </span>
      );
    case 'QUALIFIED':
      return (
        <span className="rounded-lg border border-teal-500/20 bg-teal-500/10 px-2.5 py-1 text-xs font-black text-teal-500 uppercase">
          Qualified
        </span>
      );
    case 'INTERESTED':
      return (
        <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-black text-emerald-500 uppercase">
          Interested
        </span>
      );
    case 'DEALER_ASSIGNED':
      return (
        <span className="rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-xs font-black text-purple-500 uppercase">
          Dealer Assigned
        </span>
      );
    case 'CONVERTED':
      return (
        <span className="rounded-lg border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-black text-green-500 uppercase">
          Converted
        </span>
      );
    case 'LOST':
      return (
        <span className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-black text-red-500 uppercase">
          Lost
        </span>
      );
    case 'SPAM':
      return (
        <span className="rounded-lg border border-rose-500/10 bg-rose-950/20 px-2.5 py-1 text-xs font-black text-rose-400 uppercase">
          Spam
        </span>
      );
    default:
      return (
        <span className="bg-foreground/10 text-foreground border-foreground/20 rounded-lg border px-2.5 py-1 text-xs font-black uppercase">
          {status}
        </span>
      );
  }
};

const formatStatusLabel = (status: string) => {
  return status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ');
};

export const EnquiryRow: React.FC<EnquiryRowProps> = ({
  enquiry,
  updatingId,
  onUpdateStatus,
  onDelete,
}) => {
  const listing = enquiry.listing;
  const brandName =
    typeof listing?.tractorBrand === 'object' ? listing.tractorBrand.name : listing?.tractorBrand;
  const modelName =
    typeof listing?.tractorModel === 'object' ? listing.tractorModel.name : listing?.tractorModel;

  const allowedNext = VALID_TRANSITIONS[enquiry.status] || [];
  const selectOptions = [enquiry.status, ...allowedNext];

  return (
    <tr className="hover:bg-foreground/[0.01] transition-colors duration-200">
      <td className="px-6 py-4.5">
        <div className="flex flex-col">
          <span className="text-foreground flex items-center gap-1.5 font-black">
            <User size={14} className="text-muted opacity-80" />
            {enquiry.name}
          </span>
          <span className="text-muted mt-1 flex items-center gap-1.5 text-xs font-bold">
            <Phone size={12} className="text-muted opacity-70" />
            {enquiry.mobile}
          </span>
        </div>
      </td>

      <td className="px-6 py-4.5">
        <div className="flex flex-col">
          <span className="text-foreground font-bold">Listing #{enquiry.listingId}</span>
          {brandName && (
            <span className="text-muted mt-0.5 flex items-center gap-1 text-xs font-medium">
              {brandName} {modelName}
            </span>
          )}
        </div>
      </td>

      <td className="max-w-xs px-6 py-4.5">
        <div className="text-foreground/95 flex items-start gap-1.5 text-sm font-medium break-words">
          <MessageSquare size={14} className="text-muted mt-0.5 shrink-0" />
          <p>{enquiry.message || <em className="text-muted opacity-60">No message</em>}</p>
        </div>
        <span className="text-muted mt-1 block text-[10px] font-bold">
          Received:{' '}
          {new Date(enquiry.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </td>

      <td className="px-6 py-4.5">{getStatusBadge(enquiry.status)}</td>

      <td className="px-6 py-4.5 text-right">
        <div className="flex items-center justify-end gap-3">
          {updatingId === enquiry.id ? (
            <TractorLoader size={20} />
          ) : (
            <select
              className="bg-foreground/5 hover:bg-foreground/10 cursor-pointer rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-bold transition-all outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
              value={enquiry.status}
              onChange={(e) => onUpdateStatus(enquiry.id, e.target.value)}
              disabled={selectOptions.length <= 1}
            >
              {selectOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {formatStatusLabel(opt)}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this enquiry?')) {
                onDelete(enquiry.id);
              }
            }}
            className="text-muted rounded-xl p-2 transition-all hover:bg-red-500/10 hover:text-red-500"
            title="Delete Enquiry"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};
