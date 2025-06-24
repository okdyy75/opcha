'use client';

import { useState } from 'react';
import Modal from './Modal';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (roomName: string) => void;
}

export default function CreateRoomModal({ isOpen, onClose, onCreateRoom }: CreateRoomModalProps) {
  const [roomName, setRoomName] = useState('');

  const handleSubmit = () => {
    if (roomName.trim()) {
      onCreateRoom(roomName.trim());
      setRoomName('');
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
          disabled={!roomName.trim()}
          className="flex-1 py-3 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          作成
        </button>
      </div>
    </Modal>
  );
}