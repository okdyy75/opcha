'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateRandomNickname } from '@/utils/nickname';
import { apiClient } from '@/lib/api';

export function useSession() {
  const [nickname, setNickname] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // セッション情報を取得
  const fetchSession = useCallback(async () => {
    try {
      const { data, error } = await apiClient.getSession();
      
      if (error) {
        console.warn('セッション情報の取得に失敗しました:', error);
      } else if (data) {
        const currentNickname = data.session.nickname;
        
        // ニックネームが空の場合は自動生成して設定
        if (!currentNickname || currentNickname.trim() === '') {
          const generated = generateRandomNickname();
          try {
            const updateResult = await apiClient.updateSessionNickname({ nickname: generated });
            if (updateResult.data) {
              setNickname(updateResult.data.session.nickname);
            } else {
              console.warn('ニックネームの自動設定に失敗しました:', updateResult.error);
              setNickname(generated); // フォールバック
            }
          } catch (updateError) {
            console.warn('ニックネームの自動設定中にエラーが発生しました:', updateError);
            setNickname(generated); // フォールバック
          }
        } else {
          setNickname(currentNickname);
        }
        
        // セッションIDとdisplay_nameも設定
        setSessionId(data.session.session_id);
        setDisplayName(data.session.display_name);
        
        // セッション期限情報を設定
        if (data.session.expires_at) {
          setExpiresAt(new Date(data.session.expires_at));
        }
        setIsExpired(!data.session.active);
      }
    } catch (error) {
      console.error('セッション情報の取得中にエラーが発生しました:', error);
      // セッションエラーの場合は期限切れフラグを設定
      if (error instanceof Error && error.message.includes('SESSION_EXPIRED')) {
        setIsExpired(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初回ロード時にセッション情報を取得
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // セッション期限の監視
  useEffect(() => {
    if (!expiresAt) return;

    const checkExpiry = () => {
      const now = new Date();
      if (now >= expiresAt) {
        setIsExpired(true);
      }
    };

    // 初回チェック
    checkExpiry();

    // 1分ごとにチェック
    const interval = setInterval(checkExpiry, 60000);
    
    return () => clearInterval(interval);
  }, [expiresAt]);

  // セッション期限が近い場合の警告
  const getSessionWarning = useCallback(() => {
    if (!expiresAt || isExpired) return null;
    
    const now = new Date();
    const timeLeft = expiresAt.getTime() - now.getTime();
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    
    if (hoursLeft <= 24 && hoursLeft > 0) {
      return `セッションの有効期限まで${hoursLeft}時間です`;
    }
    
    return null;
  }, [expiresAt, isExpired]);

  // ニックネームを更新
  const updateNickname = useCallback(async (newNickname: string) => {
    const trimmed = newNickname.trim();
    if (trimmed && trimmed.length <= 20) {
      try {
        const { data, error } = await apiClient.updateSessionNickname({ nickname: trimmed });
        
        if (error) {
          console.warn('ニックネームの更新に失敗しました:', error);
          return false;
        } else if (data) {
          setNickname(data.session.nickname);
          return true;
        }
      } catch (error) {
        console.warn('ニックネームの更新中にエラーが発生しました:', error);
      }
      return false;
    }
    return false;
  }, []);

  // ニックネームをランダム生成し直す
  const regenerateNickname = useCallback(async () => {
    const generated = generateRandomNickname();
    
    try {
      const { data, error } = await apiClient.updateSessionNickname({ nickname: generated });
      
      if (error) {
        console.warn('ニックネームの再生成に失敗しました:', error);
      } else if (data) {
        setNickname(data.session.nickname);
      }
    } catch (error) {
      console.warn('ニックネームの再生成中にエラーが発生しました:', error);
    }
  }, []);

  return {
    nickname,
    sessionId,
    displayName,
    isLoading,
    updateNickname,
    regenerateNickname,
    expiresAt,
    isExpired,
    getSessionWarning,
  };
} 