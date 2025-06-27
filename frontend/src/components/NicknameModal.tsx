'use client';

import { useState, useEffect } from 'react';
import { generateRandomNickname } from '@/utils/nickname';
import Modal from './Modal';

interface NicknameModalProps {
  isOpen: boolean;
  currentNickname: string;
  onClose: () => void;
  onUpdate: (nickname: string) => boolean | Promise<boolean>;
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

  const handleSubmit = async () => {
    if (!tempNickname.trim()) {
      setError('ニックネームを入力してください');
      return;
    }
    
    if (tempNickname.length > 20) {
      setError('ニックネームは20文字以内で入力してください');
      return;
    }

    const success = await onUpdate(tempNickname);
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

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="ニックネーム設定" 
      showCloseButton={true}
    >
      <div className="mb-4">
        <label 
          htmlFor="nickname-input"
          className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
        >
          ニックネーム
        </label>
        <div className="flex gap-2">
          <input
            id="nickname-input"
            type="text"
            value={tempNickname}
            onChange={(e) => {
              setTempNickname(e.target.value);
              setError('');
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
            placeholder="ニックネームを入力"
            className="flex-1 p-3 border border-[var(--color-border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent"
            maxLength={20}
          />
          <button
            onClick={handleRegenerate}
            className="px-3 py-2 border border-[var(--color-border-primary)] rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
            title="ランダム生成"
            aria-label="ランダムなニックネームを生成"
          >
            <span role="img" aria-label="サイコロ">🎲</span>
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-xs mt-1" role="alert">{error}</p>
        )}
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          20文字以内で入力してください
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 border border-[var(--color-border-primary)] rounded-lg font-medium hover:bg-[var(--color-bg-secondary)] transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className="flex-1 py-3 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white rounded-lg font-medium transition-colors"
        >
          設定
        </button>
      </div>
    </Modal>
  );
} 