'use client';

import React, { useState, useEffect } from 'react';
import { usedTractorDocumentAPI } from '@/lib/api/used-documents';
import { FileText, CheckCircle2 } from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Pagination from '@/components/shared/Pagination';
import type { UsedDocument } from '@/types/models/used-listing';

export default function AdminUsedDocumentsPage() {
  const [documents, setDocuments] = useState<UsedDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = () => {
    setLoading(true);
    usedTractorDocumentAPI.getAllDocuments({ limit: 50 }).then((res) => {
      if (res.success && res.data) {
        setDocuments(res.data.data);
      }
      setLoading(false);
    });
  };

  // The backend only supports verifying (stamps verifiedAt); there is no reject action
  const verifyDoc = (id: number) => {
    usedTractorDocumentAPI.verifyDocument(id).then((res) => {
      if (res.success) {
        fetchDocs();
      }
    });
  };

  return (
    <div className="animate-fade-in w-full space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-black tracking-tight">
            Document Verification
          </h1>
          <p className="text-muted mt-1 font-medium">Review RC and Loan Clearance documents.</p>
        </div>
      </div>

      <div className="bg-background overflow-hidden rounded-3xl border border-[var(--border-subtle)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-foreground/5 border-b border-[var(--border-subtle)]">
                <th className="text-muted px-6 py-4 text-xs font-black tracking-wider uppercase">
                  Listing ID
                </th>
                <th className="text-muted px-6 py-4 text-xs font-black tracking-wider uppercase">
                  Doc Type
                </th>
                <th className="text-muted px-6 py-4 text-xs font-black tracking-wider uppercase">
                  File
                </th>
                <th className="text-muted px-6 py-4 text-xs font-black tracking-wider uppercase">
                  Status
                </th>
                <th className="text-muted px-6 py-4 text-right text-xs font-black tracking-wider uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-foreground/10 divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <TractorLoader
                      className="mx-auto mb-2 text-[var(--color-brand-green)]"
                      size={48}
                    />
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-muted px-6 py-12 text-center font-medium">
                    No documents pending review.
                  </td>
                </tr>
              ) : (
                documents.slice((page - 1) * limit, page * limit).map((doc) => (
                  <tr key={doc.id} className="hover:bg-foreground/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold">#{doc.listingId}</td>
                    <td className="px-6 py-4 font-bold uppercase">{doc.docType}</td>
                    <td className="px-6 py-4">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm font-bold text-blue-500 underline"
                      >
                        <FileText size={14} /> View Document
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded px-2 py-1 text-xs font-bold uppercase ${doc.verifiedAt ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}
                      >
                        {doc.verifiedAt ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!doc.verifiedAt && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => verifyDoc(doc.id)}
                            title="Mark as verified"
                            className="rounded bg-emerald-500/10 p-2 text-emerald-500 transition-colors hover:bg-emerald-500 hover:text-white"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && documents.length > 0 && (
          <Pagination
            page={page}
            limit={limit}
            totalCount={documents.length}
            totalPages={Math.ceil(documents.length / limit)}
            onPageChange={setPage}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}
