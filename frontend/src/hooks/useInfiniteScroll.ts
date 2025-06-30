import { useState, useEffect, useCallback } from 'react';
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
}

export function useInfiniteScroll({ initialRooms }: UseInfiniteScrollProps): UseInfiniteScrollReturn {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);

  // 初期ルームが更新された時にstateを同期
  useEffect(() => {
    console.log('🔄 Initial rooms updated:', initialRooms.length);
    setRooms(initialRooms);
    setCurrentOffset(initialRooms.length); // 次回のオフセットを設定
    setHasMore(initialRooms.length >= 20); // 初期ロード数に基づいてhasMoreを設定
  }, [initialRooms]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      console.log('📄 Loading more rooms, offset:', currentOffset);
      
      const response = await apiClient.getRooms({ 
        limit: 20, 
        offset: currentOffset 
      });

      console.log('📦 Load more response:', response);

      if (response.error) {
        console.error('❌ Load more error:', response.error);
        setHasMore(false);
        return;
      }

      if (response.data?.rooms) {
        const newRooms = response.data.rooms;
        console.log('✅ New rooms loaded:', newRooms.length);
        
        if (newRooms.length > 0) {
          setRooms(prev => [...prev, ...newRooms]);
          setCurrentOffset(prev => prev + newRooms.length);
          
          // 取得した件数が要求した件数より少ない場合は終了
          setHasMore(newRooms.length >= 20);
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('❌ Load more exception:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [currentOffset, loading, hasMore]);

  return {
    rooms,
    hasMore,
    loading,
    loadMore
  };
}