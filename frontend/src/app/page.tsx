'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    // TODO: バックエンドAPI呼び出し
    const newRoomId = Math.random().toString(36).substr(2, 9);
    setTimeout(() => {
      window.location.href = `/rooms/${newRoomId}`;
    }, 500);
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim()) return;
    setIsJoining(true);
    // TODO: ルーム存在確認API呼び出し
    setTimeout(() => {
      window.location.href = `/rooms/${roomId.trim()}`;
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-gray)] flex flex-col">
      {/* ヘッダー */}
      <header className="bg-[var(--primary-color)] text-white px-4 py-3 shadow-md">
        <div className="max-w-md mx-auto">
          <h1 className="text-lg font-semibold text-center">opcha</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col justify-center px-4 py-8">
        <div className="max-w-md mx-auto w-full space-y-6">
          {/* ロゴ・説明エリア */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-[var(--primary-color)] rounded-full mx-auto flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-white" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
                気軽にチャットを楽しもう
              </h2>
              <p className="text-sm text-[var(--text-gray)] leading-relaxed">
                ユーザー登録不要で誰でも参加できる<br />
                オープンチャットルームです
              </p>
            </div>
          </div>

          {/* アクションボタンエリア */}
          <div className="space-y-4">
            {/* 新しいルーム作成 */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-[var(--border-color)]">
              <h3 className="font-medium text-[var(--foreground)] mb-3">新しいルームを作成</h3>
              <button
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="w-full bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'ルーム作成中...' : 'ルームを作成する'}
              </button>
            </div>

            {/* 既存ルーム参加 */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-[var(--border-color)]">
              <h3 className="font-medium text-[var(--foreground)] mb-3">既存のルームに参加</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="ルームIDを入力"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full p-3 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleJoinRoom();
                    }
                  }}
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={!roomId.trim() || isJoining}
                  className="w-full bg-white border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--bg-gray)] py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isJoining ? 'ルーム参加中...' : 'ルームに参加する'}
                </button>
              </div>
            </div>

            {/* ルーム一覧へのリンク */}
            <div className="text-center">
              <Link 
                href="/rooms"
                className="text-[var(--primary-color)] hover:text-[var(--primary-color-hover)] text-sm font-medium underline"
              >
                ルーム一覧を見る →
              </Link>
            </div>
          </div>

          {/* 利用上の注意 */}
          <div className="text-center">
            <p className="text-xs text-[var(--text-gray)] leading-relaxed">
              チャットルームは24時間後に自動削除されます<br />
              誹謗中傷や不適切な発言はお控えください
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
