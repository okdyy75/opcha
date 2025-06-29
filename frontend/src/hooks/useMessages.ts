import { useState, useEffect, useCallback } from 'react';
import { getPusher } from '@/lib/pusher';
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
  deleteMessage: (messageId: number) => Promise<void>;
}

export function useMessages({ roomId, initialMessages }: UseMessagesProps): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // リアルタイムメッセージ受信
  useEffect(() => {
    const pusher = getPusher();
    const channel = pusher.subscribe(`room-${roomId}`);

    channel.bind('new-message', (data: { message: Message }) => {
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === data.message.id);
        if (exists) return prev;
        
        // 最新メッセージを最後に追加し、50件制限
        const newMessages = [...prev, data.message];
        return newMessages.slice(-50);
      });
    });

    channel.bind('message-deleted', (data: { message_id: number }) => {
      setMessages(prev => prev.filter(msg => msg.id !== data.message_id));
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`room-${roomId}`);
    };
  }, [roomId]);

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

  const deleteMessage = useCallback(async (messageId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/rooms/${roomId}/messages/${messageId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }, [roomId]);

  return {
    messages,
    loadMoreMessages,
    hasMore,
    loading,
    deleteMessage
  };
}