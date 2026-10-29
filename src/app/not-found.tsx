import React from 'react';

export default function PlaceholderComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 pt-28 pb-12 text-center sm:px-6">
      <div className="glass-panel relative w-full max-w-2xl overflow-hidden p-8 sm:p-12">
        <h1 className="mb-4 text-3xl font-bold text-lime-400">Page Not Found</h1>
        <p className="text-muted-foreground text-lg">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
    </div>
  );
}
