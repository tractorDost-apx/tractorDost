import React from 'react';
import TractorForm from '../components/TractorForm';

export default function NewTractorPage() {
  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-foreground text-3xl font-black tracking-tight">Add New Tractor</h1>
        <p className="text-muted text-sm font-bold">Create a new tractor entry in the catalog.</p>
      </div>

      <TractorForm isEdit={false} />
    </div>
  );
}
