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
  Phone
} from 'lucide-react';
import Link from 'next/link';
import { TractorLoader } from '@/components/ui/TractorLoader';

export default function AgentInspectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [inspection, setInspection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [scores, setScores] = useState({
    engineScore: 0,
    tyreScore: 0,
    hydraulicsScore: 0,
    bodyScore: 0,
    clutchScore: 0
  });
  const [inspectorNotes, setInspectorNotes] = useState('');
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [docFiles, setDocFiles] = useState<{ RC_COPY?: File; INSURANCE_COPY?: File; LOAN_NOC?: File }>({});

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
            tyreScore: res.data.tyreScore,
            hydraulicsScore: res.data.hydraulicsScore,
            bodyScore: res.data.bodyScore,
            clutchScore: res.data.clutchScore,
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
        imageFiles.forEach(file => {
          mediaData.append('file', file);
        });
        try {
          await mediaAPI.createMedia(mediaData);
        } catch (imgErr: any) {
          const imgErrMsg = imgErr?.response?.data?.message || imgErr?.message || 'Image upload failed';
          console.error('[Image Upload Error]', imgErr);
          alert(`Image upload failed: ${imgErrMsg}\n\nWill still try to submit the report.`);
        }
      }

      // Step 1.5: Upload Official Documents
      const docTypes: ('RC_COPY' | 'INSURANCE_COPY' | 'LOAN_NOC')[] = ['RC_COPY', 'INSURANCE_COPY', 'LOAN_NOC'];
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

      const res = await usedTractorInspectionAPI.submitInspectionReport(unwrappedParams.id, formData);
      if (res.success) {
        alert('Inspection report submitted successfully!');
        router.push('/agent/inspections');
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
    return (
      <div className="p-8 text-center font-bold text-muted">Inspection not found.</div>
    );
  }

  const isSubmitted = inspection.status !== 'ASSIGNED';
  const listing = inspection.listing;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <Link href="/agent/inspections" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-foreground transition-colors mb-4">
        <ArrowLeft size={16} /> Back to Inspections
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <Wrench className="text-[var(--color-brand-green)]" size={32} />
          {isSubmitted ? 'Inspection Report' : 'Submit Inspection'}
        </h1>
        <span className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest ${
          isSubmitted ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' : 'bg-orange-500/10 text-orange-500'
        }`}>
          {inspection.status.replace('_', ' ')}
        </span>
      </div>

      {/* Listing Details Card */}
      <div className="bg-background rounded-3xl p-8 border border-[var(--border-subtle)] shadow-sm">
        <div className="flex flex-col md:flex-row gap-8">
          {listing.media?.[0] ? (
            <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden shrink-0">
              <img src={listing.media[0].url} alt="Tractor" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full md:w-48 h-48 rounded-2xl bg-foreground/5 flex items-center justify-center shrink-0">
              <span className="text-muted font-bold">No Image</span>
            </div>
          )}
          
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-black">{listing.tractorBrand} {listing.tractorModel}</h2>
              <p className="text-lg font-bold text-muted">Year: {listing.yearOfManufacture || 'N/A'} • {listing.hoursUsed || 'N/A'} Hours</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-foreground/5 p-4 rounded-xl flex items-center gap-3">
                <MapPin className="text-[var(--color-brand-green)]" size={20} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">Location</p>
                  <p className="font-bold">{listing.villageCity || listing.district || 'Unknown'}, {listing.district || 'Unknown'}</p>
                </div>
              </div>
              <div className="bg-foreground/5 p-4 rounded-xl flex items-center gap-3">
                <Phone className="text-[var(--color-brand-green)]" size={20} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">Customer Phone</p>
                  <p className="font-bold">{listing.seller?.mobile ? String(listing.seller.mobile) : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inspection Form */}
      <form onSubmit={handleSubmit} className="bg-background rounded-3xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-[var(--border-subtle)]">
          <h3 className="text-xl font-black mb-6">Condition Scores (0-100)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {['engineScore', 'tyreScore', 'hydraulicsScore', 'bodyScore', 'clutchScore'].map((field) => (
              <div key={field} className="bg-foreground/5 p-6 rounded-2xl border border-[var(--border-subtle)]">
                <label className="flex justify-between items-center mb-4">
                  <span className="font-black capitalize">{field.replace('Score', '')} Score</span>
                  <span className="text-2xl font-black text-[var(--color-brand-green)]">
                    {(scores as any)[field]}<span className="text-sm text-muted">/100</span>
                  </span>
                </label>
                <input
                  type="range"
                  min="0" max="100" step="1"
                  value={(scores as any)[field]}
                  disabled={isSubmitted}
                  onChange={(e) => setScores({ ...scores, [field]: Number(e.target.value) })}
                  className="w-full accent-[var(--color-brand-green)] disabled:opacity-50"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 border-b border-[var(--border-subtle)] space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest mb-3">Field Inspector Notes</label>
            <textarea
              rows={4}
              value={inspectorNotes}
              disabled={isSubmitted}
              onChange={(e) => setInspectorNotes(e.target.value)}
              placeholder="Enter detailed observations here..."
              className="w-full bg-foreground/5 border border-[var(--border-subtle)] rounded-2xl p-4 font-medium focus:outline-none focus:border-[var(--color-brand-green)] disabled:opacity-50"
            />
          </div>

          {!isSubmitted && (
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-3">Upload PDF Report <span className="text-red-500">*</span></label>
              <input
                type="file"
                accept=".pdf"
                required={!isSubmitted}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setReportFile(e.target.files[0]);
                  }
                }}
                className="block w-full text-sm text-muted
                  file:mr-4 file:py-3 file:px-6
                  file:rounded-xl file:border-0
                  file:text-sm file:font-black file:uppercase file:tracking-widest
                  file:bg-[var(--color-brand-green)] file:text-white
                  hover:file:opacity-90 cursor-pointer border border-[var(--border-subtle)] rounded-xl bg-background"
              />
            </div>
          )}

          {!isSubmitted && (
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-3">Official Documents (RC, Insurance, Loan NOC)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* RC Book */}
                <div className="bg-foreground/5 p-4 rounded-2xl border border-[var(--border-subtle)] relative overflow-hidden">
                  <div className="font-bold text-sm mb-3 uppercase tracking-widest flex items-center justify-between">
                    <span>RC Copy</span>
                    {docFiles.RC_COPY && <CheckCircle2 size={16} className="text-[var(--color-brand-green)]" />}
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setDocFiles(prev => ({ ...prev, RC_COPY: e.target.files![0] }));
                      }
                    }}
                    className="block w-full text-xs text-muted
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-[10px] file:font-bold file:uppercase
                      file:bg-[var(--color-brand-green)] file:text-white
                      hover:file:opacity-90 cursor-pointer border border-[var(--border-subtle)] rounded-lg bg-background"
                  />
                  {docFiles.RC_COPY && <div className="text-[10px] text-[var(--color-brand-green)] mt-2 font-bold truncate">Selected: {docFiles.RC_COPY.name}</div>}
                </div>

                {/* Insurance */}
                <div className="bg-foreground/5 p-4 rounded-2xl border border-[var(--border-subtle)] relative overflow-hidden">
                  <div className="font-bold text-sm mb-3 uppercase tracking-widest flex items-center justify-between">
                    <span>Insurance</span>
                    {docFiles.INSURANCE_COPY && <CheckCircle2 size={16} className="text-[var(--color-brand-green)]" />}
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setDocFiles(prev => ({ ...prev, INSURANCE_COPY: e.target.files![0] }));
                      }
                    }}
                    className="block w-full text-xs text-muted
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-[10px] file:font-bold file:uppercase
                      file:bg-[var(--color-brand-green)] file:text-white
                      hover:file:opacity-90 cursor-pointer border border-[var(--border-subtle)] rounded-lg bg-background"
                  />
                  {docFiles.INSURANCE_COPY && <div className="text-[10px] text-[var(--color-brand-green)] mt-2 font-bold truncate">Selected: {docFiles.INSURANCE_COPY.name}</div>}
                </div>

                {/* Loan NOC */}
                <div className="bg-foreground/5 p-4 rounded-2xl border border-[var(--border-subtle)] relative overflow-hidden">
                  <div className="font-bold text-sm mb-3 uppercase tracking-widest flex items-center justify-between">
                    <span>Loan NOC</span>
                    {docFiles.LOAN_NOC && <CheckCircle2 size={16} className="text-[var(--color-brand-green)]" />}
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setDocFiles(prev => ({ ...prev, LOAN_NOC: e.target.files![0] }));
                      }
                    }}
                    className="block w-full text-xs text-muted
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-[10px] file:font-bold file:uppercase
                      file:bg-[var(--color-brand-green)] file:text-white
                      hover:file:opacity-90 cursor-pointer border border-[var(--border-subtle)] rounded-lg bg-background"
                  />
                  {docFiles.LOAN_NOC && <div className="text-[10px] text-[var(--color-brand-green)] mt-2 font-bold truncate">Selected: {docFiles.LOAN_NOC.name}</div>}
                </div>

              </div>
            </div>
          )}

          {!isSubmitted && (
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-3">Upload Tractor Images (Optional)</label>
              
              <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-2xl p-6 text-center hover:bg-foreground/5 transition-colors cursor-pointer relative">
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
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <div className="bg-[var(--color-brand-green)] text-white text-sm font-black uppercase tracking-widest py-3 px-6 rounded-xl mb-2">
                    Select Images
                  </div>
                  <span className="text-sm text-muted">Or drag and drop files here</span>
                </div>
              </div>
              
              {imageFiles.length > 0 && (
                <div className="mt-4 p-4 bg-foreground/5 rounded-2xl border border-[var(--border-subtle)]">
                  <div className="text-sm font-bold mb-3">{imageFiles.length} Image{imageFiles.length !== 1 ? 's' : ''} Selected</div>
                  <div className="flex gap-3 flex-wrap">
                    {imageFiles.map((file, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-[var(--border-subtle)] group shadow-sm">
                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setImageFiles((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
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

          {isSubmitted && inspection.reportUrl && (
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest mb-3">Attached Report</label>
              <a 
                href={inspection.reportUrl} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-black text-sm hover:opacity-90 transition-opacity"
              >
                <FileText size={18} /> View PDF Report
              </a>
            </div>
          )}
        </div>

        {!isSubmitted && (
          <div className="p-8 bg-foreground/5">
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-10 py-4 bg-[var(--color-brand-green)] text-white font-black text-lg rounded-2xl hover:bg-[var(--color-brand-green)]/90 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-[var(--color-brand-green)]/30 flex items-center justify-center gap-3"
            >
              {submitting ? <TractorLoader size={24} /> : <CheckCircle2 size={24} />}
              Submit Inspection Report
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
