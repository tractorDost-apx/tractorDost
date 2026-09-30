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
    <div className="bg-background overflow-hidden rounded-3xl border border-[var(--border-subtle)] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-foreground/5 border-b border-[var(--border-subtle)]">
              <th className="text-muted px-6 py-4 text-xs font-black tracking-wider uppercase">
                Buyer Detail
              </th>
              <th className="text-muted px-6 py-4 text-xs font-black tracking-wider uppercase">
                Listing Ref
              </th>
              <th className="text-muted px-6 py-4 text-xs font-black tracking-wider uppercase">
                Message/Received
              </th>
              <th className="text-muted px-6 py-4 text-xs font-black tracking-wider uppercase">
                Status
              </th>
              <th className="text-muted px-6 py-4 text-right text-xs font-black tracking-wider uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <TractorLoader className="text-[var(--color-brand-green)]" size={48} />
                    <p className="text-muted mt-2 text-sm font-bold">Fetching enquiries...</p>
                  </div>
                </td>
              </tr>
            ) : enquiries.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-muted px-6 py-16 text-center text-sm font-bold">
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
