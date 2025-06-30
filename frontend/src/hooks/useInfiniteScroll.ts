import { useState, useEffect, useCallback, useRef } from 'react';
import { Room } from '@/types';
import { apiClient } from '@/lib/api';

interface UseInfiniteScrollProps {
  initialRooms: Room[];
}

interface UseInfiniteScrollReturn {
  rooms: Room[];
  hasMore: boolean;
  loading: boolean;
  loadMore: () => Promise<void>;
  lastElementRef: (node: HTMLElement | null) => void;
}

export function useInfiniteScroll({ initialRooms }: UseInfiniteScrollProps): UseInfiniteScrollReturn {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 初期ルームが更新された時にstateを同期
  useEffect(() => {
    setRooms(initialRooms);
    setCurrentOffset(initialRooms.length);
    setHasMore(initialRooms.length >= 20);
  }, [initialRooms]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await apiClient.getRooms({ 
        limit: 20, 
        offset: currentOffset 
      });

      if (response.error) {
        setHasMore(false);
        return;
      }

      if (response.data?.rooms) {
        const newRooms = response.data.rooms;
        
        if (newRooms.length > 0) {
          setRooms(prev => [...prev, ...newRooms]);
          setCurrentOffset(prev => prev + newRooms.length);
          setHasMore(newRooms.length >= 20);
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [currentOffset, loading, hasMore]);

  // Intersection Observer for infinite scroll
  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, loadMore]);

  return {
    rooms,
    hasMore,
    loading,
    loadMore,
    lastElementRef
  };
}