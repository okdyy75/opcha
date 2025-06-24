'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'opcha_session_id';

// 暗号学的に安全なランダムな英数字のセッションIDを生成
const generateSessionId = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  try {
    // ブラウザ環境での暗号学的に安全な乱数生成
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(6);
      window.crypto.getRandomValues(array);
      
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(array[i] % chars.length);
      }
      return result;
    }
  } catch (error) {
    console.warn('crypto.getRandomValues() failed, falling back to Math.random():', error);
  }
  
  // フォールバック: Math.random()を使用
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// LocalStorageへの安全なアクセス
const getStoredSessionId = (): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(STORAGE_KEY);
    }
  } catch (error) {
    console.warn('localStorage read failed:', error);
  }
  return null;
};

const setStoredSessionId = (sessionId: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, sessionId);
    }
  } catch (error) {
    console.warn('localStorage write failed:', error);
  }
};

export function useSessionId() {
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // 初回ロード時にLocalStorageからセッションIDを取得
  useEffect(() => {
    try {
      const stored = getStoredSessionId();
      if (stored) {
        setSessionId(stored);
      } else {
        // 初回訪問時は自動生成
        const generated = generateSessionId();
        setSessionId(generated);
        setStoredSessionId(generated);
      }
    } catch (error) {
      console.error('Failed to initialize session ID:', error);
      // エラー時でもフォールバック値を設定
      const fallbackId = generateSessionId();
      setSessionId(fallbackId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sessionId,
    isLoading,
  };
} 