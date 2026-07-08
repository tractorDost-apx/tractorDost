'use client';
import React from 'react';
import { Construction } from 'lucide-react';

export default function FaqsAdminPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center p-8">
      <Construction size={64} className="text-muted mb-4 opacity-50" />
      <h1 className="text-2xl font-black mb-2 text-foreground">FAQs Management</h1>
      <p className="text-muted max-w-md">
        This admin module is currently being built. It will provide full management capabilities for FAQs.
      </p>
    </div>
  );
}
