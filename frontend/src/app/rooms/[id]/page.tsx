'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Toast from '../../../components/Toast';
import { useToast } from '../../../hooks/useToast';
import { useSession } from '../../../hooks/useSession';
import NicknameModal from '../../../components/NicknameModal';
import ShareButton from '../../../components/ShareButton';
import { apiClient } from '../../../lib/api';
import { MessageDisplay, messageToDisplay, Room, Message } from '../../../types';

export default function ChatRoom() {
  const params = useParams();
  const roomId = params.id as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toasts, showToast, removeToast } = useToast();
  const { nickname, sessionId, displayName, isLoading: sessionLoading, updateNickname } = useSession();
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ルーム情報とメッセージを取得
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomId) return;
      
      setIsLoading(true);
      try {
        // ルーム情報取得
        const roomResponse = await apiClient.getRoom(roomId);
        if (roomResponse.error) {
          showToast('ルーム情報の取得に失敗しました', 'error');
          return;
        }
        if (roomResponse.data?.room) {
          setRoom(roomResponse.data.room);
        }

        // メッセージ一覧取得
        const messagesResponse = await apiClient.getMessages(roomId);
        if (messagesResponse.error) {
          showToast('メッセージの取得に失敗しました', 'error');
          return;
        }
        if (messagesResponse.data?.messages) {
          setMessages(messagesResponse.data.messages);
        }
      } catch {
        showToast('データの取得に失敗しました', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId, sessionId, showToast]);


  const handleSendMessage = async () => {
    if (!newMessage.trim() || !sessionId || isSending) return;

    setIsSending(true);
    
    try {
      const response = await apiClient.createMessage(roomId, {
        text_body: newMessage.trim(),
      });

      if (response.error) {
        showToast('メッセージの送信に失敗しました', 'error');
        return;
      }

      if (response.data?.message) {
        // 新着メッセージを追加（最新50件に制限）
        setMessages(prev => [...prev, response.data!.message].slice(-50));
        setNewMessage('');
      }
    } catch {
      showToast('メッセージの送信に失敗しました', 'error');
    } finally {
      setIsSending(false);
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

  if (sessionLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary-500)] mx-auto mb-2"></div>
          <p className="text-[var(--color-text-secondary)]">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] flex flex-col">
      {/* ヘッダー */}
      <header className="bg-[var(--color-primary-500)] text-white border-b border-[var(--color-border-primary)] p-4 shadow-sm">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link 
            href="/rooms"
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold text-white">
              {room ? room.name : `ルーム ${roomId}`}
            </h1>
            <p className="text-xs text-white/80 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              </svg>
              {room ? `${room.participant_count}人参加中` : '読み込み中...'}
            </p>
          </div>
          <ShareButton
            roomId={roomId}
            onSuccess={(message) => showToast(message, 'success')}
            iconOnly={false}
          />
        </div>
      </header>

      {/* メッセージ表示エリア */}
      <div className="flex-1 max-w-md mx-auto w-full bg-white overflow-y-auto">
        <div className="p-4 space-y-4">
          
          {messages.map((message) => {
            const displayMessage = messageToDisplay(message);
            return (
            <div
              key={message.id}
              className={`flex ${displayMessage.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${displayMessage.isOwn ? 'order-2' : 'order-1'}`}>
                {!displayMessage.isOwn && (
                  <div className="text-xs text-[var(--color-text-secondary)] mb-1 px-1">
                    <span className="font-medium">{displayMessage.sessionNickname}</span>
                    <span className="ml-1 opacity-70">#{displayMessage.sessionDisplayName}</span>
                  </div>
                )}
                <div
                  className={`inline-block p-3 rounded-2xl max-w-full break-words text-sm ${
                    displayMessage.isOwn 
                      ? 'bg-[var(--color-message-self-bg)] text-[var(--color-message-self-text)]'
                      : 'bg-[var(--color-message-other-bg)] text-[var(--color-message-other-text)] border border-[var(--color-border-primary)]'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {displayMessage.text}
                  </p>
                </div>
                <div className={`text-xs text-[var(--color-text-secondary)] mt-1 px-1 ${
                  displayMessage.isOwn ? 'text-right' : 'text-left'
                }`}>
                  <div>{displayMessage.timestamp}</div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* メッセージ入力エリア */}
      <div className="bg-white border-t border-[var(--color-border-primary)]">
        {/* 自分の情報表示 */}
        <div className="max-w-md mx-auto px-4 py-2 border-b border-[var(--color-border-primary)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-secondary)]">あなた:</span>
              <span className="text-sm font-medium text-[var(--color-text-primary)]">{nickname}</span>
              <span className="text-xs text-[var(--color-text-secondary)] opacity-70">#{displayName}</span>
            </div>
            <button
              onClick={() => setIsNicknameModalOpen(true)}
              className="p-1.5 hover:bg-[var(--color-bg-secondary)] rounded-full transition-colors"
              title="ニックネーム変更"
            >
              <svg className="w-4 h-4 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* メッセージ入力フィールド */}
        <div className="p-4">
          <div className="max-w-md mx-auto flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="メッセージを入力..."
                className="w-full p-3 pr-12 border border-[var(--color-border-primary)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent text-sm"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] disabled:bg-[var(--color-text-secondary)] text-white p-3 rounded-full transition-colors disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
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

      {/* ニックネーム設定モーダル */}
      <NicknameModal
        isOpen={isNicknameModalOpen}
        currentNickname={nickname}
        onClose={() => setIsNicknameModalOpen(false)}
        onUpdate={updateNickname}
      />
    </div>
  );
} 