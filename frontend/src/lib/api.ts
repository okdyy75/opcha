// API client for opcha backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}/api${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || { message: 'Unknown error', code: 'UNKNOWN_ERROR' } };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        error: { 
          message: 'Network error or server unavailable', 
          code: 'NETWORK_ERROR' 
        } 
      };
    }
  }

  // Session APIs
  async createSession(sessionData: {
    session_id: string;
    nickname: string;
    data?: string;
  }) {
    return this.request<{ session: { id: number; session_id: string; nickname: string; created_at: string; updated_at: string } }>('/sessions', {
      method: 'POST',
      body: JSON.stringify({ session: sessionData }),
    });
  }

  async updateSessionNickname(sessionId: string, nickname: string) {
    return this.request<{ session: { id: number; session_id: string; nickname: string; created_at: string; updated_at: string } }>(`/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify({ nickname }),
    });
  }

  // Room APIs
  async getRooms(params?: { limit?: number; offset?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    
    const query = searchParams.toString();
    const endpoint = query ? `/rooms?${query}` : '/rooms';
    
    return this.request<{
      rooms: Array<{
        id: number;
        name: string;
        share_token: string;
        creator_session_id: string;
        message_count: number;
        last_activity: string | null;
        created_at: string;
      }>;
      pagination: {
        total: number;
        limit: number;
        offset: number;
      };
    }>(endpoint);
  }

  async getRoom(roomId: string) {
    return this.request<{
      room: {
        id: number;
        name: string;
        share_token: string;
        creator_session_id: string;
        message_count: number;
        last_activity: string | null;
        created_at: string;
      };
    }>(`/rooms/${roomId}`);
  }

  async createRoom(roomData: { name: string; creator_session_id: string }) {
    return this.request<{
      room: {
        id: number;
        name: string;
        share_token: string;
        creator_session_id: string;
        message_count: number;
        last_activity: string | null;
        created_at: string;
      };
    }>('/rooms', {
      method: 'POST',
      body: JSON.stringify({ room: roomData }),
    });
  }

  // Message APIs
  async getMessages(roomId: string, params?: { limit?: number; before?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.before) searchParams.append('before', params.before.toString());
    
    const query = searchParams.toString();
    const endpoint = query ? `/rooms/${roomId}/messages?${query}` : `/rooms/${roomId}/messages`;
    
    return this.request<{
      messages: Array<{
        id: number;
        room_id: number;
        session_id: string;
        text_body: string;
        user: {
          session_id: string;
          nickname: string;
        };
        created_at: string;
      }>;
      pagination: {
        has_more: boolean;
        next_before: number | null;
      };
    }>(endpoint);
  }

  async createMessage(roomId: string, messageData: { session_id: string; text_body: string }) {
    return this.request<{
      message: {
        id: number;
        room_id: number;
        session_id: string;
        text_body: string;
        user: {
          session_id: string;
          nickname: string;
        };
        created_at: string;
      };
    }>(`/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message: messageData }),
    });
  }
}

export const apiClient = new ApiClient();
export type { ApiResponse };