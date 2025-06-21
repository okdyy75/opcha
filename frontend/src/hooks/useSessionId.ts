'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'opcha_session_id';

// ランダムな英数字のセッションIDを生成
const generateSessionId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '#';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export function useSessionId() {
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // 初回ロード時にLocalStorageからセッションIDを取得
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSessionId(stored);
    } else {
      // 初回訪問時は自動生成
      const generated = generateSessionId();
      setSessionId(generated);
      localStorage.setItem(STORAGE_KEY, generated);
    }
    setIsLoading(false);
  }, []);

  return {
    sessionId,
    isLoading,
  };
} 