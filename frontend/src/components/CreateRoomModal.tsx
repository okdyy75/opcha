'use client';

import { useState } from 'react';
import Modal from './Modal';
import { sanitizeText, validateInput, isValidRoomName, ClientRateLimit } from '../utils/security';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (roomName: string) => Promise<void>;
  onShowToast?: (message: string, type: 'success' | 'error' | 'warning') => void;
  isCreating?: boolean;
}

export default function CreateRoomModal({ isOpen, onClose, onCreateRoom, onShowToast, isCreating = false }: CreateRoomModalProps) {
  const [roomName, setRoomName] = useState('');

  const handleSubmit = async () => {
    if (!roomName.trim() || isCreating) return;

    // セキュリティチェック
    const validation = validateInput(roomName.trim(), 50);
    if (!validation.isValid) {
      onShowToast?.(validation.error || 'ルーム名が無効です', 'error');
      return;
    }

    if (!isValidRoomName(roomName.trim())) {
      onShowToast?.('ルーム名に不正な文字が含まれています', 'error');
      return;
    }

    // レート制限チェック
    if (!ClientRateLimit.check('room_create', 5, 300000)) {
      onShowToast?.('ルーム作成が頻繁すぎます。しばらく待ってから再試行してください', 'error');
      return;
    }

    try {
      const sanitizedName = sanitizeText(roomName.trim());
      await onCreateRoom(sanitizedName);
      setRoomName('');
    } catch (error) {
      // エラーはonCreateRoom内でハンドリング済み
      console.error('Room creation failed:', error);
    }
  };

  const handleClose = () => {
    setRoomName('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="新しいルームを作成" showCloseButton={true}>
      <div className="mb-4">
        <label 
          htmlFor="room-name-input"
          className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
        >
          ルーム名
        </label>
        <input
          id="room-name-input"
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && roomName.trim()) {
              handleSubmit();
            }
          }}
          placeholder="ルーム名を入力"
          className="w-full p-3 border border-[var(--color-border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent"
          autoFocus
          maxLength={50}
        />
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          わかりやすいルーム名を入力してください（50文字以内）
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleClose}
          className="flex-1 py-3 border border-[var(--color-border-primary)] rounded-lg font-medium hover:bg-[var(--color-bg-secondary)] transition-colors"
        >
          キャンセル
        </button>
        <button
          onClick={handleSubmit}
          disabled={!roomName.trim() || isCreating}
          className="flex-1 py-3 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? '作成中...' : '作成'}
        </button>
      </div>
    </Modal>
  );
}