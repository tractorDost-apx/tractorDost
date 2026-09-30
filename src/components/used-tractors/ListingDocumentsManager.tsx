'use client';

import React, { useState } from 'react';
import { CheckCircle2, FileText, ImagePlus, Loader2, Lock, Trash2, Upload } from 'lucide-react';
import { usedTractorDocumentAPI } from '@/lib/api/used-documents';
import { useApiQuery } from '@/hooks/ui/use-api-query';
import {
  ALLOWED_DOCUMENT_MIME,
  MAX_DOCUMENT_BYTES,
  PHOTO_DOC_TYPES,
  PRIVATE_DOC_TYPES,
  docTypeLabel,
  isPhotoDocType,
} from '@/lib/constants/listing-statuses';
import type { DocType, UsedDocument } from '@/types/models/used-listing';

interface ListingDocumentsManagerProps {
  listingId: number;
  /** Uploads/deletes are disabled for removed or sold listings */
  readOnly?: boolean;
}

const FIELD_CLASS =
  'bg-secondary/20 border border-border/50 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 transition-all';

/**
 * Seller-side manager for a listing's photos and papers, backed by the
 * documents API (which enforces listing ownership on every call).
 */
export default function ListingDocumentsManager({
  listingId,
  readOnly = false,
}: ListingDocumentsManagerProps) {
  const { data, loading, error, reload } = useApiQuery(
    () => usedTractorDocumentAPI.getAllDocuments({ listingId, limit: 50 }),
    [listingId]
  );
  const [docType, setDocType] = useState<DocType>('FRONT_VIEW');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const documents = data?.data ?? [];
  const photos = documents.filter((d) => isPhotoDocType(d.docType));
  const papers = documents.filter((d) => !isPhotoDocType(d.docType));

  const handleFiles = (list: FileList | null) => {
    setMessage(null);
    const picked = Array.from(list ?? []);
    const invalid = picked.find(
      (f) => !ALLOWED_DOCUMENT_MIME.includes(f.type) || f.size > MAX_DOCUMENT_BYTES
    );
    if (invalid) {
      setMessage({
        type: 'error',
        text: `"${invalid.name}" must be a JPEG, PNG or PDF under 5 MB.`,
      });
      setFiles([]);
      return;
    }
    setFiles(picked);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setMessage(null);
    let failed = 0;
    for (const file of files) {
      const formData = new FormData();
      formData.append('listingId', String(listingId));
      formData.append('docType', docType);
      formData.append('document', file);
      const res = await usedTractorDocumentAPI.uploadDocument(formData);
      if (!res.success) failed += 1;
    }
    setUploading(false);
    setFiles([]);
    setMessage(
      failed === 0
        ? { type: 'success', text: 'Upload complete' }
        : { type: 'error', text: `${failed} of ${files.length} file(s) failed to upload` }
    );
    reload();
  };

  const handleDelete = async (doc: UsedDocument) => {
    if (!window.confirm(`Delete this ${docTypeLabel(doc.docType)}?`)) return;
    setDeletingId(doc.id);
    const res = await usedTractorDocumentAPI.deleteDocument(doc.id);
    setDeletingId(null);
    setMessage({ type: res.success ? 'success' : 'error', text: res.message });
    if (res.success) reload();
  };

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="glass-inner space-y-4 p-5">
          <h3 className="text-foreground flex items-center gap-2 font-bold">
            <Upload size={18} className="text-lime-400" /> Add photos or documents
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[200px_1fr_auto]">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocType)}
              className={FIELD_CLASS}
            >
              <optgroup label="Photos (shown to buyers)">
                {PHOTO_DOC_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Papers (private)">
                {PRIVATE_DOC_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </optgroup>
            </select>
            <input
              type="file"
              multiple
              accept={ALLOWED_DOCUMENT_MIME.join(',')}
              onChange={(e) => handleFiles(e.target.files)}
              className={`${FIELD_CLASS} file:mr-3 file:rounded-full file:border-0 file:bg-lime-400/10 file:px-3 file:py-1 file:text-lime-400`}
            />
            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="glass-button flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-lime-400 disabled:opacity-40"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
              Upload{files.length > 1 ? ` (${files.length})` : ''}
            </button>
          </div>
          <p className="text-muted text-xs">
            JPEG, PNG or PDF, up to 5 MB each. RC, insurance and NOC copies are never shown
            publicly.
          </p>
        </div>
      )}

      {message && (
        <p
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            message.type === 'success'
              ? 'border-lime-400/30 bg-lime-400/10 text-lime-300'
              : 'border-red-500/30 bg-red-500/10 text-red-400'
          }`}
        >
          {message.text}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-lime-400" size={28} />
        </div>
      ) : error ? (
        <p className="font-medium text-red-400">{error}</p>
      ) : (
        <>
          <section>
            <h3 className="text-foreground mb-3 font-bold">Photos ({photos.length})</h3>
            {photos.length === 0 ? (
              <p className="text-muted text-sm">
                No photos yet. Listings with photos get far more enquiries.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {photos.map((doc) => (
                  <div key={doc.id} className="glass-inner group relative overflow-hidden p-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={doc.url}
                      alt={docTypeLabel(doc.docType)}
                      className="h-32 w-full object-cover"
                    />
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-muted text-xs font-bold">
                        {docTypeLabel(doc.docType)}
                      </span>
                      {!readOnly && (
                        <button
                          onClick={() => handleDelete(doc)}
                          disabled={deletingId === doc.id}
                          className="text-muted hover:text-red-400 disabled:opacity-40"
                          aria-label="Delete photo"
                        >
                          {deletingId === doc.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="text-foreground mb-3 flex items-center gap-2 font-bold">
              <Lock size={16} className="text-muted" /> Private papers ({papers.length})
            </h3>
            {papers.length === 0 ? (
              <p className="text-muted text-sm">
                No papers uploaded. Verified RC and NOC build buyer trust.
              </p>
            ) : (
              <ul className="space-y-2">
                {papers.map((doc) => (
                  <li
                    key={doc.id}
                    className="glass-inner flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground flex items-center gap-2 text-sm font-bold hover:text-lime-400"
                    >
                      <FileText size={16} /> {docTypeLabel(doc.docType)}
                    </a>
                    <div className="flex items-center gap-3">
                      {doc.verifiedAt ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-lime-400">
                          <CheckCircle2 size={14} /> Verified
                        </span>
                      ) : (
                        <span className="text-muted text-xs font-bold">Pending verification</span>
                      )}
                      {!readOnly && (
                        <button
                          onClick={() => handleDelete(doc)}
                          disabled={deletingId === doc.id}
                          className="text-muted hover:text-red-400 disabled:opacity-40"
                          aria-label="Delete document"
                        >
                          {deletingId === doc.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
