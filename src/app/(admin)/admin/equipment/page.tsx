import React from 'react';

export default function EquipmentPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6 text-center">
      <div className="glass-panel p-12 max-w-2xl w-full relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] h-[100px] w-[100px] rounded-full bg-lime-400/10 blur-[50px] pointer-events-none" />
        <h1 className="text-3xl font-bold text-lime-400 mb-4">Equipment</h1>
        <p className="text-muted-foreground text-lg">
          This section is currently under development. Detailed features and content will be added here soon!
        </p>
      </div>
    </div>
  );
}
