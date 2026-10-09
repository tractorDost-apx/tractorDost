'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { usedTractorInspectionAPI } from '@/lib/api/used-inspections';
import { usedTractorDocumentAPI } from '@/lib/api/used-documents';
import { mediaAPI } from '@/lib/api/media';
import {
  ArrowLeft,
  Wrench,
  Save,
  CheckCircle2,
  FileText,
  MapPin,
  Calendar,
  Phone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { TractorLoader } from '@/components/ui/TractorLoader';

export default function AgentInspectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [inspection, setInspection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const handleCancel = () => {
    if (inspection) {
      setScores({
        engineScore: inspection.engineScore || 0,
        tyreScore: inspection.tyreScore || 0,
        hydraulicsScore: inspection.hydraulicsScore || 0,
        bodyScore: inspection.bodyScore || 0,
        clutchScore: inspection.clutchScore || 0,
      });
      setInspectorNotes(inspection.inspectorNotes || '');
      setReportFile(null);
      setImageFiles([]);
      setDocFiles({});
    }
    setIsEditing(false);
  };

  // Form State
  const [scores, setScores] = useState({
    engineScore: 0,
    tyreScore: 0,
    hydraulicsScore: 0,
    bodyScore: 0,
    clutchScore: 0,
  });
  const [inspectorNotes, setInspectorNotes] = useState('');
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [docFiles, setDocFiles] = useState<{
    RC_COPY?: File;
    INSURANCE_COPY?: File;
    LOAN_NOC?: File;
  }>({});

  useEffect(() => {
    fetchInspection();
  }, [unwrappedParams.id]);

  const fetchInspection = async () => {
    setLoading(true);
    try {
      const res = await usedTractorInspectionAPI.getInspectionById(unwrappedParams.id);
      if (res.success && res.data) {
        setInspection(res.data);
        if (res.data.engineScore) {
          setScores({
            engineScore: res.data.engineScore,
            tyreScore: res.data.tyreScore ?? 0,
            hydraulicsScore: res.data.hydraulicsScore ?? 0,
            bodyScore: res.data.bodyScore ?? 0,
            clutchScore: res.data.clutchScore ?? 0,
          });
          setInspectorNotes(res.data.inspectorNotes || '');
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportFile && inspection?.status === 'ASSIGNED') {
      alert('Please upload a PDF inspection report before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: Upload images separately using the media module
      if (imageFiles.length > 0) {
        const mediaData = new FormData();
        mediaData.append('targetType', 'INSPECTION');
        mediaData.append('targetId', unwrappedParams.id);
        imageFiles.forEach((file) => {
          mediaData.append('file', file);
        });
        try {
          await mediaAPI.createMedia(mediaData);
        } catch (imgErr: any) {
          const imgErrMsg =
            imgErr?.response?.data?.message || imgErr?.message || 'Image upload failed';
          console.error('[Image Upload Error]', imgErr);
          alert(`Image upload failed: ${imgErrMsg}\n\nWill still try to submit the report.`);
        }
      }

      // Step 1.5: Upload Official Documents
      const docTypes: ('RC_COPY' | 'INSURANCE_COPY' | 'LOAN_NOC')[] = [
        'RC_COPY',
        'INSURANCE_COPY',
        'LOAN_NOC',
      ];
      for (const dType of docTypes) {
        if (docFiles[dType]) {
          const docFormData = new FormData();
          docFormData.append('listingId', String(inspection.listing.id));
          docFormData.append('docType', dType);
          docFormData.append('document', docFiles[dType]!);
          try {
            await usedTractorDocumentAPI.uploadDocument(docFormData);
          } catch (docErr: any) {
            console.error(`[Doc Upload Error for ${dType}]`, docErr);
            alert(`Failed to upload ${dType}. Will continue submitting report.`);
          }
        }
      }

      // Step 2: Submit inspection report (scores + PDF)
      const formData = new FormData();
      formData.append('engineScore', scores.engineScore.toString());
      formData.append('tyreScore', scores.tyreScore.toString());
      formData.append('hydraulicsScore', scores.hydraulicsScore.toString());
      formData.append('bodyScore', scores.bodyScore.toString());
      formData.append('clutchScore', scores.clutchScore.toString());
      formData.append('inspectorNotes', inspectorNotes);

      // PDF report
      if (reportFile) {
        formData.append('report', reportFile);
      }

      const res = await usedTractorInspectionAPI.submitInspectionReport(
        unwrappedParams.id,
        formData
      );
      if (res.success) {
        if (inspection?.status === 'REPORT_UPLOADED') {
          alert('Inspection report updated successfully!');
          setIsEditing(false);
          fetchInspection();
        } else {
          alert('Inspection report submitted successfully!');
          router.push('/agent/inspections');
        }
      } else {
        alert('Failed to submit report: ' + res.message);
      }
    } catch (e: any) {
      console.error('[Submit Error]', e);
      const errorMessage = e?.response?.data?.message || e?.message || 'An unknown error occurred';
      alert(`An error occurred during submission: ${errorMessage}`);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <TractorLoader className="text-[var(--color-brand-green)]" size={64} />
      </div>
    );
  }

  if (!inspection) {
    return <div className="text-muted p-8 text-center font-bold">Inspection not found.</div>;
  }

  const isSubmitted = inspection.status !== 'ASSIGNED';
  const isFormEditable =
    inspection.status === 'ASSIGNED' || (inspection.status === 'REPORT_UPLOADED' && isEditing);
  const listing = inspection.listing;
  const images = listing.media?.filter((m: any) => m.mediaType !== 'pdf') || [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-4xl space-y-6 pb-12 duration-500">
      <Link
        href="/agent/inspections"
        className="text-muted hover:text-foreground mb-4 inline-flex items-center gap-2 text-sm font-bold transition-colors"
      >
        <ArrowLeft size={16} /> Back to Inspections
      </Link>

      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="flex items-center gap-3 text-3xl font-black">
          <Wrench className="text-[var(--color-brand-green)]" size={32} />
          {isSubmitted && !isEditing ? 'Inspection Report' : 'Submit/Edit Inspection'}
        </h1>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-xl px-4 py-2 text-sm font-black tracking-widest uppercase ${
              isSubmitted
                ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]'
                : 'bg-orange-500/10 text-orange-500'
            }`}
          >
            {inspection.status.replace('_', ' ')}
          </span>
          {inspection.status === 'REPORT_UPLOADED' && !isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-sm font-black tracking-widest text-white uppercase shadow-md transition-all hover:bg-[var(--color-brand-green)]/90 active:scale-95"
            >
              <Save size={16} /> Edit Report
            </button>
          )}
        </div>
      </div>

      {/* Listing Details Card */}
      <div className="bg-background rounded-3xl border border-[var(--border-subtle)] p-8 shadow-sm">
        <div className="flex flex-col gap-8 md:flex-row">
          {images.length > 0 ? (
            <div className="group bg-foreground/5 relative h-48 w-full shrink-0 overflow-hidden rounded-2xl border border-[var(--border-subtle)] shadow-sm md:w-48">
              <img
                src={images[currentImageIndex]?.url}
                alt={`Tractor Image ${currentImageIndex + 1}`}
                className="animate-in fade-in h-full w-full object-cover transition-all duration-300"
              />

              {images.length > 1 && (
                <>
                  {/* Left Arrow */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                    }}
                    className="absolute top-1/2 left-2 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/40 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Right Arrow */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/40 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60"
                  >
                    <ChevronRight size={16} />
                  </button>

                  {/* Indicators / Dots */}
                  <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/30 px-2 py-1">
                    {images.map((_: any, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentImageIndex(idx);
                        }}
                        className={`h-1.5 w-1.5 rounded-full transition-all ${
                          idx === currentImageIndex ? 'w-3 bg-white' : 'bg-foreground/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-foreground/5 flex h-48 w-full shrink-0 items-center justify-center rounded-2xl border border-[var(--border-subtle)] md:w-48">
              <span className="text-muted text-sm font-bold">No Image</span>
            </div>
          )}

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-black">
                {listing.tractorBrand} {listing.tractorModel}
              </h2>
              <p className="text-muted text-lg font-bold">
                Year: {listing.yearOfManufacture || 'N/A'} • {listing.hoursUsed || 'N/A'} Hours
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="bg-foreground/5 flex items-center gap-3 rounded-xl p-4">
                <MapPin className="text-[var(--color-brand-green)]" size={20} />
                <div>
                  <p className="text-muted text-xs font-bold tracking-widest uppercase">Location</p>
                  <p className="font-bold">
                    {listing.villageCity || listing.district || 'Unknown'},{' '}
                    {listing.district || 'Unknown'}
                  </p>
                </div>
              </div>
              <div className="bg-foreground/5 flex items-center gap-3 rounded-xl p-4">
                <Phone className="text-[var(--color-brand-green)]" size={20} />
                <div>
                  <p className="text-muted text-xs font-bold tracking-widest uppercase">
                    Customer Phone
                  </p>
                  <p className="font-bold">
                    {listing.seller?.mobile ? String(listing.seller.mobile) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inspection Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-background overflow-hidden rounded-3xl border border-[var(--border-subtle)] shadow-sm"
      >
        <div className="border-b border-[var(--border-subtle)] p-8">
          <h3 className="mb-6 text-xl font-black">Condition Scores (0-100)</h3>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {['engineScore', 'tyreScore', 'hydraulicsScore', 'bodyScore', 'clutchScore'].map(
              (field) => (
                <div
                  key={field}
                  className="bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] p-6"
                >
                  <label className="mb-4 flex items-center justify-between">
                    <span className="font-black capitalize">
                      {field.replace('Score', '')} Score
                    </span>
                    <span className="text-2xl font-black text-[var(--color-brand-green)]">
                      {(scores as any)[field]}
                      <span className="text-muted text-sm">/100</span>
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={(scores as any)[field]}
                    disabled={!isFormEditable}
                    onChange={(e) => setScores({ ...scores, [field]: Number(e.target.value) })}
                    className="w-full accent-[var(--color-brand-green)] disabled:opacity-50"
                  />
                </div>
              )
            )}
          </div>
        </div>

        <div className="space-y-6 border-b border-[var(--border-subtle)] p-8">
          <div>
            <label className="mb-3 block text-sm font-bold tracking-widest uppercase">
              Field Inspector Notes
            </label>
            <textarea
              rows={4}
              value={inspectorNotes}
              disabled={!isFormEditable}
              onChange={(e) => setInspectorNotes(e.target.value)}
              placeholder="Enter detailed observations here..."
              className="bg-foreground/5 w-full rounded-2xl border border-[var(--border-subtle)] p-4 font-medium focus:border-[var(--color-brand-green)] focus:outline-none disabled:opacity-50"
            />
          </div>

          {isFormEditable && (
            <div>
              <label className="mb-3 block text-sm font-bold tracking-widest uppercase">
                Upload PDF Report{' '}
                {inspection.status === 'ASSIGNED' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="file"
                accept=".pdf"
                required={inspection.status === 'ASSIGNED'}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setReportFile(e.target.files[0]);
                  }
                }}
                className="text-muted bg-background block w-full cursor-pointer rounded-xl border border-[var(--border-subtle)] text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--color-brand-green)] file:px-6 file:py-3 file:text-sm file:font-black file:tracking-widest file:text-white file:uppercase hover:file:opacity-90"
              />
            </div>
          )}

          {isFormEditable && (
            <div>
              <label className="mb-3 block text-sm font-bold tracking-widest uppercase">
                Official Documents (RC, Insurance, Loan NOC)
              </label>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* RC Book */}
                <div className="bg-foreground/5 relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] p-4">
                  <div className="mb-3 flex items-center justify-between text-sm font-bold tracking-widest uppercase">
                    <span>RC Copy</span>
                    {docFiles.RC_COPY && (
                      <CheckCircle2 size={16} className="text-[var(--color-brand-green)]" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setDocFiles((prev) => ({ ...prev, RC_COPY: e.target.files![0] }));
                      }
                    }}
                    className="text-muted bg-background block w-full cursor-pointer rounded-lg border border-[var(--border-subtle)] text-xs file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--color-brand-green)] file:px-4 file:py-2 file:text-[10px] file:font-bold file:text-white file:uppercase hover:file:opacity-90"
                  />
                  {docFiles.RC_COPY && (
                    <div className="mt-2 truncate text-[10px] font-bold text-[var(--color-brand-green)]">
                      Selected: {docFiles.RC_COPY.name}
                    </div>
                  )}
                </div>

                {/* Insurance */}
                <div className="bg-foreground/5 relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] p-4">
                  <div className="mb-3 flex items-center justify-between text-sm font-bold tracking-widest uppercase">
                    <span>Insurance</span>
                    {docFiles.INSURANCE_COPY && (
                      <CheckCircle2 size={16} className="text-[var(--color-brand-green)]" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setDocFiles((prev) => ({ ...prev, INSURANCE_COPY: e.target.files![0] }));
                      }
                    }}
                    className="text-muted bg-background block w-full cursor-pointer rounded-lg border border-[var(--border-subtle)] text-xs file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--color-brand-green)] file:px-4 file:py-2 file:text-[10px] file:font-bold file:text-white file:uppercase hover:file:opacity-90"
                  />
                  {docFiles.INSURANCE_COPY && (
                    <div className="mt-2 truncate text-[10px] font-bold text-[var(--color-brand-green)]">
                      Selected: {docFiles.INSURANCE_COPY.name}
                    </div>
                  )}
                </div>

                {/* Loan NOC */}
                <div className="bg-foreground/5 relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] p-4">
                  <div className="mb-3 flex items-center justify-between text-sm font-bold tracking-widest uppercase">
                    <span>Loan NOC</span>
                    {docFiles.LOAN_NOC && (
                      <CheckCircle2 size={16} className="text-[var(--color-brand-green)]" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setDocFiles((prev) => ({ ...prev, LOAN_NOC: e.target.files![0] }));
                      }
                    }}
                    className="text-muted bg-background block w-full cursor-pointer rounded-lg border border-[var(--border-subtle)] text-xs file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--color-brand-green)] file:px-4 file:py-2 file:text-[10px] file:font-bold file:text-white file:uppercase hover:file:opacity-90"
                  />
                  {docFiles.LOAN_NOC && (
                    <div className="mt-2 truncate text-[10px] font-bold text-[var(--color-brand-green)]">
                      Selected: {docFiles.LOAN_NOC.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isFormEditable && (
            <div>
              <label className="mb-3 block text-sm font-bold tracking-widest uppercase">
                Upload Tractor Images (Optional)
              </label>

              <div className="hover:bg-foreground/5 relative cursor-pointer rounded-2xl border-2 border-dashed border-[var(--border-subtle)] p-6 text-center transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const newFiles = Array.from(e.target.files!);
                      setImageFiles((prev) => {
                        const totalFiles = [...prev, ...newFiles];
                        if (totalFiles.length > 10) {
                          alert('You can only upload up to 10 tractor images.');
                          return totalFiles.slice(0, 10);
                        }
                        return totalFiles;
                      });
                    }
                    e.target.value = ''; // Reset value to allow selecting same file again without native input visual glitch
                  }}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <div className="pointer-events-none flex flex-col items-center justify-center">
                  <div className="mb-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-3 text-sm font-black tracking-widest text-white uppercase">
                    Select Images
                  </div>
                  <span className="text-muted text-sm">Or drag and drop files here</span>
                </div>
              </div>

              {imageFiles.length > 0 && (
                <div className="bg-foreground/5 mt-4 rounded-2xl border border-[var(--border-subtle)] p-4">
                  <div className="mb-3 text-sm font-bold">
                    {imageFiles.length} Image{imageFiles.length !== 1 ? 's' : ''} Selected
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {imageFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="group relative h-24 w-24 overflow-hidden rounded-xl border border-[var(--border-subtle)] shadow-sm"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setImageFiles((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isSubmitted && (
            <div className="space-y-6">
              {/* Attached Report */}
              {inspection.reportUrl && (
                <div>
                  <label className="mb-3 block text-sm font-bold tracking-widest uppercase">
                    Attached Report
                  </label>
                  <a
                    href={inspection.reportUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-foreground text-background animate-in fade-in inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black transition-opacity hover:opacity-90"
                  >
                    <FileText size={18} /> View PDF Report
                  </a>
                </div>
              )}

              {/* Official Documents */}
              {listing.documents && listing.documents.length > 0 && (
                <div>
                  <label className="mb-3 block text-sm font-bold tracking-widest uppercase">
                    Uploaded Official Documents
                  </label>
                  <div className="animate-in fade-in grid grid-cols-1 gap-6 md:grid-cols-3">
                    {listing.documents.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="bg-foreground/5 flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] p-4"
                      >
                        <div className="mr-2 min-w-0 flex-1">
                          <p className="text-muted truncate text-[10px] font-bold tracking-widest uppercase">
                            {doc.docType.replace('_', ' ')}
                          </p>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block truncate text-sm font-bold text-[var(--color-brand-green)] hover:underline"
                          >
                            View Document
                          </a>
                        </div>
                        <CheckCircle2
                          size={20}
                          className="shrink-0 text-[var(--color-brand-green)]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tractor Images */}
              {listing.media && listing.media.length > 0 && (
                <div>
                  <label className="mb-3 block text-sm font-bold tracking-widest uppercase">
                    Uploaded Tractor Images
                  </label>
                  <div className="animate-in fade-in flex flex-wrap gap-3">
                    {listing.media.map((mediaItem: any, idx: number) => (
                      <a
                        key={mediaItem.id || idx}
                        href={mediaItem.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[var(--border-subtle)] shadow-sm transition-opacity hover:opacity-90"
                      >
                        <img
                          src={mediaItem.url}
                          alt={`Tractor ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {isFormEditable && (
          <div className="bg-foreground/5 flex flex-col gap-4 p-8 md:flex-row">
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[var(--color-brand-green)] px-10 py-4 text-lg font-black text-white shadow-[var(--color-brand-green)]/30 shadow-lg transition-all hover:bg-[var(--color-brand-green)]/90 active:scale-95 disabled:opacity-50 md:w-auto"
            >
              {submitting ? <TractorLoader size={24} /> : <CheckCircle2 size={24} />}
              {inspection.status === 'REPORT_UPLOADED'
                ? 'Save Changes'
                : 'Submit Inspection Report'}
            </button>
            {inspection.status === 'REPORT_UPLOADED' && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="text-foreground hover:bg-foreground/5 flex w-full items-center justify-center rounded-2xl border border-[var(--border-subtle)] px-10 py-4 text-lg font-black transition-all active:scale-95 disabled:opacity-50 md:w-auto"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </form>

      {/* Associated Media Table */}
      {listing.media && listing.media.length > 0 && (
        <div className="bg-background animate-in fade-in mt-6 overflow-hidden rounded-3xl border border-[var(--border-subtle)] p-8 shadow-sm duration-500">
          <h3 className="mb-6 flex items-center gap-2 text-xl font-black">
            <FileText className="text-[var(--color-brand-green)]" size={24} />
            Associated Media Table Data
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)]">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-foreground/5 text-muted border-b border-[var(--border-subtle)] text-xs font-bold tracking-widest uppercase">
                  <th className="p-4">Preview</th>
                  <th className="p-4">ID</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Target Type</th>
                  <th className="p-4">File Size</th>
                  <th className="p-4">Primary</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-xs font-medium">
                {listing.media.map((mediaItem: any) => {
                  const fileSizeFriendly = mediaItem.fileSize
                    ? `${(mediaItem.fileSize / (1024 * 1024)).toFixed(2)} MB`
                    : 'N/A';
                  const dateFriendly = new Date(mediaItem.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={mediaItem.id} className="hover:bg-foreground/5 transition-colors">
                      <td className="p-4">
                        <a
                          href={mediaItem.url}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-foreground/5 block h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[var(--border-subtle)]"
                        >
                          {mediaItem.mediaType === 'pdf' ? (
                            <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-red-500">
                              PDF
                            </div>
                          ) : (
                            <img
                              src={mediaItem.url}
                              alt="media preview"
                              className="h-full w-full object-cover"
                            />
                          )}
                        </a>
                      </td>
                      <td className="text-muted p-4 font-mono text-xs">#{mediaItem.id}</td>
                      <td className="p-4">
                        <span className="bg-foreground/5 rounded-md px-2.5 py-1 text-xs font-bold tracking-wider uppercase">
                          {mediaItem.mediaType}
                        </span>
                      </td>
                      <td className="text-muted p-4 text-xs font-semibold">
                        {mediaItem.targetType} (ID: {mediaItem.targetId})
                      </td>
                      <td className="text-muted p-4 text-xs">{fileSizeFriendly}</td>
                      <td className="p-4">
                        {mediaItem.isPrimary ? (
                          <span className="rounded-md bg-[var(--color-brand-green)]/10 px-2.5 py-1 text-xs font-bold text-[var(--color-brand-green)]">
                            Yes
                          </span>
                        ) : (
                          <span className="text-muted text-xs">No</span>
                        )}
                      </td>
                      <td className="text-muted p-4 text-xs">{dateFriendly}</td>
                      <td className="p-4 text-right">
                        <a
                          href={mediaItem.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-[var(--color-brand-green)] hover:underline"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
