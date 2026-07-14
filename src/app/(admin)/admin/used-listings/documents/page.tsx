'use client';

import React, { useState, useEffect } from 'react';
import { usedTractorDocumentAPI } from '@/lib/api/used-documents';
import {
  FileText,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';

export default function AdminUsedDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = () => {
    setLoading(true);
    usedTractorDocumentAPI.getAllDocuments().then((res: any) => {
      if (res.success && res.data) {
        setDocuments(res.data);
      }
      setLoading(false);
    });
  };

  const verifyDoc = (id: number, status: string) => {
    usedTractorDocumentAPI.verifyDocument(id, status).then((res: any) => {
      if(res.success) {
        fetchDocs();
      }
    });
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Document Verification</h1>
          <p className="text-muted font-medium mt-1">Review RC and Loan Clearance documents.</p>
        </div>
      </div>

      <div className="bg-background rounded-3xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-foreground/5 border-b border-[var(--border-subtle)]">
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Listing ID</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Doc Type</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">File</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <TractorLoader className="text-[var(--color-brand-green)] mx-auto mb-2" size={48} />
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted font-medium">
                    No documents pending review.
                  </td>
                </tr>
              ) : (
                documents.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-foreground/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold">#{doc.listingId}</td>
                    <td className="px-6 py-4 font-bold uppercase">{doc.docType}</td>
                    <td className="px-6 py-4">
                      <a href={doc.fileUrl} target="_blank" className="text-blue-500 font-bold text-sm underline flex items-center gap-1"><FileText size={14}/> View Document</a>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${doc.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-500' : doc.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {doc.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => verifyDoc(doc.id, 'VERIFIED')} className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded transition-colors"><CheckCircle2 size={16}/></button>
                          <button onClick={() => verifyDoc(doc.id, 'REJECTED')} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"><XCircle size={16}/></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
