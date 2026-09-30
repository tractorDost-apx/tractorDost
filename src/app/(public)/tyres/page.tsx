import React from 'react';

export default function TyresPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6 text-center">
      <div className="glass-panel relative w-full max-w-2xl overflow-hidden p-12">
        <div className="pointer-events-none absolute top-[-20%] right-[-10%] h-[100px] w-[100px] rounded-full bg-lime-400/10 blur-[50px]" />
        <h1 className="mb-4 text-3xl font-bold text-lime-400">Tyres</h1>
        <p className="text-muted-foreground text-lg">
          This section is currently under development. Detailed features and content will be added
          here soon!
        </p>
      </div>
    </div>
  );
}
