'use client';

import { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-sm',
  showCloseButton = false 
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    // Escキーでモーダルを閉じる
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // body のスクロールを無効化
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={`bg-white rounded-lg p-6 w-full ${maxWidth}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 id="modal-title" className="text-lg font-semibold">{title}</h3>
          {showCloseButton && onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="モーダルを閉じる"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}