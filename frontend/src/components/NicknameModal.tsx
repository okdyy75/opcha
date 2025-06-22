'use client';

import { useState, useEffect } from 'react';
import { generateRandomNickname } from '@/utils/nickname';

interface NicknameModalProps {
  isOpen: boolean;
  currentNickname: string;
  onClose: () => void;
  onUpdate: (nickname: string) => boolean;
}

export default function NicknameModal({ 
  isOpen, 
  currentNickname, 
  onClose, 
  onUpdate
}: NicknameModalProps) {
  const [tempNickname, setTempNickname] = useState(currentNickname);
  const [error, setError] = useState('');

  useEffect(() => {
    setTempNickname(currentNickname);
    setError('');
  }, [currentNickname, isOpen]);

  const handleSubmit = () => {
    if (!tempNickname.trim()) {
      setError('ニックネームを入力してください');
      return;
    }
    
    if (tempNickname.length > 20) {
      setError('ニックネームは20文字以内で入力してください');
      return;
    }

    const success = onUpdate(tempNickname);
    if (success) {
      onClose();
    } else {
      setError('ニックネームの設定に失敗しました');
    }
  };

  const handleRegenerate = () => {
    const newNickname = generateRandomNickname();
    setTempNickname(newNickname);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">ニックネーム設定</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--line-gray)] rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-[var(--line-dark-gray)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            ニックネーム
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tempNickname}
              onChange={(e) => {
                setTempNickname(e.target.value);
                setError('');
              }}
              placeholder="ニックネームを入力"
              className="flex-1 p-3 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--line-green)] focus:border-transparent text-sm"
              maxLength={20}
            />
            <button
              onClick={handleRegenerate}
              className="px-3 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--line-gray)] transition-colors text-sm"
              title="ランダム生成"
            >
              🎲
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-xs mt-1">{error}</p>
          )}
          <p className="text-xs text-[var(--line-dark-gray)] mt-1">
            20文字以内で入力してください
          </p>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-[var(--border-color)] rounded-lg font-medium hover:bg-[var(--line-gray)] transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-[var(--line-green)] hover:bg-[var(--line-green-hover)] text-white rounded-lg font-medium transition-colors"
          >
            設定
          </button>
        </div>
      </div>
    </div>
  );
} 