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
  User,
  ChevronLeft,
  ChevronRight,
  Award,
  AlertCircle,
  X,
  Upload,
  Gauge,
  IndianRupee,
  ShieldCheck,
  Info,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { TractorLoader } from '@/components/ui/TractorLoader';

interface ToastState {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export default function AgentInspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [inspection, setInspection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  // Modern Toast notification state
  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: 'info',
    message: '',
  });

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setToast({ show: true, type, message });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

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

  const handleCancel = () => {
    if (inspection) {
      setScores({
        engineScore: inspection.engineScore ?? 0,
        tyreScore: inspection.tyreScore ?? 0,
        hydraulicsScore: inspection.hydraulicsScore ?? 0,
        bodyScore: inspection.bodyScore ?? 0,
        clutchScore: inspection.clutchScore ?? 0,
      });
      setInspectorNotes(inspection.inspectorNotes || '');
      setReportFile(null);
      setImageFiles([]);
      setDocFiles({});
    }
    setIsEditing(false);
  };

  useEffect(() => {
    fetchInspection();
  }, [unwrappedParams.id]);

  const fetchInspection = async () => {
    setLoading(true);
    try {
      const res = await usedTractorInspectionAPI.getInspectionById(unwrappedParams.id);
      if (res.success && res.data) {
        setInspection(res.data);
        // Fix 0 score bug: check for undefined and null, NOT falsy
        if (res.data.engineScore !== null && res.data.engineScore !== undefined) {
          setScores({
            engineScore: Number(res.data.engineScore),
            tyreScore: Number(res.data.tyreScore ?? 0),
            hydraulicsScore: Number(res.data.hydraulicsScore ?? 0),
            bodyScore: Number(res.data.bodyScore ?? 0),
            clutchScore: Number(res.data.clutchScore ?? 0),
          });
        }
        if (res.data.inspectorNotes) {
          setInspectorNotes(res.data.inspectorNotes);
        }
      } else {
        showToast('error', res.message || 'Inspection record not found');
      }
    } catch (e: any) {
      console.error(e);
      showToast('error', 'Failed to load inspection details');
    }
    setLoading(false);
  };

  // Live Overall Score Calculation (Average of 5 categories)
  const overallScoreCalculated = Math.round(
    (scores.engineScore +
      scores.tyreScore +
      scores.hydraulicsScore +
      scores.bodyScore +
      scores.clutchScore) /
      5
  );

  const handleScoreChange = (field: keyof typeof scores, rawVal: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(rawVal) ? 0 : rawVal));
    setScores((prev) => ({ ...prev, [field]: clamped }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: PDF file requirement for initial submission
    if (!reportFile && inspection?.status === 'ASSIGNED') {
      showToast('warning', 'Please upload a PDF inspection report before submitting.');
      return;
    }

    // Validation: If reportFile is selected, ensure it is a PDF and under 50MB
    if (reportFile) {
      const isPdf =
        reportFile.type === 'application/pdf' ||
        reportFile.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        showToast('error', 'The inspection report must be a valid PDF file.');
        return;
      }
      if (reportFile.size > 50 * 1024 * 1024) {
        showToast('error', 'The PDF report file size must be less than 50MB.');
        return;
      }
    }

    // Validation: Character count on inspector notes
    if (inspectorNotes.length > 2000) {
      showToast('error', 'Inspector notes must be under 2,000 characters.');
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: Upload tractor photos
      if (imageFiles.length > 0) {
        let mediaUploadSuccess = false;
        try {
          const mediaData = new FormData();
          mediaData.append('targetType', 'INSPECTION');
          mediaData.append('targetId', unwrappedParams.id);
          imageFiles.forEach((file) => {
            mediaData.append('file', file);
          });
          const mediaRes = await mediaAPI.createMedia(mediaData);
          if (mediaRes && (mediaRes.data || (mediaRes as any).success)) {
            mediaUploadSuccess = true;
          }
        } catch (imgErr: any) {
          console.warn('[Media upload returned error, attempting fallback to document upload]', imgErr);
        }

        // Fallback: If mediaAPI.createMedia failed (e.g. 403 Forbidden for field agents lacking USED_LISTING.canCreate),
        // upload each image through usedTractorDocumentAPI with docType 'TRACTOR_IMAGE'
        if (!mediaUploadSuccess && inspection?.listing?.id) {
          for (const file of imageFiles) {
            try {
              const docFormData = new FormData();
              docFormData.append('listingId', String(inspection.listing.id));
              docFormData.append('docType', 'TRACTOR_IMAGE');
              docFormData.append('document', file);
              await usedTractorDocumentAPI.uploadDocument(docFormData);
            } catch (fallbackErr) {
              console.error('[Document image fallback upload failed]', fallbackErr);
            }
          }
        }
      }

      // Step 1.5: Upload Official Documents (RC, Insurance, Loan NOC)
      const docTypes: ('RC_COPY' | 'INSURANCE_COPY' | 'LOAN_NOC')[] = [
        'RC_COPY',
        'INSURANCE_COPY',
        'LOAN_NOC',
      ];
      for (const dType of docTypes) {
        const file = docFiles[dType];
        if (file) {
          if (file.size > 5 * 1024 * 1024) {
            showToast('warning', `${dType.replace('_', ' ')} exceeds 5MB limit. Skipped.`);
            continue;
          }
          const docFormData = new FormData();
          docFormData.append('listingId', String(inspection.listing.id));
          docFormData.append('docType', dType);
          docFormData.append('document', file);
          try {
            await usedTractorDocumentAPI.uploadDocument(docFormData);
          } catch (docErr: any) {
            console.error(`[Doc Upload Error for ${dType}]`, docErr);
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

      if (reportFile) {
        formData.append('report', reportFile);
      }

      const res = await usedTractorInspectionAPI.submitInspectionReport(
        unwrappedParams.id,
        formData
      );

      if (res.success) {
        if (inspection?.status === 'REPORT_UPLOADED') {
          showToast('success', 'Inspection report updated successfully!');
          setIsEditing(false);
          setImageFiles([]);
          setReportFile(null);
          setDocFiles({});
          await fetchInspection();
        } else {
          showToast('success', 'Inspection report submitted successfully!');
          setTimeout(() => {
            router.push('/agent/inspections');
          }, 1200);
        }
      } else {
        showToast('error', res.message || 'Failed to submit inspection report.');
      }
    } catch (e: any) {
      console.error('[Submit Error]', e);
      const errorMessage =
        e?.response?.data?.message || e?.message || 'An unexpected error occurred during submission';
      showToast('error', errorMessage);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <TractorLoader className="text-[var(--color-brand-green)]" size={64} />
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="text-muted flex flex-col items-center justify-center gap-4 p-12 text-center">
        <AlertCircle size={48} className="text-red-500 opacity-60" />
        <h2 className="text-xl font-bold">Inspection Record Not Found</h2>
        <Link
          href="/agent/inspections"
          className="rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-90"
        >
          Back to Inspections
        </Link>
      </div>
    );
  }

  const isSubmitted = inspection.status !== 'ASSIGNED';
  const isFormEditable =
    inspection.status === 'ASSIGNED' || (inspection.status === 'REPORT_UPLOADED' && isEditing);
  const listing = inspection.listing || {};

  // Extract images from media
  const mediaImages = (listing.media || [])
    .filter((m: any) => m.mediaType !== 'pdf' && m.url)
    .map((m: any) => ({ url: m.url, id: m.id, targetType: m.targetType }));

  // Extract photos uploaded as documents
  const docImages = (listing.documents || [])
    .filter((d: any) => d.url && !d.url.toLowerCase().endsWith('.pdf'))
    .map((d: any) => ({ url: d.url, id: `doc-${d.id}`, targetType: d.docType }));

  const allImages = Array.from(
    new Map([...mediaImages, ...docImages].map((img) => [img.url, img])).values()
  );

  const tractorTitle =
    listing.tractorBrand || listing.tractorModel
      ? `${listing.tractorBrand || ''} ${listing.tractorModel || ''}`.trim()
      : `Tractor Listing #${inspection.listingId}`;

  const askingPriceFormatted = listing.askingPrice
    ? `₹${Number(listing.askingPrice).toLocaleString('en-IN')}`
    : 'N/A';

  const customerMobile = listing.seller?.mobile ? String(listing.seller.mobile) : null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 relative mx-auto max-w-4xl space-y-6 pb-16 duration-500">
      {/* Toast Notification Banner */}
      {toast.show && (
        <div
          className={`animate-in slide-in-from-top-2 fixed top-6 right-6 z-50 flex max-w-md items-center gap-3 rounded-2xl p-4 shadow-2xl backdrop-blur-md transition-all ${
            toast.type === 'success'
              ? 'border border-emerald-500/30 bg-emerald-950/90 text-emerald-200'
              : toast.type === 'error'
                ? 'border border-red-500/30 bg-red-950/90 text-red-200'
                : toast.type === 'warning'
                  ? 'border border-amber-500/30 bg-amber-950/90 text-amber-200'
                  : 'border border-blue-500/30 bg-blue-950/90 text-blue-200'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 size={22} className="shrink-0 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle size={22} className="shrink-0 text-red-400" />}
          {toast.type === 'warning' && <AlertCircle size={22} className="shrink-0 text-amber-400" />}
          {toast.type === 'info' && <Info size={22} className="shrink-0 text-blue-400" />}
          <div className="text-xs font-bold leading-relaxed">{toast.message}</div>
          <button
            type="button"
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className="ml-auto text-white/60 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Back button */}
      <Link
        href="/agent/inspections"
        className="text-muted hover:text-foreground inline-flex items-center gap-2 text-sm font-bold transition-colors"
      >
        <ArrowLeft size={16} /> Back to Inspections
      </Link>

      {/* Header bar */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black">
            <Wrench className="text-[var(--color-brand-green)]" size={32} />
            {isSubmitted && !isEditing ? 'Inspection Overview' : 'Submit Inspection Report'}
          </h1>
          <p className="text-muted mt-1 text-xs font-semibold">
            Inspection ID #{inspection.id} • Listing #{inspection.listingId}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-xl px-4 py-2 text-xs font-black tracking-widest uppercase ${
              inspection.status === 'ASSIGNED'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : inspection.status === 'CERTIFIED'
                  ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
            }`}
          >
            {inspection.status.replace('_', ' ')}
          </span>

          {inspection.status === 'REPORT_UPLOADED' && !isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-xs font-black tracking-widest text-white uppercase shadow-md transition-all hover:bg-[var(--color-brand-green)]/90 active:scale-95"
            >
              <Save size={16} /> Edit Report
            </button>
          )}
        </div>
      </div>

      {/* Certified Status Banner */}
      {inspection.status === 'CERTIFIED' && (
        <div className="animate-in fade-in flex items-center gap-4 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-emerald-700 dark:text-emerald-300">
          <ShieldCheck size={32} className="shrink-0 text-emerald-500" />
          <div>
            <h4 className="text-base font-black">This Tractor is Officially Certified</h4>
            <p className="text-xs font-medium">
              Admin certification completed on{' '}
              {inspection.certifiedAt
                ? new Date(inspection.certifiedAt).toLocaleDateString()
                : 'N/A'}
              . Overall verified quality score: {inspection.overallScore || 'N/A'}/100.
            </p>
          </div>
        </div>
      )}

      {/* Tractor & Seller Details Card */}
      <div className="bg-background overflow-hidden rounded-3xl border border-[var(--border-subtle)] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* Photos carousel */}
          {allImages.length > 0 ? (
            <div className="group bg-foreground/5 relative h-56 w-full shrink-0 overflow-hidden rounded-2xl border border-[var(--border-subtle)] shadow-sm md:h-52 md:w-56">
              <img
                src={allImages[currentImageIndex]?.url}
                alt={`${tractorTitle} Photo ${currentImageIndex + 1}`}
                className="animate-in fade-in h-full w-full object-cover transition-all duration-300"
              />

              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
                    }}
                    className="absolute top-1/2 left-2 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/75"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center justify-center rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/75"
                    aria-label="Next image"
                  >
                    <ChevronRight size={16} />
                  </button>

                  <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/40 px-2 py-1">
                    {allImages.slice(0, 6).map((_, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentImageIndex(idx);
                        }}
                        className={`h-1.5 w-1.5 rounded-full transition-all ${
                          idx === currentImageIndex ? 'w-3.5 bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                    {allImages.length > 6 && (
                      <span className="text-[9px] font-black text-white">+{allImages.length - 6}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-foreground/5 text-muted flex h-52 w-full shrink-0 flex-col items-center justify-center rounded-2xl border border-[var(--border-subtle)] md:w-56">
              <span className="text-xs font-bold tracking-widest uppercase">No Photos</span>
            </div>
          )}

          {/* Details column */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl font-black md:text-3xl">{tractorTitle}</h2>
                <div className="text-foreground text-xl font-black">{askingPriceFormatted}</div>
              </div>
              <p className="text-muted mt-1 text-xs font-bold uppercase tracking-wider">
                Year: {listing.yearOfManufacture || 'N/A'} • Hours: {listing.hoursUsed || 'N/A'} hrs •{' '}
                {listing.ownership
                  ? `${listing.ownership}${listing.ownership === 1 ? 'st' : listing.ownership === 2 ? 'nd' : 'rd'} Owner`
                  : 'Owner N/A'}{' '}
                • Condition: {listing.conditionGrade || 'Good'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="bg-foreground/5 flex items-center gap-3 rounded-2xl p-3.5">
                <MapPin className="text-[var(--color-brand-green)]" size={20} />
                <div className="min-w-0 flex-1">
                  <p className="text-muted text-[10px] font-bold tracking-widest uppercase">Location</p>
                  <p className="truncate text-xs font-bold">
                    {listing.villageCity ? `${listing.villageCity}, ` : ''}
                    {listing.district || 'Unknown'}, {listing.state || ''}
                  </p>
                </div>
              </div>

              <div className="bg-foreground/5 flex items-center gap-3 rounded-2xl p-3.5">
                <Phone className="text-[var(--color-brand-green)]" size={20} />
                <div className="min-w-0 flex-1">
                  <p className="text-muted text-[10px] font-bold tracking-widest uppercase">
                    Customer Contact ({listing.seller?.fullName || 'Seller'})
                  </p>
                  {customerMobile ? (
                    <a
                      href={`tel:${customerMobile}`}
                      className="text-xs font-bold text-[var(--color-brand-green)] hover:underline"
                    >
                      {customerMobile} (Tap to Call)
                    </a>
                  ) : (
                    <p className="text-muted text-xs font-bold">N/A</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Inspection Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-background overflow-hidden rounded-3xl border border-[var(--border-subtle)] shadow-sm"
      >
        {/* Score Header & Live Overall Score */}
        <div className="border-b border-[var(--border-subtle)] p-6 sm:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-black">Detailed Condition Scores (0-100)</h3>
              <p className="text-muted text-xs font-medium">
                Rate each component of the tractor based on your on-site physical inspection.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-foreground/5 px-5 py-3">
              <Award className="text-[var(--color-brand-green)]" size={24} />
              <div>
                <p className="text-muted text-[10px] font-bold tracking-widest uppercase">
                  Overall Score
                </p>
                <p className="text-2xl font-black text-[var(--color-brand-green)]">
                  {overallScoreCalculated}
                  <span className="text-muted text-xs">/100</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              { field: 'engineScore', label: 'Engine Performance' },
              { field: 'tyreScore', label: 'Tyre & Tread Life' },
              { field: 'hydraulicsScore', label: 'Hydraulics & Hitch' },
              { field: 'bodyScore', label: 'Body, Paint & Chassis' },
              { field: 'clutchScore', label: 'Clutch & Transmission' },
            ].map(({ field, label }) => {
              const currentVal = (scores as any)[field];
              return (
                <div
                  key={field}
                  className="bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] p-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-black">{label}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={currentVal}
                        disabled={!isFormEditable}
                        onChange={(e) =>
                          handleScoreChange(field as keyof typeof scores, parseInt(e.target.value))
                        }
                        className="bg-background w-16 rounded-lg border border-[var(--border-subtle)] py-1 text-center font-mono text-sm font-black focus:border-[var(--color-brand-green)] focus:outline-none disabled:opacity-50"
                      />
                      <span className="text-muted text-xs font-bold">/100</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={currentVal}
                    disabled={!isFormEditable}
                    onChange={(e) =>
                      handleScoreChange(field as keyof typeof scores, Number(e.target.value))
                    }
                    className="w-full accent-[var(--color-brand-green)] disabled:opacity-50"
                  />

                  <div className="text-muted mt-2 flex justify-between text-[10px] font-bold">
                    <span>Poor (0)</span>
                    <span>Average (50)</span>
                    <span>Excellent (100)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inspector Notes & File Uploads */}
        <div className="space-y-6 border-b border-[var(--border-subtle)] p-6 sm:p-8">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-bold tracking-widest uppercase">
                Field Inspector Notes & Observations
              </label>
              <span
                className={`text-xs font-mono font-bold ${
                  inspectorNotes.length > 1900 ? 'text-amber-500' : 'text-muted'
                }`}
              >
                {inspectorNotes.length} / 2000
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={2000}
              value={inspectorNotes}
              disabled={!isFormEditable}
              onChange={(e) => setInspectorNotes(e.target.value)}
              placeholder="Record any oil leakage, engine sounds, battery condition, chassis weld marks, or unusual vibrations observed during test run..."
              className="bg-foreground/5 w-full rounded-2xl border border-[var(--border-subtle)] p-4 text-sm font-medium focus:border-[var(--color-brand-green)] focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Upload PDF Report Input */}
          {isFormEditable && (
            <div>
              <label className="mb-2 block text-xs font-bold tracking-widest uppercase">
                Official PDF Inspection Report{' '}
                {inspection.status === 'ASSIGNED' ? (
                  <span className="text-red-500">* (Required)</span>
                ) : (
                  <span className="text-muted">(Optional if already uploaded)</span>
                )}
              </label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                required={inspection.status === 'ASSIGNED'}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const f = e.target.files[0];
                    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
                      showToast('error', 'Only PDF files are permitted for the inspection report.');
                      e.target.value = '';
                      return;
                    }
                    if (f.size > 50 * 1024 * 1024) {
                      showToast('error', 'PDF file exceeds 50MB limit.');
                      e.target.value = '';
                      return;
                    }
                    setReportFile(f);
                  }
                }}
                className="text-muted bg-background block w-full cursor-pointer rounded-xl border border-[var(--border-subtle)] text-xs file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--color-brand-green)] file:px-5 file:py-2.5 file:text-xs file:font-black file:tracking-widest file:text-white file:uppercase hover:file:opacity-90"
              />
              {reportFile && (
                <p className="mt-2 text-xs font-bold text-[var(--color-brand-green)]">
                  ✓ Selected: {reportFile.name} ({(reportFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>
          )}

          {/* Upload Official Verification Documents */}
          {isFormEditable && (
            <div>
              <label className="mb-2 block text-xs font-bold tracking-widest uppercase">
                Upload Verification Documents (RC Book, Insurance, Bank NOC)
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* RC Book */}
                <div className="bg-foreground/5 relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] p-4">
                  <div className="mb-2 flex items-center justify-between text-xs font-bold tracking-widest uppercase">
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
                    className="text-muted bg-background block w-full cursor-pointer rounded-lg border border-[var(--border-subtle)] text-[10px] file:mr-2 file:rounded-md file:border-0 file:bg-[var(--color-brand-green)] file:px-3 file:py-1.5 file:text-[10px] file:font-bold file:text-white file:uppercase hover:file:opacity-90"
                  />
                  {docFiles.RC_COPY && (
                    <div className="mt-2 truncate text-[10px] font-bold text-[var(--color-brand-green)]">
                      {docFiles.RC_COPY.name}
                    </div>
                  )}
                </div>

                {/* Insurance */}
                <div className="bg-foreground/5 relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] p-4">
                  <div className="mb-2 flex items-center justify-between text-xs font-bold tracking-widest uppercase">
                    <span>Insurance Copy</span>
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
                    className="text-muted bg-background block w-full cursor-pointer rounded-lg border border-[var(--border-subtle)] text-[10px] file:mr-2 file:rounded-md file:border-0 file:bg-[var(--color-brand-green)] file:px-3 file:py-1.5 file:text-[10px] file:font-bold file:text-white file:uppercase hover:file:opacity-90"
                  />
                  {docFiles.INSURANCE_COPY && (
                    <div className="mt-2 truncate text-[10px] font-bold text-[var(--color-brand-green)]">
                      {docFiles.INSURANCE_COPY.name}
                    </div>
                  )}
                </div>

                {/* Loan NOC */}
                <div className="bg-foreground/5 relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] p-4">
                  <div className="mb-2 flex items-center justify-between text-xs font-bold tracking-widest uppercase">
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
                    className="text-muted bg-background block w-full cursor-pointer rounded-lg border border-[var(--border-subtle)] text-[10px] file:mr-2 file:rounded-md file:border-0 file:bg-[var(--color-brand-green)] file:px-3 file:py-1.5 file:text-[10px] file:font-bold file:text-white file:uppercase hover:file:opacity-90"
                  />
                  {docFiles.LOAN_NOC && (
                    <div className="mt-2 truncate text-[10px] font-bold text-[var(--color-brand-green)]">
                      {docFiles.LOAN_NOC.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Upload Tractor Inspection Photos */}
          {isFormEditable && (
            <div>
              <label className="mb-2 block text-xs font-bold tracking-widest uppercase">
                Field Inspection Photos (Max 10)
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
                          showToast('warning', 'A maximum of 10 tractor photos can be selected.');
                          return totalFiles.slice(0, 10);
                        }
                        return totalFiles;
                      });
                    }
                    e.target.value = '';
                  }}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <div className="pointer-events-none flex flex-col items-center justify-center">
                  <Upload className="mb-2 text-[var(--color-brand-green)]" size={32} />
                  <div className="mb-1 rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black tracking-widest text-white uppercase">
                    Choose Photos
                  </div>
                  <span className="text-muted text-xs">Or drag and drop photo files here</span>
                </div>
              </div>

              {imageFiles.length > 0 && (
                <div className="bg-foreground/5 mt-4 rounded-2xl border border-[var(--border-subtle)] p-4">
                  <div className="mb-3 text-xs font-bold">
                    {imageFiles.length} photo{imageFiles.length !== 1 ? 's' : ''} queued for upload
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {imageFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="group relative h-20 w-20 overflow-hidden rounded-xl border border-[var(--border-subtle)] shadow-sm"
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
                          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
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

          {/* Attached Files & Existing Documents View */}
          {isSubmitted && (
            <div className="space-y-6 pt-4">
              {/* Attached Report link */}
              {inspection.reportUrl && (
                <div>
                  <label className="mb-2 block text-xs font-bold tracking-widest uppercase">
                    Official PDF Inspection Report
                  </label>
                  <a
                    href={inspection.reportUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-foreground text-background animate-in fade-in inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition-opacity hover:opacity-90"
                  >
                    <FileText size={16} /> Open Inspection PDF Report
                  </a>
                </div>
              )}

              {/* Uploaded Documents */}
              {listing.documents && listing.documents.length > 0 && (
                <div>
                  <label className="mb-2 block text-xs font-bold tracking-widest uppercase">
                    Uploaded Listing Documents
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                            className="block truncate text-xs font-bold text-[var(--color-brand-green)] hover:underline"
                          >
                            View Document
                          </a>
                        </div>
                        <CheckCircle2
                          size={18}
                          className="shrink-0 text-[var(--color-brand-green)]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit or Save Buttons */}
        {isFormEditable && (
          <div className="bg-foreground/5 flex flex-col gap-4 p-6 sm:flex-row sm:p-8">
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[var(--color-brand-green)] px-8 py-3.5 text-base font-black text-white shadow-[var(--color-brand-green)]/30 shadow-lg transition-all hover:bg-[var(--color-brand-green)]/90 active:scale-95 disabled:opacity-50 sm:w-auto"
            >
              {submitting ? <TractorLoader size={20} /> : <CheckCircle2 size={20} />}
              {inspection.status === 'REPORT_UPLOADED'
                ? 'Save Changes'
                : 'Submit Inspection Report'}
            </button>
            {inspection.status === 'REPORT_UPLOADED' && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="text-foreground hover:bg-foreground/5 flex w-full items-center justify-center rounded-2xl border border-[var(--border-subtle)] px-8 py-3.5 text-base font-black transition-all active:scale-95 disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </form>

      {/* Associated Media Table Data */}
      {listing.media && listing.media.length > 0 && (
        <div className="bg-background animate-in fade-in overflow-hidden rounded-3xl border border-[var(--border-subtle)] p-6 shadow-sm sm:p-8">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-black">
            <FileText className="text-[var(--color-brand-green)]" size={22} />
            Uploaded Media Assets ({listing.media.length})
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)]">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-foreground/5 text-muted border-b border-[var(--border-subtle)] text-[10px] font-bold tracking-widest uppercase">
                  <th className="p-3">Preview</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">File Size</th>
                  <th className="p-3">Primary</th>
                  <th className="p-3">Uploaded</th>
                  <th className="p-3 text-right">Actions</th>
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
                      <td className="p-3">
                        <a
                          href={mediaItem.url}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-foreground/5 block h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[var(--border-subtle)]"
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
                      <td className="p-3">
                        <span className="bg-foreground/5 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                          {mediaItem.mediaType}
                        </span>
                      </td>
                      <td className="text-muted p-3 text-xs">
                        {mediaItem.targetType} (ID: {mediaItem.targetId})
                      </td>
                      <td className="text-muted p-3 text-xs">{fileSizeFriendly}</td>
                      <td className="p-3">
                        {mediaItem.isPrimary ? (
                          <span className="rounded-md bg-[var(--color-brand-green)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--color-brand-green)]">
                            Yes
                          </span>
                        ) : (
                          <span className="text-muted text-[10px]">No</span>
                        )}
                      </td>
                      <td className="text-muted p-3 text-xs">{dateFriendly}</td>
                      <td className="p-3 text-right">
                        <a
                          href={mediaItem.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-[var(--color-brand-green)] hover:underline"
                        >
                          Open
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
