'use client';

import { useState } from 'react';
import { usedTractorEnquiryAPI } from '@/lib/api/used-enquiries';
import { useApiQuery } from '@/hooks/ui/use-api-query';

/** Notes on one CRM lead, paginated; `reload` refetches after a write */
export function useLeadNotes(leadId: number, page: number, limit = 20) {
  return useApiQuery(
    () => usedTractorEnquiryAPI.getLeadNotes({ leadId, page, limit }),
    [leadId, page, limit]
  );
}

/** Add or edit a lead note; `saving` is true while a write is in flight */
export function useLeadNoteActions() {
  const [saving, setSaving] = useState(false);

  const addNote = async (leadId: number, noteText: string) => {
    setSaving(true);
    try {
      return await usedTractorEnquiryAPI.createLeadNote(leadId, noteText);
    } finally {
      setSaving(false);
    }
  };

  const editNote = async (noteId: number, noteText: string) => {
    setSaving(true);
    try {
      return await usedTractorEnquiryAPI.updateLeadNote(noteId, noteText);
    } finally {
      setSaving(false);
    }
  };

  const getNote = async (noteId: number) => {
    return await usedTractorEnquiryAPI.getLeadNoteById(noteId);
  };

  return { saving, addNote, editNote, getNote };
}
