'use client';

import { useState } from 'react';
import Link from 'next/link';

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
  const [newRoomName, setNewRoomName] = useState('');

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      // ここで実際のルーム作成処理を行う
      const roomId = Math.random().toString(36).substring(7);
      console.log('新しいルーム作成:', { name: newRoomName, id: roomId });
      setIsCreating(false);
      setNewRoomName('');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--line-gray)]">
      {/* ヘッダー */}
      <header className="bg-[var(--line-green)] text-white p-2 shadow-md">
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
            <h1 className="text-l font-bold">ルーム一覧</h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-md mx-auto bg-white min-h-screen">
        {/* 説明セクション */}
        <div className="p-4 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            オープンチャット
          </h2>
          <p className="text-sm text-[var(--line-dark-gray)]">
            誰でも気軽に参加できるチャットルームです。お気に入りのルームを見つけて会話を楽しみましょう。
          </p>
        </div>

        {/* チャットルーム一覧 */}
        <div className="divide-y divide-[var(--border-color)]">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/rooms/${room.id}`}
              className="block p-4 hover:bg-[var(--line-gray)] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-[var(--foreground)] truncate">
                      {room.name}
                    </h3>
                    <span className="text-xs text-[var(--line-dark-gray)] flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                      </svg>
                      {room.participantCount}
                    </span>
                  </div>
                  {room.lastMessage && (
                    <p className="text-sm text-[var(--line-dark-gray)] truncate">
                      {room.lastMessage}
                    </p>
                  )}
                </div>
                <div className="text-xs text-[var(--line-dark-gray)] ml-2">
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
            <p className="text-[var(--line-dark-gray)] mb-4">
              まだチャットルームがありません
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-[var(--line-green)] hover:bg-[var(--line-green-hover)] text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              最初のルームを作成
            </button>
          </div>
        )}
      </main>

      {/* ルーム作成モーダル */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">新しいルームを作成</h3>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="ルーム名を入力"
              className="w-full p-3 border border-[var(--border-color)] rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--line-green)] focus:border-transparent"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewRoomName('');
                }}
                className="flex-1 py-3 border border-[var(--border-color)] rounded-lg font-medium hover:bg-[var(--line-gray)] transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={!newRoomName.trim()}
                className="flex-1 py-3 bg-[var(--line-green)] hover:bg-[var(--line-green-hover)] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
} 