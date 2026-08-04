import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-4 animate-pulse p-4">
      <div className="h-8 bg-ink/10 rounded-2xl w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-32 bg-ink/10 rounded-3xl"></div>
        <div className="h-32 bg-ink/10 rounded-3xl"></div>
        <div className="h-32 bg-ink/10 rounded-3xl"></div>
      </div>
      <div className="h-64 bg-ink/10 rounded-3xl w-full"></div>
    </div>
  );
};
