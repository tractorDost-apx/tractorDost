import React from 'react';
import { EnquiryRow, Enquiry } from './EnquiryRow';
import { TractorLoader } from '@/components/ui/TractorLoader';

interface EnquiryTableProps {
  enquiries: Enquiry[];
  loading: boolean;
  updatingId: number | null;
  onUpdateStatus: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}

export const EnquiryTable: React.FC<EnquiryTableProps> = ({
  enquiries,
  loading,
  updatingId,
  onUpdateStatus,
  onDelete,
}) => {
  return (
    <div className="bg-background rounded-3xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-foreground/5 border-b border-[var(--border-subtle)]">
              <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Buyer Detail</th>
              <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Listing Ref</th>
              <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Message/Received</th>
              <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <TractorLoader className="text-[var(--color-brand-green)]" size={48} />
                    <p className="text-sm font-bold text-muted mt-2">Fetching enquiries...</p>
                  </div>
                </td>
              </tr>
            ) : enquiries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-muted font-bold text-sm">
                  No enquiries found for the selected criteria.
                </td>
              </tr>
            ) : (
              enquiries.map((enquiry) => (
                <EnquiryRow
                  key={enquiry.id}
                  enquiry={enquiry}
                  updatingId={updatingId}
                  onUpdateStatus={onUpdateStatus}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
