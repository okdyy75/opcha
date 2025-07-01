# Opcha Chat Service - API Documentation

## Overview

Opcha is an anonymous chat room service built with Next.js (frontend) and Ruby on Rails (backend). This documentation covers all public APIs, components, hooks, and utilities.

## Table of Contents

1. [Backend API](#backend-api)
   - [Session Management](#session-management)
   - [Room Management](#room-management)
   - [Message Management](#message-management)
2. [Frontend Components](#frontend-components)
3. [React Hooks](#react-hooks)
4. [Utilities](#utilities)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)

---

## Backend API

Base URL: `/api`

All API endpoints return JSON responses and use session-based authentication via cookies.

### Session Management

#### Get Current Session
```
GET /api/sessions/current
```

**Description:** Retrieves the current user's session information.

**Response:**
```json
{
  "session": {
    "id": 123,
    "session_id": "abc123def456",
    "display_name": "A1B2C3D4",
    "nickname": "はっぴーネコ123",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Example Usage:**
```javascript
const response = await fetch('/api/sessions/current', {
  method: 'GET',
  credentials: 'include'
});
const data = await response.json();
```

#### Update Session Nickname
```
PUT /api/sessions
```

**Description:** Updates the current user's nickname.

**Request Body:**
```json
{
  "nickname": "新しいニックネーム"
}
```

**Validation:**
- `nickname`: Maximum 32 characters

**Response:**
```json
{
  "session": {
    "id": 123,
    "session_id": "abc123def456",
    "display_name": "A1B2C3D4",
    "nickname": "新しいニックネーム",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T01:00:00Z"
  }
}
```

### Room Management

#### List Rooms
```
GET /api/rooms?limit=50&offset=0
```

**Description:** Retrieves a paginated list of chat rooms.

**Query Parameters:**
- `limit` (optional): Number of rooms to return (default: 50)
- `offset` (optional): Number of rooms to skip (default: 0)

**Response:**
```json
{
  "rooms": [
    {
      "id": 1,
      "name": "雑談ルーム",
      "share_token": "abc123",
      "creator_session_id": "def456",
      "message_count": 42,
      "participant_count": 5,
      "last_activity": "2024-01-01T12:00:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

#### Get Room Details
```
GET /api/rooms/:share_token
```

**Description:** Retrieves details for a specific room using its share token.

**Parameters:**
- `share_token`: 6-character alphanumeric room identifier

**Response:**
```json
{
  "room": {
    "id": 1,
    "name": "雑談ルーム",
    "share_token": "abc123",
    "creator_session_id": "def456",
    "message_count": 42,
    "participant_count": 5,
    "last_activity": "2024-01-01T12:00:00Z",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Create Room
```
POST /api/rooms
```

**Description:** Creates a new chat room.

**Request Body:**
```json
{
  "room": {
    "name": "新しいルーム"
  }
}
```

**Validation:**
- `name`: Required, maximum 50 characters

**Response:**
```json
{
  "room": {
    "id": 2,
    "name": "新しいルーム",
    "share_token": "xyz789",
    "creator_session_id": "def456",
    "message_count": 0,
    "participant_count": 0,
    "last_activity": null,
    "created_at": "2024-01-01T13:00:00Z"
  }
}
```

### Message Management

#### Get Messages
```
GET /api/rooms/:room_id/messages
```

**Description:** Retrieves the latest 20 messages for a room.

**Parameters:**
- `room_id`: Room's share token

**Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "room_id": 1,
      "text_body": "こんにちは！",
      "session": {
        "display_name": "A1B2C3D4",
        "nickname": "はっぴーネコ123"
      },
      "is_own": true,
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

#### Send Message
```
POST /api/rooms/:room_id/messages
```

**Description:** Sends a new message to a room.

**Parameters:**
- `room_id`: Room's share token

**Request Body:**
```json
{
  "message": {
    "text_body": "メッセージの内容"
  }
}
```

**Validation:**
- `text_body`: Required

**Response:**
```json
{
  "message": {
    "id": 2,
    "room_id": 1,
    "text_body": "メッセージの内容",
    "session": {
      "display_name": "A1B2C3D4",
      "nickname": "はっぴーネコ123"
    },
    "is_own": true,
    "created_at": "2024-01-01T12:01:00Z"
  }
}
```

---

## Frontend Components

### Modal

**Location:** `frontend/src/components/Modal.tsx`

**Description:** Base modal component for displaying overlays.

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  children: React.ReactNode;
}
```

**Usage:**
```jsx
<Modal 
  isOpen={isModalOpen} 
  onClose={() => setIsModalOpen(false)} 
  title="Modal Title"
  showCloseButton={true}
>
  <p>Modal content here</p>
</Modal>
```

### CreateRoomModal

**Location:** `frontend/src/components/CreateRoomModal.tsx`

**Description:** Modal for creating new chat rooms.

**Props:**
```typescript
interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (roomName: string) => Promise<void>;
  isCreating?: boolean;
}
```

**Features:**
- Room name validation (max 50 characters)
- Enter key submission
- Loading state handling
- Auto-clear form on success

**Usage:**
```jsx
<CreateRoomModal
  isOpen={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  onCreateRoom={async (name) => {
    const result = await apiClient.createRoom({ name });
    if (result.data) {
      router.push(`/rooms/${result.data.room.share_token}`);
    }
  }}
  isCreating={isCreating}
/>
```

### NicknameModal

**Location:** `frontend/src/components/NicknameModal.tsx`

**Description:** Modal for setting and updating user nicknames.

**Props:**
```typescript
interface NicknameModalProps {
  isOpen: boolean;
  currentNickname: string;
  onClose: () => void;
  onUpdate: (nickname: string) => boolean | Promise<boolean>;
}
```

**Features:**
- Nickname validation (max 20 characters)
- Random nickname generation
- Real-time error display
- Enter key submission

**Usage:**
```jsx
<NicknameModal
  isOpen={showNicknameModal}
  currentNickname={nickname}
  onClose={() => setShowNicknameModal(false)}
  onUpdate={async (newNickname) => {
    return await updateNickname(newNickname);
  }}
/>
```

### ShareButton

**Location:** `frontend/src/components/ShareButton.tsx`

**Description:** Button component for sharing room URLs.

**Props:**
```typescript
interface ShareButtonProps {
  shareUrl: string;
  roomName: string;
}
```

**Features:**
- Native Web Share API support
- Clipboard fallback
- Toast notifications
- Mobile-optimized

### Toast

**Location:** `frontend/src/components/Toast.tsx`

**Description:** Toast notification component.

**Props:**
```typescript
interface ToastProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}
```

**Usage:**
```jsx
const { toasts, showToast, removeToast } = useToast();

// Show toast
showToast('Success message', 'success');

// Render toasts
<Toast toasts={toasts} onRemove={removeToast} />
```

---

## React Hooks

### useSession

**Location:** `frontend/src/hooks/useSession.ts`

**Description:** Hook for managing user session state and nickname.

**Return Value:**
```typescript
{
  nickname: string;
  sessionId: string;
  displayName: string;
  isLoading: boolean;
  updateNickname: (newNickname: string) => Promise<boolean>;
  regenerateNickname: () => Promise<void>;
}
```

**Features:**
- Automatic session initialization
- Nickname auto-generation for new users
- Nickname validation and updating
- Loading state management

**Usage:**
```jsx
function MyComponent() {
  const { 
    nickname, 
    isLoading, 
    updateNickname, 
    regenerateNickname 
  } = useSession();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <p>Current nickname: {nickname}</p>
      <button onClick={() => updateNickname('NewName')}>
        Update Nickname
      </button>
      <button onClick={regenerateNickname}>
        Random Nickname
      </button>
    </div>
  );
}
```

### useToast

**Location:** `frontend/src/hooks/useToast.ts`

**Description:** Hook for managing toast notifications.

**Return Value:**
```typescript
{
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}
```

**Features:**
- Multiple toast types (success, error, info)
- Auto-dismiss with configurable duration
- Manual dismissal
- Convenience methods for common types

**Usage:**
```jsx
function MyComponent() {
  const { success, error, info } = useToast();

  const handleSuccess = () => {
    success('Operation completed successfully!');
  };

  const handleError = () => {
    error('Something went wrong!', 5000); // 5 second duration
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
    </div>
  );
}
```

### useInfiniteScroll

**Location:** `frontend/src/hooks/useInfiniteScroll.ts`

**Description:** Hook for implementing infinite scroll functionality.

**Parameters:**
```typescript
{
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
}
```

**Return Value:**
```typescript
{
  lastElementRef: (node: HTMLElement | null) => void;
}
```

**Usage:**
```jsx
function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { lastElementRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: async () => {
      setIsLoading(true);
      // Load more rooms...
      setIsLoading(false);
    }
  });

  return (
    <div>
      {rooms.map((room, index) => (
        <div 
          key={room.id}
          ref={index === rooms.length - 1 ? lastElementRef : null}
        >
          {room.name}
        </div>
      ))}
    </div>
  );
}
```

---

## Utilities

### API Client

**Location:** `frontend/src/lib/api.ts`

**Description:** Centralized API client for backend communication.

**Class:** `ApiClient`

**Methods:**

#### Session Methods
```typescript
// Get current session
getSession(): Promise<ApiResponse<SessionData>>

// Update session nickname
updateSessionNickname(data: { nickname: string }): Promise<ApiResponse<SessionData>>
```

#### Room Methods
```typescript
// Get rooms list
getRooms(params?: { limit?: number; offset?: number }): Promise<ApiResponse<RoomsData>>

// Get single room
getRoom(roomId: string): Promise<ApiResponse<RoomData>>

// Create new room
createRoom(data: { name: string }): Promise<ApiResponse<RoomData>>
```

#### Message Methods
```typescript
// Get room messages
getMessages(roomId: string): Promise<ApiResponse<MessagesData>>

// Send message
createMessage(roomId: string, data: { text_body: string }): Promise<ApiResponse<MessageData>>
```

**Usage:**
```typescript
import { apiClient } from '@/lib/api';

// Get current session
const { data, error } = await apiClient.getSession();
if (error) {
  console.error('Session error:', error);
} else {
  console.log('Session data:', data.session);
}

// Create a room
const result = await apiClient.createRoom({ name: 'My Room' });
if (result.data) {
  console.log('Room created:', result.data.room);
}
```

### Nickname Generator

**Location:** `frontend/src/utils/nickname.ts`

**Function:** `generateRandomNickname()`

**Description:** Generates random Japanese nicknames in the format: [adjective][animal][number]

**Return Value:** `string`

**Example Output:**
- `はっぴーネコ123`
- `くーるライオン456`
- `すまーとパンダ789`

**Usage:**
```typescript
import { generateRandomNickname } from '@/utils/nickname';

const randomName = generateRandomNickname();
console.log(randomName); // "はっぴーネコ123"
```

---

## Data Models

### Session Model (Backend)

**Location:** `backend/app/models/session.rb`

**Description:** Represents user sessions with nickname management.

**Attributes:**
- `id`: Primary key
- `session_id`: Unique session identifier
- `display_name`: Auto-generated 8-character display name
- `nickname`: User-customizable nickname (max 32 characters)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Associations:**
- `has_many :created_rooms` - Rooms created by this session
- `has_many :messages` - Messages sent by this session

**Methods:**
- `self.find_by_raw_session_id(raw_session_id)` - Find session by raw session ID

### Room Model (Backend)

**Location:** `backend/app/models/room.rb`

**Description:** Represents chat rooms with share token generation.

**Attributes:**
- `id`: Primary key
- `name`: Room name (required, max 50 characters)
- `share_token`: 6-character unique identifier
- `creator_session_id`: ID of the session that created the room
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Associations:**
- `belongs_to :creator_session` - Session that created the room
- `has_many :messages` - Messages in this room

**Features:**
- Auto-generates unique share tokens on creation
- Soft delete support via Discard gem
- URL parameter uses share_token instead of ID

### Message Model (Backend)

**Location:** `backend/app/models/message.rb`

**Description:** Represents chat messages within rooms.

**Attributes:**
- `id`: Primary key
- `room_id`: Foreign key to room
- `session_id`: Foreign key to session
- `text_body`: Message content (required)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Associations:**
- `belongs_to :room` - Room containing this message
- `belongs_to :session` - Session that sent this message

**Scopes:**
- `recent` - Orders by creation date (newest first)
- `in_room(room_id)` - Filters by room ID

---

## Error Handling

### Backend Error Responses

All backend errors follow a consistent format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {} // Optional additional details
  }
}
```

**Common Error Codes:**
- `NOT_FOUND` - Resource not found (404)
- `VALIDATION_ERROR` - Input validation failed (422)
- `INTERNAL_SERVER_ERROR` - Server error (500)
- `NETWORK_ERROR` - Network/connection error (client-side)

### Frontend Error Handling

The API client automatically handles errors and returns them in a consistent format:

```typescript
const { data, error } = await apiClient.getSession();

if (error) {
  switch (error.code) {
    case 'NOT_FOUND':
      // Handle not found
      break;
    case 'VALIDATION_ERROR':
      // Handle validation error
      break;
    case 'NETWORK_ERROR':
      // Handle network error
      break;
    default:
      // Handle unknown error
      break;
  }
} else {
  // Handle success
  console.log(data);
}
```

### Toast Error Display

Use the `useToast` hook to display user-friendly error messages:

```typescript
const { error } = useToast();

// API error handling
const { data, error: apiError } = await apiClient.createRoom({ name: '' });
if (apiError) {
  error(apiError.message);
}
```

---

## Authentication & Security

### Session Management

- Sessions are managed via HTTP cookies
- No explicit login/logout - sessions are created automatically
- Sessions persist across browser sessions
- Each session gets a unique display name and customizable nickname

### CORS Configuration

The backend is configured to accept requests from the frontend domain with credentials included.

### Input Validation

All user inputs are validated both client-side and server-side:

**Room Names:**
- Required
- Maximum 50 characters

**Nicknames:**
- Maximum 32 characters (backend) / 20 characters (frontend)
- Optional (auto-generated if empty)

**Messages:**
- Required
- No explicit length limit (consider adding one for production)

---

## Development Tips

### Adding New API Endpoints

1. Add route in `backend/config/routes.rb`
2. Create controller action
3. Add corresponding method to `frontend/src/lib/api.ts`
4. Update TypeScript types

### Adding New Components

1. Create component in `frontend/src/components/`
2. Follow existing naming conventions
3. Include proper TypeScript interfaces
4. Add to this documentation

### Testing API Endpoints

Use the browser's developer tools or tools like Postman to test API endpoints. Remember to include credentials for session-based authentication.

Example curl command:
```bash
curl -X GET 'http://localhost:3001/api/sessions/current' \
  -H 'Content-Type: application/json' \
  --cookie-jar cookies.txt \
  --cookie cookies.txt
```