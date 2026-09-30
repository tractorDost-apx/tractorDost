'use client';
import React from 'react';
import { Construction } from 'lucide-react';

export default function SpamBlacklistAdminPage() {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center p-8 text-center">
      <Construction size={64} className="text-muted mb-4 opacity-50" />
      <h1 className="text-foreground mb-2 text-2xl font-black">Spam Blacklist Management</h1>
      <p className="text-muted max-w-md">
        This admin module is currently being built. It will provide full management capabilities for
        the spam phone blacklist.
      </p>
    </div>
  );
}
