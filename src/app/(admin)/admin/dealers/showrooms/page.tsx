'use client';
import React from 'react';
import { Construction } from 'lucide-react';

export default function ShowroomsAdminPage() {
  return (
    <div className="flex h-full min-h-[380px] flex-col items-center justify-center p-8 text-center">
      <Construction size={64} className="text-muted mb-4 opacity-50" />
      <h1 className="text-foreground mb-2 text-2xl font-black">Showrooms Management</h1>
      <p className="text-muted max-w-md">
        This admin module is currently being built. It will provide full management capabilities for
        dealer showrooms.
      </p>
    </div>
  );
}
