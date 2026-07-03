'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { SpatialButton } from '@/components/ui/spatial-button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Something went wrong!</h2>
      <p className="text-muted-foreground max-w-md text-center">
        {error.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <SpatialButton variant="primary" onClick={() => reset()}>
        Try again
      </SpatialButton>
    </div>
  );
}
