import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; height?: string }> = ({
  rows = 3,
  height = 'h-16',
}) => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`bg-slate-200/80 rounded-xl w-full ${height}`} />
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-1/3" />
      <div className="h-4 bg-slate-100 rounded w-2/3" />
      <div className="space-y-2 pt-2">
        <div className="h-4 bg-slate-100 rounded w-full" />
        <div className="h-4 bg-slate-100 rounded w-4/5" />
      </div>
      <div className="flex gap-2 pt-4">
        <div className="h-8 bg-slate-200 rounded-lg w-20" />
        <div className="h-8 bg-slate-200 rounded-lg w-24" />
      </div>
    </div>
  );
};

