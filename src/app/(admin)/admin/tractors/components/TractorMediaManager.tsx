'use client';

import React, { useState, useEffect, useRef } from 'react';
import { mediaAPI, Media } from '@/lib/api/media';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Eye,
  RefreshCw,
  Star,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  ExternalLink,
  Plus,
  ArrowUpDown,
  Maximize2,
} from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';

interface TractorMediaManagerProps {
  tractorId?: number;
  isEdit?: boolean;
  initialMedia?: Media[];
  brochurePdf?: string | null;
  newMediaFiles: File[];
  onNewMediaFilesChange: (files: File[]) => void;
  newBrochureFiles: File[];
  onNewBrochureFilesChange: (files: File[]) => void;
  onMediaUpdated?: (media: Media[]) => void;
}

export default function TractorMediaManager({
  tractorId,
  isEdit = false,
  initialMedia = [],
  brochurePdf,
  newMediaFiles,
  onNewMediaFilesChange,
  newBrochureFiles,
  onNewBrochureFilesChange,
  onMediaUpdated,
}: TractorMediaManagerProps) {
  const [existingMedia, setExistingMedia] = useState<Media[]>(initialMedia || []);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [isUploadingNew, setIsUploadingNew] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null);

  // Hidden file inputs for replacing specific photos
  const replaceInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const replaceBrochureInputRef = useRef<HTMLInputElement | null>(null);
  const newImagesInputRef = useRef<HTMLInputElement | null>(null);
  const newBrochureInputRef = useRef<HTMLInputElement | null>(null);

  // Auto clear alerts after 4 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fetch / refresh media items for this tractor
  const fetchMedia = async () => {
    if (!tractorId) return;
    setLoading(true);
    try {
      const res = await mediaAPI.getAllMedia({
        targetType: 'TRACTOR',
        targetId: tractorId,
        limit: 100,
      });

      if (res.success && res.data) {
        const raw = res.data as any;
        const items: Media[] = Array.isArray(raw.data)
          ? raw.data
          : Array.isArray(raw)
            ? raw
            : [];
        setExistingMedia(items);
        if (onMediaUpdated) {
          onMediaUpdated(items);
        }
      }
    } catch (err) {
      console.error('Failed to fetch tractor media', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tractorId) {
      fetchMedia();
    } else if (initialMedia && initialMedia.length > 0) {
      setExistingMedia(initialMedia);
    }
  }, [tractorId]);

  // Separate images and PDF brochure
  const imageMedia = existingMedia.filter(
    (m) => m.mediaType !== 'pdf' && !m.url?.toLowerCase().endsWith('.pdf')
  );
  const pdfMedia = existingMedia.filter(
    (m) => m.mediaType === 'pdf' || m.url?.toLowerCase().endsWith('.pdf')
  );

  // Format file size
  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Handler: Delete an existing media item
  const handleDeleteMedia = async (item: Media) => {
    const isImage = item.mediaType !== 'pdf';
    const confirmMsg = `Are you sure you want to delete this ${isImage ? 'photo' : 'brochure'}? This will remove it immediately from storage and catalog.`;
    if (!window.confirm(confirmMsg)) return;

    setActionLoadingId(item.id);
    setMessage(null);
    try {
      const res = await mediaAPI.deleteMedia(item.id);
      if (res.success) {
        setMessage({
          type: 'success',
          text: `${isImage ? 'Photo' : 'Brochure'} deleted successfully.`,
        });
        setExistingMedia((prev) => prev.filter((m) => m.id !== item.id));
        if (onMediaUpdated) {
          onMediaUpdated(existingMedia.filter((m) => m.id !== item.id));
        }
      } else {
        setMessage({
          type: 'error',
          text: (res as any).message || 'Failed to delete media item.',
        });
      }
    } catch (error: any) {
      console.error('Error deleting media', error);
      setMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Error occurred while deleting media.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handler: Replace an existing photo with a new one
  const handleReplacePhoto = async (item: Media, file: File) => {
    if (!tractorId) {
      alert('Tractor ID is required to replace media.');
      return;
    }

    setActionLoadingId(item.id);
    setMessage(null);

    try {
      // 1. Upload the new file
      const formData = new FormData();
      formData.append('targetId', String(tractorId));
      formData.append('targetType', 'TRACTOR');
      formData.append('isPrimary', String(item.isPrimary));
      formData.append('mediaType', item.mediaType || 'image');
      formData.append('sortOrder', String(item.sortOrder || 0));
      formData.append('file', file);

      const uploadRes = await mediaAPI.createMedia(formData);

      if (uploadRes.success) {
        // 2. Delete the old photo
        try {
          await mediaAPI.deleteMedia(item.id);
        } catch (delErr) {
          console.warn('Could not delete old media during replace', delErr);
        }

        setMessage({
          type: 'success',
          text: 'Photo replaced successfully with new image!',
        });

        // 3. Refresh media list from server
        await fetchMedia();
      } else {
        setMessage({
          type: 'error',
          text: (uploadRes as any).message || 'Failed to upload replacement photo.',
        });
      }
    } catch (error: any) {
      console.error('Error replacing media', error);
      setMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Failed to replace photo. Please try again.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handler: Replace brochure PDF
  const handleReplaceBrochure = async (existingBrochureItem: Media | null, file: File) => {
    if (!tractorId) {
      alert('Tractor ID is required.');
      return;
    }

    setIsUploadingNew(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('targetId', String(tractorId));
      formData.append('targetType', 'TRACTOR');
      formData.append('mediaType', 'pdf');
      formData.append('file', file);

      const uploadRes = await mediaAPI.createMedia(formData);

      if (uploadRes.success) {
        if (existingBrochureItem) {
          try {
            await mediaAPI.deleteMedia(existingBrochureItem.id);
          } catch (e) {
            console.warn('Could not remove old brochure', e);
          }
        }
        setMessage({
          type: 'success',
          text: 'Brochure PDF updated successfully!',
        });
        await fetchMedia();
      } else {
        setMessage({
          type: 'error',
          text: (uploadRes as any).message || 'Failed to update brochure.',
        });
      }
    } catch (error: any) {
      console.error('Error replacing brochure', error);
      setMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Failed to replace brochure.',
      });
    } finally {
      setIsUploadingNew(false);
    }
  };

  // Handler: Immediate upload for staged new images
  const handleUploadStagedNow = async () => {
    if (!tractorId || newMediaFiles.length === 0) return;

    setIsUploadingNew(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('targetId', String(tractorId));
      formData.append('targetType', 'TRACTOR');
      formData.append('isPrimary', imageMedia.length === 0 ? 'true' : 'false');
      formData.append('mediaType', 'image');
      newMediaFiles.forEach((f) => formData.append('file', f));

      const res = await mediaAPI.createMedia(formData);
      if (res.success) {
        setMessage({
          type: 'success',
          text: `${newMediaFiles.length} photo(s) uploaded successfully!`,
        });
        onNewMediaFilesChange([]);
        await fetchMedia();
      } else {
        setMessage({
          type: 'error',
          text: (res as any).message || 'Failed to upload photos.',
        });
      }
    } catch (error: any) {
      console.error('Error uploading photos', error);
      setMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Error occurred during upload.',
      });
    } finally {
      setIsUploadingNew(false);
    }
  };

  // Add files to staged list
  const handleAddNewFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const added = Array.from(e.target.files);
      onNewMediaFilesChange([...newMediaFiles, ...added]);
      e.target.value = '';
    }
  };

  // Remove a staged new file
  const handleRemoveStagedFile = (index: number) => {
    const updated = [...newMediaFiles];
    updated.splice(index, 1);
    onNewMediaFilesChange(updated);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Alert Banner */}
      {message && (
        <div
          className={`animate-fade-in flex items-center justify-between gap-3 rounded-2xl border p-4 text-sm font-bold shadow-md ${
            message.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === 'success' ? (
              <CheckCircle2 size={18} className="shrink-0" />
            ) : (
              <AlertCircle size={18} className="shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: CURRENTLY UPLOADED PHOTOS (EXISTING GALLERY)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)]">
                <ImageIcon size={18} />
              </div>
              <h3 className="text-foreground text-xl font-black tracking-tight">
                Currently Uploaded Photos
              </h3>
              <span className="rounded-full bg-foreground/10 px-2.5 py-0.5 text-xs font-black text-foreground">
                {imageMedia.length}
              </span>
            </div>
            <p className="text-muted mt-1 text-xs font-bold">
              Photos currently stored and displayed for this tractor. You can view, replace, or delete any photo.
            </p>
          </div>

          {tractorId && (
            <button
              type="button"
              onClick={fetchMedia}
              disabled={loading}
              className="hover:bg-foreground/10 bg-foreground/5 text-foreground flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all disabled:opacity-50"
              title="Refresh Media"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Gallery</span>
            </button>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && existingMedia.length === 0 && (
          <div className="flex h-44 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5">
            <TractorLoader size={36} className="text-[var(--color-brand-green)]" />
            <span className="text-muted text-xs font-bold">Loading tractor photos...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && imageMedia.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border-subtle)] p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/5 text-muted">
              <ImageIcon size={24} />
            </div>
            <p className="text-foreground text-sm font-bold">No photos currently uploaded</p>
            <p className="text-muted text-xs">
              Upload images below to add them to this tractor&apos;s catalog page.
            </p>
          </div>
        )}

        {/* Existing Photos Grid */}
        {imageMedia.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {imageMedia.map((item, idx) => {
              const isItemBusy = actionLoadingId === item.id;
              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-background shadow-sm transition-all hover:border-[var(--color-brand-green)]/40 hover:shadow-md"
                >
                  {/* Photo Preview Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-foreground/5">
                    <img
                      src={item.url}
                      alt={item.altText || `Tractor photo ${idx + 1}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Busy Spinner Overlay */}
                    {isItemBusy && (
                      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/70 backdrop-blur-sm">
                        <TractorLoader size={32} className="text-[var(--color-brand-green)]" />
                        <span className="text-xs font-bold text-white">Updating photo...</span>
                      </div>
                    )}

                    {/* Primary Badge */}
                    {item.isPrimary && (
                      <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 rounded-lg bg-emerald-500 px-2 py-1 text-[10px] font-black tracking-wider text-white uppercase shadow-md">
                        <Star size={12} className="fill-white" />
                        <span>Primary Photo</span>
                      </div>
                    )}

                    {/* Quick View Button on Image Hover */}
                    <button
                      type="button"
                      onClick={() => setPreviewMedia(item)}
                      className="absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/90 group-hover:opacity-100"
                      title="View full-size photo"
                    >
                      <Maximize2 size={14} />
                    </button>

                    {/* Size and Index badge */}
                    <div className="absolute bottom-2 left-2 z-10 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                      #{idx + 1} {item.fileSize ? `• ${formatSize(item.fileSize)}` : ''}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] bg-foreground/[0.02] p-2.5">
                    {/* Hidden Replace Input */}
                    <input
                      type="file"
                      ref={(el) => {
                        replaceInputRefs.current[item.id] = el;
                      }}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleReplacePhoto(item, e.target.files[0]);
                          e.target.value = '';
                        }
                      }}
                    />

                    {/* Replace Button */}
                    <button
                      type="button"
                      disabled={isItemBusy || loading}
                      onClick={() => replaceInputRefs.current[item.id]?.click()}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-2 text-xs font-bold text-foreground transition-all hover:border-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/10 hover:text-[var(--color-brand-green)] disabled:opacity-50"
                      title="Select a new image from your device to replace this photo"
                    >
                      <RefreshCw size={13} className={isItemBusy ? 'animate-spin' : ''} />
                      <span>Replace Photo</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      disabled={isItemBusy || loading}
                      onClick={() => handleDeleteMedia(item)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 transition-all hover:bg-red-500 hover:text-white disabled:opacity-50"
                      title="Delete this photo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: UPLOAD NEW / ADDITIONAL PHOTOS
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-t border-[var(--border-subtle)] pt-8">
        <div>
          <h3 className="text-foreground text-lg font-black tracking-tight">
            Add New Tractor Photos
          </h3>
          <p className="text-muted text-xs font-bold">
            Select high-quality tractor images (JPG, PNG, WebP) to upload.
          </p>
        </div>

        {/* Dropzone Trigger */}
        <div
          onClick={() => newImagesInputRef.current?.click()}
          className="group relative flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[var(--border-brand)] bg-foreground/5 p-8 text-center transition-all hover:border-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/5"
        >
          <input
            type="file"
            ref={newImagesInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleAddNewFiles}
          />
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background shadow-md transition-transform group-hover:scale-110">
            <Upload size={24} className="text-[var(--color-brand-green)]" />
          </div>
          <div>
            <p className="text-foreground text-sm font-black">
              Click to browse or drag and drop photos here
            </p>
            <p className="text-muted mt-1 text-xs font-medium">
              PNG, JPG, WEBP • Max 10MB per image
            </p>
          </div>
        </div>

        {/* Staged New Files Preview */}
        {newMediaFiles.length > 0 && (
          <div className="animate-fade-in flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] bg-background p-4">
            <div className="flex items-center justify-between">
              <span className="text-foreground text-xs font-black tracking-wider uppercase">
                Selected Photos Ready To Upload ({newMediaFiles.length})
              </span>
              {tractorId && (
                <button
                  type="button"
                  disabled={isUploadingNew}
                  onClick={handleUploadStagedNow}
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-xs font-black text-white shadow-md transition-all hover:bg-[var(--color-brand-orange)] disabled:opacity-50"
                >
                  {isUploadingNew ? (
                    <TractorLoader size={14} />
                  ) : (
                    <Upload size={14} />
                  )}
                  <span>Upload Selected Now</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {newMediaFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-foreground/5"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 rounded bg-[var(--color-brand-green)] px-1.5 py-0.5 text-[9px] font-black tracking-wider text-white uppercase">
                    Ready
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStagedFile(idx)}
                    className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-transform hover:scale-110"
                    title="Remove this photo from queue"
                  >
                    <X size={12} />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1 text-[9px] font-bold text-white truncate backdrop-blur-sm">
                    {file.name}
                  </div>
                </div>
              ))}
            </div>
            {!tractorId && (
              <p className="text-muted text-[11px] font-bold">
                ℹ️ These photos will be uploaded automatically when you click &apos;Create Tractor&apos;.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: BROCHURE (PDF) MANAGEMENT
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-t border-[var(--border-subtle)] pt-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/15 text-red-500">
              <FileText size={18} />
            </div>
            <h3 className="text-foreground text-xl font-black tracking-tight">
              Official Brochure (PDF)
            </h3>
          </div>
          <p className="text-muted mt-1 text-xs font-bold">
            Upload the official product brochure PDF for customers to download.
          </p>
        </div>

        {/* Existing Brochure Card */}
        {pdfMedia.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-foreground text-xs font-black tracking-wider uppercase">
              Current Brochure
            </span>
            {pdfMedia.map((pdf) => {
              const isPdfBusy = actionLoadingId === pdf.id;
              return (
                <div
                  key={pdf.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] bg-background p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                      <FileText size={24} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-foreground text-sm font-bold truncate">
                        {pdf.altText || pdf.caption || `${tractorId ? `Tractor_${tractorId}` : 'Tractor'}_Official_Brochure.pdf`}
                      </span>
                      <span className="text-muted text-xs font-medium">
                        PDF Document {pdf.fileSize ? `• ${formatSize(pdf.fileSize)}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View PDF */}
                    <a
                      href={pdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:bg-foreground/10 bg-foreground/5 text-foreground flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all"
                    >
                      <ExternalLink size={14} />
                      <span>View PDF</span>
                    </a>

                    {/* Hidden Replace Brochure Input */}
                    <input
                      type="file"
                      ref={replaceBrochureInputRef}
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleReplaceBrochure(pdf, e.target.files[0]);
                          e.target.value = '';
                        }
                      }}
                    />

                    {/* Replace Brochure Button */}
                    <button
                      type="button"
                      disabled={isPdfBusy || isUploadingNew}
                      onClick={() => replaceBrochureInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-background px-3.5 py-2 text-xs font-bold text-foreground transition-all hover:border-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/10 hover:text-[var(--color-brand-green)] disabled:opacity-50"
                      title="Replace with a new PDF"
                    >
                      <RefreshCw size={14} className={isPdfBusy ? 'animate-spin' : ''} />
                      <span>Replace PDF</span>
                    </button>

                    {/* Delete Brochure Button */}
                    <button
                      type="button"
                      disabled={isPdfBusy || isUploadingNew}
                      onClick={() => handleDeleteMedia(pdf)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 transition-all hover:bg-red-500 hover:text-white disabled:opacity-50"
                      title="Delete this brochure"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* If no brochure exists, offer upload */}
        {pdfMedia.length === 0 && (
          <div className="flex flex-col gap-3">
            <div
              onClick={() => newBrochureInputRef.current?.click()}
              className="group relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border-brand)] bg-foreground/5 p-6 text-center transition-all hover:border-red-500 hover:bg-red-500/5"
            >
              <input
                type="file"
                ref={newBrochureInputRef}
                className="hidden"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    if (tractorId) {
                      handleReplaceBrochure(null, e.target.files[0]);
                    } else {
                      onNewBrochureFilesChange([e.target.files[0]]);
                    }
                    e.target.value = '';
                  }
                }}
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background text-red-500 shadow-sm transition-transform group-hover:scale-110">
                <FileText size={22} />
              </div>
              <p className="text-foreground text-sm font-bold">
                Click to upload brochure PDF
              </p>
              <p className="text-muted text-xs">
                Official specifications & warranty document in PDF format
              </p>
            </div>

            {newBrochureFiles.length > 0 && !tractorId && (
              <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <FileText size={16} className="text-red-500" />
                  <span>{newBrochureFiles[0].name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNewBrochureFilesChange([])}
                  className="rounded p-1 text-muted hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          FULL-SCREEN IMAGE PREVIEW MODAL
         ───────────────────────────────────────────────────────────── */}
      {previewMedia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setPreviewMedia(null)}
          />
          <div className="relative flex max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-[#121814] shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-2 text-white">
                <ImageIcon size={18} className="text-[var(--color-brand-green)]" />
                <span className="text-sm font-black">
                  Photo Preview (ID: #{previewMedia.id})
                </span>
                {previewMedia.isPrimary && (
                  <span className="rounded bg-emerald-500 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                    Primary
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center justify-center overflow-auto p-4 max-h-[70vh]">
              <img
                src={previewMedia.url}
                alt={previewMedia.altText || 'Preview'}
                className="max-h-[65vh] w-auto rounded-xl object-contain shadow-lg"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-black/40 px-6 py-3 text-xs text-white/70">
              <span className="truncate max-w-md">URL: {previewMedia.url}</span>
              <a
                href={previewMedia.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-bold text-[var(--color-brand-green)] hover:underline"
              >
                Open in new tab <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
