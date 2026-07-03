import React from 'react';
import TractorForm from '../components/TractorForm';

export default function NewTractorPage() {
  return (
    <div className="w-full h-full flex flex-col gap-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Add New Tractor</h1>
        <p className="text-sm font-bold text-muted">Create a new tractor entry in the catalog.</p>
      </div>

      <TractorForm isEdit={false} />
    </div>
  );
}
