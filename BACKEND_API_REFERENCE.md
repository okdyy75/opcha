# Backend API Reference

## Overview

The Opcha backend is built with Ruby on Rails 8 and provides a RESTful API for managing chat rooms, messages, and user sessions. All endpoints return JSON responses and use session-based authentication.

## Base Configuration

- **Framework**: Ruby on Rails 8.0.2
- **Database**: PostgreSQL
- **Authentication**: Session-based (HTTP cookies)
- **API Base URL**: `/api`
- **Content-Type**: `application/json`

## Authentication

### Session Management

The API uses Rails session management with custom session handling:

- Sessions are automatically created on first request
- Session data is stored in the database using ActiveRecord session store
- Each session gets a unique `session_id` and auto-generated `display_name`
- No explicit login/logout required

### Session Flow

1. Client makes first request to any API endpoint
2. Rails creates a new session automatically
3. Session record is created in database with unique identifiers
4. Subsequent requests use the same session via cookies

---

## API Endpoints

### Session Endpoints

#### Get Current Session

```http
GET /api/sessions/current
```

**Description:** Retrieves the current user's session information.

**Headers:**
```
Content-Type: application/json
Cookie: _opcha_session=<session_cookie>
```

**Response (200 OK):**
```json
{
  "session": {
    "id": 123,
    "session_id": "abc123def456789",
    "display_name": "A1B2C3D4",
    "nickname": "はっぴーネコ123",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T01:30:00.000Z"
  }
}
```

**Response Fields:**
- `id`: Database primary key
- `session_id`: Unique session identifier (private)
- `display_name`: Auto-generated 8-character identifier
- `nickname`: User-customizable nickname (max 32 chars)
- `created_at`: Session creation timestamp
- `updated_at`: Last modification timestamp

**Error Responses:**
```json
{
  "error": {
    "message": "Session not found",
    "code": "NOT_FOUND"
  }
}
```

**Implementation Details:**
- Uses `Session.find_by_raw_session_id` to locate session
- Automatically creates session if not found
- Updates IP address and user agent on session initialization

---

#### Update Session Nickname

```http
PUT /api/sessions
```

**Description:** Updates the current user's nickname.

**Headers:**
```
Content-Type: application/json
Cookie: _opcha_session=<session_cookie>
```

**Request Body:**
```json
{
  "nickname": "新しいニックネーム"
}
```

**Validation Rules:**
- `nickname`: Optional, maximum 32 characters
- Empty or whitespace-only nicknames are allowed
- Special characters and Unicode supported

**Response (200 OK):**
```json
{
  "session": {
    "id": 123,
    "session_id": "abc123def456789",
    "display_name": "A1B2C3D4",
    "nickname": "新しいニックネーム",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T02:00:00.000Z"
  }
}
```

**Error Responses:**

Validation Error (422):
```json
{
  "error": {
    "message": "Nickname is too long (maximum is 32 characters)",
    "code": "VALIDATION_ERROR"
  }
}
```

Session Not Found (404):
```json
{
  "error": {
    "message": "Session not found",
    "code": "NOT_FOUND"
  }
}
```

---

### Room Endpoints

#### List Rooms

```http
GET /api/rooms?limit=50&offset=0
```

**Description:** Retrieves a paginated list of chat rooms ordered by creation date (newest first).

**Query Parameters:**
- `limit` (optional): Number of rooms to return (default: 50, max: 100)
- `offset` (optional): Number of rooms to skip for pagination (default: 0)

**Headers:**
```
Content-Type: application/json
Cookie: _opcha_session=<session_cookie>
```

**Response (200 OK):**
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
      "last_activity": "2024-01-01T12:00:00.000Z",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "name": "技術相談",
      "share_token": "xyz789",
      "creator_session_id": "ghi012",
      "message_count": 18,
      "participant_count": 3,
      "last_activity": "2024-01-01T11:30:00.000Z",
      "created_at": "2024-01-01T00:15:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```

**Response Fields:**
- `id`: Database primary key
- `name`: Room name (max 50 characters)
- `share_token`: 6-character unique identifier for URL sharing
- `creator_session_id`: ID of session that created the room
- `message_count`: Total number of messages in the room
- `participant_count`: Number of unique users who have sent messages
- `last_activity`: Timestamp of most recent message (null if no messages)
- `created_at`: Room creation timestamp

**Implementation Details:**
- Only returns non-deleted rooms (using Discard gem)
- Efficiently calculates counts using database aggregation
- Orders by `created_at DESC`
- Includes message and participant statistics

---

#### Get Room Details

```http
GET /api/rooms/{share_token}
```

**Description:** Retrieves detailed information for a specific room using its share token.

**Path Parameters:**
- `share_token`: 6-character alphanumeric room identifier (case-insensitive)

**Headers:**
```
Content-Type: application/json
Cookie: _opcha_session=<session_cookie>
```

**Response (200 OK):**
```json
{
  "room": {
    "id": 1,
    "name": "雑談ルーム",
    "share_token": "abc123",
    "creator_session_id": "def456",
    "message_count": 42,
    "participant_count": 5,
    "last_activity": "2024-01-01T12:00:00.000Z",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

Room Not Found (404):
```json
{
  "error": {
    "message": "Room not found",
    "code": "NOT_FOUND"
  }
}
```

**Implementation Details:**
- Searches by `share_token` instead of numeric ID
- Only returns non-deleted rooms
- Calculates real-time statistics

---

#### Create Room

```http
POST /api/rooms
```

**Description:** Creates a new chat room with an auto-generated share token.

**Headers:**
```
Content-Type: application/json
Cookie: _opcha_session=<session_cookie>
```

**Request Body:**
```json
{
  "room": {
    "name": "新しいルーム名"
  }
}
```

**Validation Rules:**
- `name`: Required, maximum 50 characters
- Name cannot be empty or whitespace-only
- Unicode characters supported

**Response (201 Created):**
```json
{
  "room": {
    "id": 3,
    "name": "新しいルーム名",
    "share_token": "mno345",
    "creator_session_id": "def456",
    "message_count": 0,
    "participant_count": 0,
    "last_activity": null,
    "created_at": "2024-01-01T13:00:00.000Z"
  }
}
```

**Error Responses:**

Validation Error (422):
```json
{
  "error": {
    "message": "Name can't be blank",
    "code": "VALIDATION_ERROR"
  }
}
```

**Implementation Details:**
- Auto-generates unique 6-character `share_token`
- Sets `creator_session_id` to current session
- Initializes counters to zero
- Uses SecureRandom for token generation with collision detection

---

### Message Endpoints

#### Get Room Messages

```http
GET /api/rooms/{room_id}/messages
```

**Description:** Retrieves the latest 20 messages for a specific room, ordered chronologically.

**Path Parameters:**
- `room_id`: Room's share token (6-character identifier)

**Headers:**
```
Content-Type: application/json
Cookie: _opcha_session=<session_cookie>
```

**Response (200 OK):**
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
      "created_at": "2024-01-01T12:00:00.000Z"
    },
    {
      "id": 2,
      "room_id": 1,
      "text_body": "よろしくお願いします",
      "session": {
        "display_name": "B2C3D4E5",
        "nickname": "くーるライオン456"
      },
      "is_own": false,
      "created_at": "2024-01-01T12:01:00.000Z"
    }
  ]
}
```

**Response Fields:**
- `id`: Message database primary key
- `room_id`: Room database ID (not share token)
- `text_body`: Message content
- `session.display_name`: Sender's auto-generated display name
- `session.nickname`: Sender's custom nickname
- `is_own`: Boolean indicating if message was sent by current user
- `created_at`: Message timestamp

**Error Responses:**

Room Not Found (404):
```json
{
  "error": {
    "message": "Room not found",
    "code": "NOT_FOUND"
  }
}
```

**Implementation Details:**
- Returns maximum 20 messages per request
- Orders by `created_at ASC` (oldest first in response)
- Includes sender session information
- Handles deleted sessions gracefully
- Efficiently determines ownership via session comparison

---

#### Send Message

```http
POST /api/rooms/{room_id}/messages
```

**Description:** Sends a new message to the specified room.

**Path Parameters:**
- `room_id`: Room's share token (6-character identifier)

**Headers:**
```
Content-Type: application/json
Cookie: _opcha_session=<session_cookie>
```

**Request Body:**
```json
{
  "message": {
    "text_body": "メッセージの内容です"
  }
}
```

**Validation Rules:**
- `text_body`: Required, cannot be empty
- No explicit length limit (consider adding for production)
- Unicode and emoji supported

**Response (201 Created):**
```json
{
  "message": {
    "id": 3,
    "room_id": 1,
    "text_body": "メッセージの内容です",
    "session": {
      "display_name": "A1B2C3D4",
      "nickname": "はっぴーネコ123"
    },
    "is_own": true,
    "created_at": "2024-01-01T12:05:00.000Z"
  }
}
```

**Error Responses:**

Validation Error (422):
```json
{
  "error": {
    "message": "Text body can't be blank",
    "code": "VALIDATION_ERROR"
  }
}
```

Room Not Found (404):
```json
{
  "error": {
    "message": "Room not found",
    "code": "NOT_FOUND"
  }
}
```

**Implementation Details:**
- Associates message with current session
- Updates room's last activity timestamp
- Returns complete message object with sender info
- Supports real-time broadcasting (if implemented)

---

## Data Models

### Session Model

**File:** `backend/app/models/session.rb`

**Table:** `sessions`

**Attributes:**
```ruby
class Session < ActiveRecord::SessionStore::Session
  validates :nickname, length: { maximum: 32 }, allow_blank: true
  
  has_many :created_rooms, class_name: "Room", foreign_key: "creator_session_id", primary_key: "session_id"
  has_many :messages, foreign_key: "session_id", primary_key: "session_id"
  
  before_create :generate_display_name
end
```

**Key Methods:**
- `self.find_by_raw_session_id(raw_session_id)`: Finds session by raw session ID
- `generate_display_name`: Auto-generates 8-character alphanumeric display name

**Special Considerations:**
- Extends Rails' built-in session store
- Requires special handling for updates due to session store behavior
- Uses `session_id` as foreign key instead of `id`

---

### Room Model

**File:** `backend/app/models/room.rb`

**Table:** `rooms`

**Attributes:**
```ruby
class Room < ApplicationRecord
  include Discard::Model
  
  validates :name, presence: true, length: { maximum: 50 }
  validates :share_token, uniqueness: true, allow_blank: true
  
  belongs_to :creator_session, class_name: "Session", optional: true
  has_many :messages, dependent: :destroy
  
  before_create :generate_share_token
end
```

**Key Methods:**
- `generate_share_token`: Creates unique 6-character alphanumeric token
- `to_param`: Uses share_token instead of ID for URLs

**Features:**
- Soft delete support via Discard gem
- Automatic share token generation
- Cascade delete for messages

---

### Message Model

**File:** `backend/app/models/message.rb`

**Table:** `messages`

**Attributes:**
```ruby
class Message < ApplicationRecord
  include Discard::Model
  
  validates :text_body, presence: true
  
  belongs_to :room
  belongs_to :session
  
  scope :recent, -> { order(created_at: :desc) }
  scope :in_room, ->(room_id) { where(room_id: room_id) }
end
```

**Scopes:**
- `recent`: Orders by creation date (newest first)
- `in_room(room_id)`: Filters by room ID

**Features:**
- Soft delete support
- Required text content
- Efficient querying scopes

---

## Error Handling

### Standard Error Format

All API errors follow this consistent format:

```json
{
  "error": {
    "message": "Human-readable error description",
    "code": "MACHINE_READABLE_CODE",
    "details": {} // Optional additional context
  }
}
```

### HTTP Status Codes

- **200 OK**: Successful GET/PUT requests
- **201 Created**: Successful POST requests
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server errors

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Input validation failed | 422 |
| `INTERNAL_SERVER_ERROR` | Server error | 500 |

### Global Error Handler

**File:** `backend/app/controllers/application_controller.rb`

```ruby
class ApplicationController < ActionController::API
  rescue_from StandardError, with: :handle_internal_server_error

  private

  def handle_internal_server_error(exception)
    Rails.logger.error "Internal Server Error: #{exception.message}"
    Rails.logger.error exception.backtrace.join("\n")

    render json: {
      error: {
        message: "Internal server error",
        code: "INTERNAL_SERVER_ERROR"
      }
    }, status: :internal_server_error
  end
end
```

---

## Security Considerations

### Session Security

- Sessions use Rails' secure session management
- Session cookies are HTTP-only and secure in production
- Session data is stored server-side in database
- No sensitive data exposed in session identifiers

### Input Validation

- All user inputs are validated server-side
- SQL injection protection via ActiveRecord
- XSS protection through JSON API responses
- CSRF protection enabled for state-changing operations

### Rate Limiting

Consider implementing rate limiting for:
- Message creation (prevent spam)
- Room creation (prevent abuse)
- Session creation (prevent DoS)

### Database Security

- Use environment variables for database credentials
- Enable SSL connections in production
- Regular security updates for dependencies
- Backup and recovery procedures

---

## Performance Considerations

### Database Optimization

- Indexes on frequently queried columns:
  ```sql
  CREATE INDEX index_rooms_on_share_token ON rooms(share_token);
  CREATE INDEX index_messages_on_room_id ON messages(room_id);
  CREATE INDEX index_messages_on_created_at ON messages(created_at);
  ```

- Efficient counting queries:
  ```ruby
  @message_counts = Message.kept.where(room_id: room_ids).group(:room_id).count
  @session_counts = Message.kept.where(room_id: room_ids).group(:room_id).distinct.count(:session_id)
  ```

### Caching Strategies

- Cache room statistics for better performance
- Use Rails fragment caching for expensive queries
- Consider Redis for session storage in high-traffic scenarios

### Pagination

- Implement cursor-based pagination for large datasets
- Limit maximum page sizes to prevent resource exhaustion
- Use database-level limits and offsets efficiently

---

## Development Tools

### API Testing

**Using curl:**
```bash
# Get session
curl -X GET 'http://localhost:3001/api/sessions/current' \
  -H 'Content-Type: application/json' \
  --cookie-jar cookies.txt \
  --cookie cookies.txt

# Create room
curl -X POST 'http://localhost:3001/api/rooms' \
  -H 'Content-Type: application/json' \
  --cookie cookies.txt \
  -d '{"room":{"name":"Test Room"}}'

# Send message
curl -X POST 'http://localhost:3001/api/rooms/abc123/messages' \
  -H 'Content-Type: application/json' \
  --cookie cookies.txt \
  -d '{"message":{"text_body":"Hello World"}}'
```

### Database Console

```bash
# Rails console
docker-compose exec backend rails console

# Database console
docker-compose exec backend rails dbconsole

# Check session data
Session.find_by_raw_session_id(session_id)

# Room statistics
Room.joins(:messages).group('rooms.id').count
```

---

## Deployment Considerations

### Environment Variables

Required environment variables:
- `RAILS_ENV`: Environment (development/production)
- `SECRET_KEY_BASE`: Rails secret key
- `DATABASE_URL`: Database connection string
- `RAILS_MASTER_KEY`: For credentials encryption

### Health Checks

Health check endpoint available at:
```
GET /up
```

Returns 200 if application is healthy, 500 if there are issues.

### Monitoring

Consider monitoring:
- Response times for API endpoints
- Database query performance
- Session creation rate
- Error rates by endpoint
- Memory and CPU usage

### Scaling

For horizontal scaling:
- Use external session store (Redis)
- Implement database read replicas
- Add load balancer health checks
- Consider CDN for static assets