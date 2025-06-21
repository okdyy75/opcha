'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Toast from '../../../components/Toast';
import { useToast } from '../../../hooks/useToast';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  userId: string;
  userName: string;
  isOwn: boolean;
}

export default function ChatRoom() {
  const params = useParams();
  const roomId = params.id as string;
  
  // TODO: roomIdを使ってバックエンドからルーム情報を取得する
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'こんにちは！このルームにようこそ！',
      timestamp: '14:30',
      userId: 'user1',
      userName: 'abc123',
      isOwn: false
    },
    {
      id: '2',
      text: 'よろしくお願いします！',
      timestamp: '14:32',
      userId: 'user2',
      userName: 'xyz789',
      isOwn: true
    },
    {
      id: '3',
      text: '今日はいい天気ですね',
      timestamp: '14:35',
      userId: 'user1',
      userName: 'abc123',
      isOwn: false
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [roomName] = useState(`ルーム ${roomId}`);
  const [participantCount] = useState(3);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toasts, success, removeToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const now = new Date();
      const timestamp = now.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      const message: Message = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        timestamp,
        userId: 'currentUser',
        userName: 'def456',
        isOwn: true
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [newMessage]);

  const copyRoomUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      success('URLをコピーしました');
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--line-gray)] flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white border-b border-[var(--border-color)] p-4 shadow-sm">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link 
            href="/"
            className="p-2 hover:bg-[var(--line-gray)] rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-[var(--line-dark-gray)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold text-[var(--foreground)]">{roomName}</h1>
            <p className="text-xs text-[var(--line-dark-gray)] flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              </svg>
              {participantCount}人参加中
            </p>
          </div>
          <button
            onClick={copyRoomUrl}
            className="p-2 hover:bg-[var(--line-gray)] rounded-full transition-colors"
            title="URLをコピー"
          >
            <svg className="w-5 h-5 text-[var(--line-dark-gray)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </header>

      {/* メッセージ表示エリア */}
      <div className="flex-1 max-w-md mx-auto w-full bg-white overflow-y-auto">
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${message.isOwn ? 'order-2' : 'order-1'}`}>
                {!message.isOwn && (
                  <div className="text-xs text-[var(--line-dark-gray)] mb-1 px-1">
                    {message.userName}
                  </div>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    message.isOwn
                      ? 'bg-[var(--message-bubble-self)] text-[var(--message-text-self)]'
                      : 'bg-[var(--message-bubble-other)] text-[var(--message-text-other)] border border-[var(--border-color)]'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.text}
                  </p>
                </div>
                <div className={`text-xs text-[var(--line-dark-gray)] mt-1 px-1 ${
                  message.isOwn ? 'text-right' : 'text-left'
                }`}>
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* メッセージ入力エリア */}
      <div className="bg-white border-t border-[var(--border-color)] p-4">
        <div className="max-w-md mx-auto flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="メッセージを入力..."
              className="w-full p-3 pr-12 border border-[var(--border-color)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--line-green)] focus:border-transparent text-sm"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-[var(--line-green)] hover:bg-[var(--line-green-hover)] disabled:bg-[var(--line-dark-gray)] text-white p-3 rounded-full transition-colors disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Toast通知 */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
} 