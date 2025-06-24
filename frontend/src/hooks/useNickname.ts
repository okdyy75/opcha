'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateRandomNickname } from '@/utils/nickname';

const STORAGE_KEY = 'opcha_nickname';

export function useNickname() {
  const [nickname, setNickname] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // 初回ロード時にLocalStorageからニックネームを取得
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setNickname(stored);
    } else {
      // 初回訪問時は自動生成
      const generated = generateRandomNickname();
      setNickname(generated);
      localStorage.setItem(STORAGE_KEY, generated);
    }
    setIsLoading(false);
  }, []);

  // ニックネームを更新
  const updateNickname = useCallback((newNickname: string) => {
    const trimmed = newNickname.trim();
    if (trimmed && trimmed.length <= 20) {
      setNickname(trimmed);
      localStorage.setItem(STORAGE_KEY, trimmed);
      return true;
    }
    return false;
  }, []);

  // ニックネームをランダム生成し直す
  const regenerateNickname = useCallback(() => {
    const generated = generateRandomNickname();
    setNickname(generated);
    localStorage.setItem(STORAGE_KEY, generated);
  }, []);

  return {
    nickname,
    isLoading,
    updateNickname,
    regenerateNickname,
  };
} 