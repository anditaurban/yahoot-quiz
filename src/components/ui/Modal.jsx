import React, { useEffect } from 'react';
import { Button } from './Button';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Dialog */}
      <div
        className={`relative z-10 w-full ${maxWidth} bg-white border-3 border-slate-900 rounded-block-lg shadow-block-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-amber-300 border-b-2 border-slate-900">
          <h2 id="modal-title" className="font-display font-black text-lg sm:text-xl text-slate-950 tracking-tight">
            {title}
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            aria-label="Tutup modal"
            className="!px-2.5 !py-1"
          >
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
