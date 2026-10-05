'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { TractorCatalogSearchStep } from './TractorCatalogSearchStep';
import { TractorListingDetailsForm } from './TractorListingDetailsForm';
import { Tractor } from '@/lib/api/tractors';

interface AddUsedTractorFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  dealerName?: string | null;
}

type FlowStep = 'search' | 'details';

export function AddUsedTractorFlow({
  isOpen,
  onClose,
  onSuccess,
  dealerName,
}: AddUsedTractorFlowProps) {
  const [step, setStep] = useState<FlowStep>('search');
  const [selectedTractor, setSelectedTractor] = useState<Tractor | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleTractorSelected = (tractor: Tractor) => {
    setSelectedTractor(tractor);
    setStep('details');
  };

  const handleBackToSearch = () => {
    setStep('search');
    setSelectedTractor(null);
  };

  const handleFormSuccess = (message: string) => {
    onSuccess(message);
    setToastMessage({ type: 'success', text: message });
    onClose();
  };

  const handleFormError = (error: string) => {
    setToastMessage({ type: 'error', text: error });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border p-4 text-xs font-bold shadow-2xl ${
            toastMessage.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle size={18} className="shrink-0 text-rose-500" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Modal Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative my-8 w-full max-w-2xl rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--background)] shadow-2xl flex flex-col h-[90vh]">
          {/* Header */}
          <div className="border-b border-[var(--border-subtle)] px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {step === 'details' && (
                  <button
                    onClick={handleBackToSearch}
                    className="rounded-lg p-1.5 text-muted hover:bg-foreground/5 transition-colors shrink-0"
                    title="Back to search"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-black text-foreground truncate">
                    {step === 'search' ? 'Select Tractor from Catalog' : 'Listing Details'}
                  </h2>
                  <p className="text-xs text-muted font-medium mt-0.5 truncate">
                    {step === 'search'
                      ? 'Search and select a tractor model to list'
                      : selectedTractor
                      ? `${selectedTractor.brand?.name || 'Model'} ${selectedTractor.modelName || ''}`
                      : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted hover:bg-foreground/5 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {step === 'search' ? (
              <TractorCatalogSearchStep onSelect={handleTractorSelected} />
            ) : selectedTractor ? (
              <TractorListingDetailsForm
                selectedTractor={selectedTractor}
                dealerName={dealerName}
                onSuccess={handleFormSuccess}
                onError={handleFormError}
                onBackClick={handleBackToSearch}
              />
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
