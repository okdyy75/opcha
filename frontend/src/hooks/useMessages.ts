import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/types';

interface UseMessagesProps {
  roomId: string;
  initialMessages: Message[];
}

interface UseMessagesReturn {
  messages: Message[];
  loadMoreMessages: () => Promise<void>;
  hasMore: boolean;
  loading: boolean;
}

export function useMessages({ roomId, initialMessages }: UseMessagesProps): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // 初期メッセージ設定
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const loadMoreMessages = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const oldestMessage = messages[0];
      const beforeId = oldestMessage?.id;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/rooms/${roomId}/messages?limit=20&before=${beforeId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const newMessages = data.messages;
        
        if (newMessages.length > 0) {
          setMessages(prev => [...newMessages, ...prev]);
          setHasMore(data.pagination.has_more);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId, messages, loading, hasMore]);

  // 新着メッセージ追加（最新50件に制限）
  const addNewMessage = useCallback((newMessage: Message) => {
    setMessages(prev => {
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) return prev;
      
      // 最新50件に制限
      const updatedMessages = [...prev, newMessage];
      return updatedMessages.slice(-50);
    });
  }, []);

  return {
    messages,
    loadMoreMessages,
    hasMore,
    loading,
    addNewMessage
  } as UseMessagesReturn & { addNewMessage: (message: Message) => void };
}