'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CreateRoomModal from '@/components/CreateRoomModal';
import { useSessionId } from '@/hooks/useSessionId';
import { useToast } from '@/hooks/useToast';
import { apiClient } from '@/lib/api';
import { ChatRoom, roomToChatRoom } from '@/types';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();
  const { sessionId } = useSessionId();
  const { showToast } = useToast();

  // ルーム一覧取得
  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getRooms({ limit: 20 });

        if (response.error) {
          showToast('ルーム一覧の取得に失敗しました', 'error');
          return;
        }

        if (response.data?.rooms) {
          const chatRooms = response.data.rooms.map(room => roomToChatRoom(room));
          setRooms(chatRooms);
        }
      } catch (error) {
        showToast('ネットワークエラーが発生しました', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [showToast]);

  const handleCreateRoom = async (roomName: string) => {
    if (!sessionId) {
      showToast('セッションが初期化されていません', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const response = await apiClient.createRoom({
        name: roomName,
        creator_session_id: sessionId,
      });

      if (response.error) {
        showToast(response.error.message, 'error');
        return;
      }

      if (response.data?.room) {
        showToast(`ルーム「${roomName}」を作成しました`, 'success');
        router.push(`/rooms/${response.data.room.id}`);
      }
    } catch (error) {
      showToast('ルーム作成に失敗しました', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      {/* ヘッダー */}
      <header className="bg-[var(--color-primary-500)] text-white p-3 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="font-semibold text-white">ルーム一覧</h1>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            ルーム作成
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-md mx-auto bg-white min-h-screen">
        {/* 説明セクション */}
        <div className="p-4 border-b border-[var(--color-border-primary)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            オープンチャット
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            誰でも気軽に参加できるチャットルームです。お気に入りのルームを見つけて会話を楽しみましょう。
          </p>
        </div>

        {/* ローディング状態 */}
        {isLoading && (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary-500)]"></div>
            <p className="text-[var(--color-text-secondary)] mt-4">読み込み中...</p>
          </div>
        )}

        {/* チャットルーム一覧 */}
        {!isLoading && (
          <div className="divide-y divide-[var(--color-border-primary)]">
            {rooms.map((room) => (
              <Link
                key={room.id}
                href={`/rooms/${room.id}`}
                className="block p-4 hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-[var(--color-text-primary)] truncate">
                        {room.name}
                      </h3>
                      <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                        </svg>
                        {room.participantCount}
                      </span>
                    </div>
                    {room.lastMessage && (
                      <p className="text-sm text-[var(--color-text-secondary)] truncate">
                        {room.lastMessage}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)] ml-2">
                    {room.lastActivity}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 空の状態 */}
        {!isLoading && rooms.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-[var(--color-text-secondary)] mb-4">
              まだチャットルームがありません
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              最初のルームを作成
            </button>
          </div>
        )}
      </main>

      {/* ルーム作成モーダル */}
      <CreateRoomModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onCreateRoom={handleCreateRoom}
        isCreating={isCreating}
      />


    </div>
  );
} 