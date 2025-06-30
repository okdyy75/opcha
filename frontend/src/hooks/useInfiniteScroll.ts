import { useState, useEffect, useCallback } from 'react';
import { Room } from '@/types';

interface UseInfiniteScrollProps {
  initialRooms: Room[];
}

interface UseInfiniteScrollReturn {
  rooms: Room[];
  hasMore: boolean;
  loading: boolean;
  loadMore: () => Promise<void>;
}

export function useInfiniteScroll({ initialRooms }: UseInfiniteScrollProps): UseInfiniteScrollReturn {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);

  // 初期ルームが更新された時にstateを同期
  useEffect(() => {
    console.log('🔄 Initial rooms updated:', initialRooms.length);
    setRooms(initialRooms);
    if (initialRooms.length > 0) {
      const lastRoom = initialRooms[initialRooms.length - 1];
      setCursor(lastRoom.created_at);
    }
  }, [initialRooms]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '10');
      if (cursor) {
        params.append('cursor', cursor);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/rooms?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const newRooms = data.rooms || [];
        
        if (newRooms.length > 0) {
          setRooms(prev => [...prev, ...newRooms]);
          const lastRoom = newRooms[newRooms.length - 1];
          setCursor(lastRoom.created_at);
          setHasMore(data.pagination.has_more);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Failed to load more rooms:', error);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, hasMore]);

  return {
    rooms,
    hasMore,
    loading,
    loadMore
  };
}