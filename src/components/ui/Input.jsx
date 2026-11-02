import React from 'react';

export const Input = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  helperText = '',
  disabled = false,
  required = false,
  className = '',
  inputClassName = '',
  autoFocus = false,
  maxLength,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs sm:text-sm font-display font-bold text-slate-900 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
          {maxLength && (
            <span className="text-[11px] font-normal text-slate-500 font-sans">
              {(value || '').length}/{maxLength}
            </span>
          )}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        maxLength={maxLength}
        className={`w-full min-h-[46px] px-3.5 py-2.5 bg-white text-slate-900 font-sans text-sm sm:text-base border-2 rounded-block transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 disabled:bg-slate-100 disabled:cursor-not-allowed ${
          error ? 'border-red-500 focus:border-red-600' : 'border-slate-900 focus:border-indigo-600'
        } ${inputClassName}`}
        {...props}
      />

      {error ? (
        <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-0.5">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
};
