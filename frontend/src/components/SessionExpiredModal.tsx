'use client';

import { useEffect } from 'react';

interface SessionExpiredModalProps {
  isExpired: boolean;
  onReload: () => void;
}

export default function SessionExpiredModal({ isExpired, onReload }: SessionExpiredModalProps) {
  useEffect(() => {
    if (isExpired) {
      // セッション期限切れ時に自動的にページをリロード
      const timer = setTimeout(() => {
        onReload();
      }, 5000); // 5秒後に自動リロード

      return () => clearTimeout(timer);
    }
  }, [isExpired, onReload]);

  if (!isExpired) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 text-orange-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          セッションが期限切れです
        </h3>
        
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          セッションの有効期限が切れました。ページを再読み込みして新しいセッションを開始します。
        </p>
        
        <div className="space-y-2">
          <p className="text-xs text-[var(--color-text-secondary)]">
            5秒後に自動的に再読み込みされます
          </p>
          
          <button
            onClick={onReload}
            className="w-full px-4 py-2 text-sm font-medium bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white rounded-lg transition-colors"
          >
            今すぐ再読み込み
          </button>
        </div>
      </div>
    </div>
  );
}