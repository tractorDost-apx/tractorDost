'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  ImagePlus,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Eye,
  Camera,
} from 'lucide-react';
import { usedTractorDocumentAPI } from '@/lib/api/used-documents';
import {
  ALLOWED_DOCUMENT_MIME,
  MAX_DOCUMENT_BYTES,
  PHOTO_DOC_TYPES,
  PRIVATE_DOC_TYPES,
  docTypeLabel,
  isPhotoDocType,
} from '@/lib/constants/listing-statuses';
import type { DocType, UsedDocument } from '@/types/models/used-listing';

interface DealerListingDocumentsModalProps {
  listingId: number | null;
  listingTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onPhotosUpdated?: () => void;
}

export function DealerListingDocumentsModal({
  listingId,
  listingTitle,
  isOpen,
  onClose,
  onPhotosUpdated,
}: DealerListingDocumentsModalProps) {
  const [documents, setDocuments] = useState<UsedDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [docType, setDocType] = useState<DocType>('FRONT_VIEW');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [previewDoc, setPreviewDoc] = useState<UsedDocument | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDocs = async () => {
    if (!listingId) return;
    setLoading(true);
    try {
      const res = await usedTractorDocumentAPI.getAllDocuments({ listingId, limit: 50 });
      if (res.success && res.data) {
        setDocuments(res.data.data || []);
      }
    } catch (err: any) {
      console.error('Error fetching listing documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && listingId) {
      fetchDocs();
      setNotice(null);
      setSelectedFiles([]);
      setPreviewDoc(null);
    }
  }, [isOpen, listingId]);

  if (!isOpen || !listingId) return null;

  const photos = documents.filter((d) => isPhotoDocType(d.docType));
  const papers = documents.filter((d) => !isPhotoDocType(d.docType));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotice(null);
    if (!e.target.files) return;
    const picked = Array.from(e.target.files);
    const invalid = picked.find(
      (f) => !ALLOWED_DOCUMENT_MIME.includes(f.type) || f.size > MAX_DOCUMENT_BYTES
    );
    if (invalid) {
      setNotice({
        type: 'error',
        text: `"${invalid.name}" must be a JPEG, PNG, or PDF under 5 MB.`,
      });
      setSelectedFiles([]);
      return;
    }
    setSelectedFiles(picked);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setNotice(null);
    let successCount = 0;
    let lastError = '';

    for (const file of selectedFiles) {
      const form = new FormData();
      form.append('document', file);
      form.append('listingId', String(listingId));
      form.append('docType', docType);

      const res = await usedTractorDocumentAPI.uploadDocument(form);
      if (res.success) {
        successCount++;
      } else {
        lastError = res.message || 'Upload failed';
      }
    }

    setUploading(false);
    setSelectedFiles([]);

    if (successCount > 0) {
      setNotice({
        type: 'success',
        text: `${successCount} file(s) uploaded successfully as ${docTypeLabel(docType)}.`,
      });
      fetchDocs();
      onPhotosUpdated?.();
    } else {
      setNotice({ type: 'error', text: lastError || 'Failed to upload files.' });
    }
  };

  const handleDelete = async (docId: number) => {
    if (!window.confirm('Delete this photo / document from the listing?')) return;
    setDeletingId(docId);
    setNotice(null);

    const res = await usedTractorDocumentAPI.deleteDocument(docId);
    setDeletingId(null);

    if (res.success) {
      setNotice({ type: 'success', text: 'Document deleted successfully.' });
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      onPhotosUpdated?.();
    } else {
      setNotice({ type: 'error', text: res.message || 'Failed to delete document.' });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-h-[80vh] overflow-y-auto w-full max-w-4xl rounded-2xl border border-lime-400/20 bg-[var(--background)] p-6 shadow-2xl md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
              <Camera size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground">
                Manage Photos & Papers
              </h2>
              <p className="text-xs text-muted font-medium">
                {listingTitle || `Listing #${listingId}`} &bull; Upload exterior views, meter reading, and registration documents
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted hover:bg-foreground/5 hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notice */}
        {notice && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-xl border p-3.5 text-xs font-semibold ${
              notice.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-red-500/30 bg-red-500/10 text-red-400'
            }`}
          >
            {notice.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notice.text}</span>
          </div>
        )}

        <div className="mt-6 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Upload Form */}
          <form
            onSubmit={handleUpload}
            className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 p-4 space-y-4"
          >
            <h3 className="text-xs font-black uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
              <Upload size={14} /> Upload New Photo or Document
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold text-muted mb-1">
                  Document Classification
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as DocType)}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-semibold text-foreground focus:border-lime-400 focus:outline-none"
                >
                  <optgroup label="Tractor Photos (Public Marketplace)">
                    {PHOTO_DOC_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Verification Papers (Private Documents)">
                    {PRIVATE_DOC_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="sm:col-span-5">
                <label className="block text-[11px] font-bold text-muted mb-1">
                  Select Files (Max 5MB each)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleFileChange}
                  className="w-full text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-lime-400/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-lime-400 hover:file:bg-lime-400/20"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  disabled={uploading || selectedFiles.length === 0}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-lime-400 px-4 py-2 text-xs font-bold text-black shadow-md shadow-lime-400/20 hover:bg-lime-300 disabled:opacity-40 transition-all"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={14} /> Upload {selectedFiles.length ? `(${selectedFiles.length})` : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Existing Photos Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImagePlus size={14} className="text-lime-400" /> Public Tractor Photos ({photos.length})
              </span>
              <span className="text-[11px] font-medium text-muted">Visible to buyers</span>
            </h3>

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-lime-400" size={24} />
              </div>
            ) : photos.length === 0 ? (
              <p className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-6 text-center text-xs text-muted">
                No tractor photos uploaded yet. Upload front, rear, and meter photos to increase buyer trust.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {photos.map((doc) => (
                  <div
                    key={doc.id}
                    className="group relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-foreground/5"
                  >
                    <div className="aspect-[4/3] w-full bg-[var(--background)]">
                      <img src={doc.url} alt={docTypeLabel(doc.docType)} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted truncate max-w-[100px]">
                        {docTypeLabel(doc.docType)}
                      </span>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        className="rounded-lg p-1 text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        title="Delete photo"
                      >
                        {deletingId === doc.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legal / Private Documents */}
          <div className="space-y-3 border-t border-[var(--border-subtle)] pt-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText size={14} className="text-purple-400" /> Registration & Clearances ({papers.length})
              </span>
              <span className="text-[11px] font-medium text-muted">Private &bull; Dealership verification</span>
            </h3>

            {papers.length === 0 ? (
              <p className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-4 text-center text-xs text-muted">
                No private papers (RC / Insurance / NOC) uploaded.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {papers.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-foreground/5 p-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{docTypeLabel(doc.docType)}</p>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-lime-400 hover:underline flex items-center gap-1"
                        >
                          <Eye size={11} /> View Document
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="rounded-lg p-1.5 text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors ml-2"
                      title="Delete document"
                    >
                      {deletingId === doc.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-[var(--border-subtle)] pt-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-foreground/10 px-5 py-2 text-xs font-bold text-foreground hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
