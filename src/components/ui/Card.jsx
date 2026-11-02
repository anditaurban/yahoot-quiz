import React from 'react';

export const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  ...props
}) => {
  const base = "border-2 border-slate-900 rounded-block transition-all";

  const paddingStyles = {
    none: "p-0",
    sm: "p-3 sm:p-4",
    md: "p-5 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  const variantStyles = {
    default: "bg-white text-slate-900 shadow-block",
    elevated: "bg-white text-slate-900 shadow-block-lg",
    subtle: "bg-slate-50 text-slate-900 shadow-block",
    accent: "bg-amber-50 border-amber-900 text-slate-900 shadow-block",
    interactive: "bg-white text-slate-900 shadow-block hover:-translate-y-0.5 hover:shadow-block-lg cursor-pointer",
    dark: "bg-slate-900 text-white shadow-block border-slate-950",
  };

  return (
    <div
      className={`${base} ${paddingStyles[padding] || paddingStyles.md} ${variantStyles[variant] || variantStyles.default} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};
