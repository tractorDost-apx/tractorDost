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
      return <span className="px-2.5 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg text-xs font-black uppercase">New</span>;
    case 'ATTEMPTED':
      return <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-lg text-xs font-black uppercase">Attempted</span>;
    case 'CONTACTED':
      return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg text-xs font-black uppercase">Contacted</span>;
    case 'QUALIFIED':
      return <span className="px-2.5 py-1 bg-teal-500/10 text-teal-500 border border-teal-500/20 rounded-lg text-xs font-black uppercase">Qualified</span>;
    case 'INTERESTED':
      return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-xs font-black uppercase">Interested</span>;
    case 'DEALER_ASSIGNED':
      return <span className="px-2.5 py-1 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-lg text-xs font-black uppercase">Dealer Assigned</span>;
    case 'CONVERTED':
      return <span className="px-2.5 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-xs font-black uppercase">Converted</span>;
    case 'LOST':
      return <span className="px-2.5 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-xs font-black uppercase">Lost</span>;
    case 'SPAM':
      return <span className="px-2.5 py-1 bg-rose-950/20 text-rose-400 border border-rose-500/10 rounded-lg text-xs font-black uppercase">Spam</span>;
    default:
      return <span className="px-2.5 py-1 bg-foreground/10 text-foreground border border-foreground/20 rounded-lg text-xs font-black uppercase">{status}</span>;
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
  const brandName = typeof listing?.tractorBrand === 'object' ? listing.tractorBrand.name : listing?.tractorBrand;
  const modelName = typeof listing?.tractorModel === 'object' ? listing.tractorModel.name : listing?.tractorModel;

  const allowedNext = VALID_TRANSITIONS[enquiry.status] || [];
  const selectOptions = [enquiry.status, ...allowedNext];

  return (
    <tr className="hover:bg-foreground/[0.01] transition-colors duration-200">
      <td className="px-6 py-4.5">
        <div className="flex flex-col">
          <span className="font-black text-foreground flex items-center gap-1.5">
            <User size={14} className="text-muted opacity-80" />
            {enquiry.name}
          </span>
          <span className="text-xs font-bold text-muted mt-1 flex items-center gap-1.5">
            <Phone size={12} className="text-muted opacity-70" />
            {enquiry.mobile}
          </span>
        </div>
      </td>

      <td className="px-6 py-4.5">
        <div className="flex flex-col">
          <span className="font-bold text-foreground">
            Listing #{enquiry.listingId}
          </span>
          {brandName && (
            <span className="text-xs font-medium text-muted mt-0.5 flex items-center gap-1">
              {brandName} {modelName}
            </span>
          )}
        </div>
      </td>

      <td className="px-6 py-4.5 max-w-xs">
        <div className="text-sm font-medium text-foreground/95 break-words flex items-start gap-1.5">
          <MessageSquare size={14} className="text-muted shrink-0 mt-0.5" />
          <p>{enquiry.message || <em className="text-muted opacity-60">No message</em>}</p>
        </div>
        <span className="text-[10px] text-muted font-bold block mt-1">
          Received: {new Date(enquiry.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </td>

      <td className="px-6 py-4.5">
        {getStatusBadge(enquiry.status)}
      </td>

      <td className="px-6 py-4.5 text-right">
        <div className="flex items-center justify-end gap-3">
          {updatingId === enquiry.id ? (
            <TractorLoader size={20} />
          ) : (
            <select
              className="bg-foreground/5 hover:bg-foreground/10 border border-[var(--border-subtle)] text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer transition-all focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
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
            className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            title="Delete Enquiry"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};
