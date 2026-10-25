'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { HarvestersClient } from '@/components/harvesters/HarvestersClient';

export default function HarvesterTypePage({ params }: { params: Promise<{ type: string }> }) {
  const resolvedParams = use(params);
  const typeKey = resolvedParams.type.toLowerCase();

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Link
          href="/harvesters"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Back to All Harvesters
        </Link>
      </div>
      <HarvestersClient initialType={typeKey} />
    </div>
  );
}
