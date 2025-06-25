// Type definitions for opcha frontend

export interface Message {
  id: number;
  room_id: number;
  session_id: string;
  text_body: string;
  user: {
    session_id: string;
    nickname: string;
  };
  created_at: string;
}

export interface Room {
  id: number;
  name: string;
  share_token: string;
  creator_session_id: string;
  message_count: number;
  last_activity: string | null;
  created_at: string;
}

export interface Session {
  id: number;
  session_id: string;
  nickname: string;
  created_at: string;
  updated_at: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  lastMessage?: string;
  lastActivity: string;
  participantCount: number;
}

export interface MessageDisplay {
  id: string;
  text: string;
  timestamp: string;
  userId: string;
  userSessionId: string;
  userNickname: string;
  isOwn: boolean;
}

// Utility functions to convert API responses to display types
export function messageToDisplay(message: Message, currentSessionId: string): MessageDisplay {
  return {
    id: message.id.toString(),
    text: message.text_body,
    timestamp: new Date(message.created_at).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    userId: message.user.session_id,
    userSessionId: message.user.session_id,
    userNickname: message.user.nickname,
    isOwn: message.session_id === currentSessionId,
  };
}

export function roomToChatRoom(room: Room): ChatRoom {
  return {
    id: room.id.toString(),
    name: room.name,
    lastMessage: undefined, // Will be populated separately if needed
    lastActivity: room.last_activity 
      ? new Date(room.last_activity).toLocaleString('ja-JP', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      : new Date(room.created_at).toLocaleString('ja-JP', {
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
    participantCount: Math.max(1, room.message_count), // Placeholder
  };
}