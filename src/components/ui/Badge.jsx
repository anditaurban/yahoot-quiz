import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const base = "inline-flex items-center gap-1.5 font-display font-bold border-2 border-slate-900 rounded-md select-none";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs sm:text-sm",
    lg: "px-3 py-1.5 text-sm sm:text-base",
  };

  const variantStyles = {
    neutral: "bg-slate-100 text-slate-800",
    primary: "bg-indigo-100 text-indigo-900 border-slate-900",
    success: "bg-emerald-200 text-emerald-950 border-slate-900",
    warning: "bg-amber-200 text-amber-950 border-slate-900",
    danger: "bg-red-200 text-red-950 border-slate-900",
    purple: "bg-purple-200 text-purple-950 border-slate-900",
    gold: "bg-yellow-400 text-slate-950 border-slate-900 shadow-sm",
  };

  return (
    <span className={`${base} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.neutral} ${className}`}>
      {children}
    </span>
  );
};
