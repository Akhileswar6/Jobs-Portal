import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const MatchScoreBadge: React.FC<{ score: number; showLabel?: boolean }> = ({
  score,
  showLabel = true,
}) => {
  let color = 'text-rose-700 bg-rose-50 border-rose-200';
  let badgeText = 'Low Match';

  if (score >= 80) {
    color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    badgeText = 'High Match';
  } else if (score >= 60) {
    color = 'text-indigo-700 bg-indigo-50 border-indigo-200';
    badgeText = 'Good Match';
  } else if (score >= 40) {
    color = 'text-amber-700 bg-amber-50 border-amber-200';
    badgeText = 'Fair Match';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-semibold text-xs ${color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      <span>{score}%</span>
      {showLabel && <span className="opacity-80">· {badgeText}</span>}
    </div>
  );
};

