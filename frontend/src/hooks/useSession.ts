'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateRandomNickname } from '@/utils/nickname';
import { apiClient } from '@/lib/api';

export function useSession() {
  const [nickname, setNickname] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

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
      }
    } catch (error) {
      console.error('セッション情報の取得中にエラーが発生しました:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初回ロード時にセッション情報を取得
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

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
  };
} 