'use client';

import { useState } from 'react';
import Link from 'next/link';
import CreateRoomModal from '@/components/CreateRoomModal';

interface ChatRoom {
  id: string;
  name: string;
  lastMessage?: string;
  lastActivity: string;
  participantCount: number;
}

export default function RoomsPage() {
  const [rooms] = useState<ChatRoom[]>([
    {
      id: '1',
      name: '雑談ルーム',
      lastMessage: 'こんにちは！',
      lastActivity: '5分前',
      participantCount: 3
    },
    {
      id: '2',
      name: 'プログラミング談話',
      lastMessage: 'Reactの質問があります',
      lastActivity: '12分前',
      participantCount: 7
    },
    {
      id: '3',
      name: '趣味の話',
      lastMessage: '最近観た映画について',
      lastActivity: '1時間前',
      participantCount: 2
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = (roomName: string) => {
    // ここで実際のルーム作成処理を行う
    const roomId = Math.random().toString(36).substring(2, 9);
    console.log('新しいルーム作成:', { name: roomName, id: roomId });
    // ルーム作成後、そのルームに移動
    window.location.href = `/rooms/${roomId}`;
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

        {/* チャットルーム一覧 */}
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

        {/* 空の状態 */}
        {rooms.length === 0 && (
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
      />


    </div>
  );
} 