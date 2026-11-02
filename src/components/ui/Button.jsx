import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-display font-bold text-center border-2 border-slate-900 rounded-block transition-all duration-75 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs min-h-[36px]",
    md: "px-5 py-2.5 text-sm min-h-[44px]", // minimum 44px touch target
    lg: "px-6 py-3.5 text-base sm:text-lg min-h-[52px]",
    xl: "px-8 py-4 text-lg sm:text-xl min-h-[60px]"
  };

  const variantStyles = {
    primary: "bg-indigo-600 text-white shadow-block hover:bg-indigo-500 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-block-sm",
    secondary: "bg-white text-slate-900 shadow-block hover:bg-slate-50 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-block-sm",
    success: "bg-emerald-500 text-slate-950 shadow-block hover:bg-emerald-400 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-block-sm",
    danger: "bg-red-500 text-white shadow-block hover:bg-red-400 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-block-sm",
    warning: "bg-amber-400 text-slate-950 shadow-block hover:bg-amber-300 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-block-sm",
    ghost: "bg-transparent text-slate-700 border-transparent hover:bg-slate-200/60 shadow-none hover:translate-y-0 active:translate-y-0",
    
    // Game answer variants
    'game-red': "bg-red-500 text-white shadow-block hover:bg-red-400 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-block-sm",
    'game-blue': "bg-blue-600 text-white shadow-block hover:bg-blue-500 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-block-sm",
    'game-yellow': "bg-amber-400 text-slate-950 shadow-block hover:bg-amber-300 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-block-sm",
    'game-green': "bg-emerald-500 text-slate-950 shadow-block hover:bg-emerald-400 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-block-sm",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${widthStyle} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Memuat...</span>
        </span>
      ) : children}
    </button>
  );
};
