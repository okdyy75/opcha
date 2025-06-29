// Type definitions for opcha frontend

export interface Message {
  id: number;
  room_id: number;
  text_body: string;
  session: {
    display_name: string;
    nickname: string;
  };
  is_own: boolean;
  created_at: string;
}

export interface Room {
  id: number;
  name: string;
  share_token: string;
  creator_session_id: string;
  message_count: number;
  participant_count: number;
  last_activity: string | null;
  created_at: string;
}

export interface Session {
  id: number;
  session_id: string;
  display_name: string;
  nickname: string;
  created_at: string;
  updated_at: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  lastActivity: string;
  participantCount: number;
}

export interface MessageDisplay {
  id: string;
  text: string;
  timestamp: string;
  sessionDisplayName: string;
  sessionNickname: string;
  isOwn: boolean;
}

// Utility functions to convert API responses to display types
export function messageToDisplay(message: Message): MessageDisplay {
  return {
    id: message.id.toString(),
    text: message.text_body,
    timestamp: new Date(message.created_at).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    sessionDisplayName: message.session.display_name,
    sessionNickname: message.session.nickname,
    isOwn: message.is_own,
  };
}

export function roomToChatRoom(room: Room): ChatRoom {
  return {
    id: room.share_token, // share_tokenをIDとして使用
    name: room.name,
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
    participantCount: room.participant_count,
  };
}