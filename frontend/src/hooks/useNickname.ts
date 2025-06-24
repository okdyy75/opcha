'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateRandomNickname } from '@/utils/nickname';

const STORAGE_KEY = 'opcha_nickname';

// LocalStorageへの安全なアクセス
const getStoredNickname = (): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(STORAGE_KEY);
    }
  } catch (error) {
    console.warn('localStorage read failed:', error);
  }
  return null;
};

const setStoredNickname = (nickname: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, nickname);
    }
  } catch (error) {
    console.warn('localStorage write failed:', error);
  }
};

export function useNickname() {
  const [nickname, setNickname] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // 初回ロード時にLocalStorageからニックネームを取得
  useEffect(() => {
    try {
      const stored = getStoredNickname();
      if (stored) {
        setNickname(stored);
      } else {
        // 初回訪問時は自動生成
        const generated = generateRandomNickname();
        setNickname(generated);
        setStoredNickname(generated);
      }
    } catch (error) {
      console.error('Failed to initialize nickname:', error);
      // エラー時でもフォールバック値を設定
      try {
        const fallbackNickname = generateRandomNickname();
        setNickname(fallbackNickname);
      } catch (generateError) {
        console.error('Failed to generate fallback nickname:', generateError);
        setNickname('ゲスト'); // 最終フォールバック
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ニックネームを更新
  const updateNickname = useCallback((newNickname: string) => {
    try {
      const trimmed = newNickname.trim();
      if (trimmed && trimmed.length <= 20) {
        setNickname(trimmed);
        setStoredNickname(trimmed);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update nickname:', error);
      return false;
    }
  }, []);

  // ニックネームをランダム生成し直す
  const regenerateNickname = useCallback(() => {
    try {
      const generated = generateRandomNickname();
      setNickname(generated);
      setStoredNickname(generated);
    } catch (error) {
      console.error('Failed to regenerate nickname:', error);
      // エラー時でも何らかの値を設定
      const fallbackNickname = 'ゲスト' + Math.floor(Math.random() * 1000);
      setNickname(fallbackNickname);
      setStoredNickname(fallbackNickname);
    }
  }, []);

  return {
    nickname,
    isLoading,
    updateNickname,
    regenerateNickname,
  };
} 