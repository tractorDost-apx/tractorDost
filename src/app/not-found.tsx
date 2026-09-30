import React from 'react';

export default function PlaceholderComponent() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6 text-center">
      <div className="glass-panel relative w-full max-w-2xl overflow-hidden p-12">
        <h1 className="mb-4 text-3xl font-bold text-lime-400">App</h1>
        <p className="text-muted-foreground text-lg">
          This section (not-found.tsx) is currently under development. Content will be added here
          soon!
        </p>
      </div>
    </div>
  );
}
