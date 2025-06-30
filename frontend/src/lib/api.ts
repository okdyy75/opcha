// API client for opcha backend

const API_BASE_URL = ''; // Next.jsのproxyを使用するため空文字に変更
console.log(API_BASE_URL);

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
      credentials: 'include', // cookieを含める
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`, config.body);

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      console.log(`📡 API Response: ${response.status}`, data);

      if (!response.ok) {
        return { error: data.error || { message: 'Unknown error', code: 'UNKNOWN_ERROR' } };
      }

      return { data };
    } catch (error) {
      console.error('❌ API request failed:', error);
      return { 
        error: { 
          message: 'Network error or server unavailable', 
          code: 'NETWORK_ERROR' 
        } 
      };
    }
  }

  // Session APIs
  async getSession() {
    return this.request<{ session: { id: number; session_id: string; display_name: string; nickname: string; created_at: string; updated_at: string } }>('/sessions/current');
  }

  async updateSessionNickname(nicknameData: { nickname: string }) {
    return this.request<{ session: { id: number; session_id: string; display_name: string; nickname: string; created_at: string; updated_at: string } }>('/sessions', {
      method: 'PUT',
      body: JSON.stringify(nicknameData),
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
        participant_count: number;
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
        participant_count: number;
        last_activity: string | null;
        created_at: string;
      };
    }>(`/rooms/${roomId}`);
  }

  async createRoom(roomData: { name: string }) {
    return this.request<{
      room: {
        id: number;
        name: string;
        share_token: string;
        creator_session_id: string;
        message_count: number;
        participant_count: number;
        last_activity: string | null;
        created_at: string;
      };
    }>('/rooms', {
      method: 'POST',
      body: JSON.stringify({ room: roomData }),
    });
  }

  // Message APIs
  async getMessages(roomId: string) {
    return this.request<{
      messages: Array<{
        id: number;
        room_id: number;
        text_body: string;
        session: {
          display_name: string;
          nickname: string;
        };
        is_own: boolean;
        created_at: string;
      }>;
    }>(`/rooms/${roomId}/messages`);
  }

  async createMessage(roomId: string, messageData: { text_body: string }) {
    return this.request<{
      message: {
        id: number;
        room_id: number;
        text_body: string;
        session: {
          display_name: string;
          nickname: string;
        };
        is_own: boolean;
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