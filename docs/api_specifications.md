# API仕様書

## 概要

オープンチャットサービス（opcha）のREST API およびリアルタイム通信の仕様書

## 基本仕様

- **ベースURL**: `http://localhost:3001/api`
- **データ形式**: JSON
- **文字エンコーディング**: UTF-8
- **認証**: セッションベース（セッションIDによる識別）

## エラーレスポンス形式

```json
{
  "error": {
    "message": "エラーメッセージ",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

---

## 1. セッション管理API

### POST /api/sessions

セッション作成・ニックネーム設定

#### リクエスト
```json
{
  "session_id": "abc123",
  "nickname": "ぐれーとネコ123",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

#### レスポンス (200 OK)
```json
{
  "session": {
    "id": 1,
    "session_id": "abc123",
    "nickname": "ぐれーとネコ123",
    "created_at": "2025-06-25T09:00:00Z",
    "updated_at": "2025-06-25T09:00:00Z"
  }
}
```

### PUT /api/sessions/:session_id

ニックネーム更新

#### リクエスト
```json
{
  "nickname": "あたらしいネコ456"
}
```

#### レスポンス (200 OK)
```json
{
  "session": {
    "id": 1,
    "session_id": "abc123",
    "nickname": "あたらしいネコ456",
    "created_at": "2025-06-25T09:00:00Z",
    "updated_at": "2025-06-25T09:05:00Z"
  }
}
```

---

## 2. ルーム管理API

### GET /api/rooms

ルーム一覧取得

#### クエリパラメータ
- `limit` (optional): 取得件数制限（デフォルト: 20）
- `offset` (optional): オフセット（デフォルト: 0）

#### レスポンス (200 OK)
```json
{
  "rooms": [
    {
      "id": 1,
      "name": "雑談ルーム",
      "share_token": "abc123def456...",
      "creator_session_id": "abc123",
      "message_count": 15,
      "last_activity": "2025-06-25T09:30:00Z",
      "created_at": "2025-06-25T09:00:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

### POST /api/rooms

ルーム作成

#### リクエスト
```json
{
  "name": "新しいルーム",
  "creator_session_id": "abc123"
}
```

#### レスポンス (201 Created)
```json
{
  "room": {
    "id": 2,
    "name": "新しいルーム",
    "share_token": "xyz789abc123...",
    "creator_session_id": "abc123",
    "message_count": 0,
    "last_activity": null,
    "created_at": "2025-06-25T09:40:00Z"
  }
}
```

### GET /api/rooms/:id

ルーム詳細取得

#### レスポンス (200 OK)
```json
{
  "room": {
    "id": 1,
    "name": "雑談ルーム",
    "share_token": "abc123def456...",
    "creator_session_id": "abc123",
    "message_count": 15,
    "last_activity": "2025-06-25T09:30:00Z",
    "created_at": "2025-06-25T09:00:00Z"
  }
}
```

---

## 3. メッセージAPI

### GET /api/rooms/:room_id/messages

ルーム内メッセージ一覧取得

#### クエリパラメータ
- `limit` (optional): 取得件数制限（デフォルト: 50）
- `before` (optional): 指定ID以前のメッセージを取得（ページネーション用）

#### レスポンス (200 OK)
```json
{
  "messages": [
    {
      "id": 1,
      "room_id": 1,
      "session_id": "abc123",
      "text_body": "こんにちは！",
      "user": {
        "session_id": "abc123",
        "nickname": "ぐれーとネコ123"
      },
      "created_at": "2025-06-25T09:30:00Z"
    }
  ],
  "pagination": {
    "has_more": false,
    "next_before": null
  }
}
```

### POST /api/rooms/:room_id/messages

メッセージ投稿

#### リクエスト
```json
{
  "session_id": "abc123",
  "text_body": "新しいメッセージです"
}
```

#### レスポンス (201 Created)
```json
{
  "message": {
    "id": 2,
    "room_id": 1,
    "session_id": "abc123",
    "text_body": "新しいメッセージです",
    "user": {
      "session_id": "abc123",
      "nickname": "ぐれーとネコ123"
    },
    "created_at": "2025-06-25T09:35:00Z"
  }
}
```

---

## 4. リアルタイム通信（ActionCable）

### RoomChannel

ルーム内のリアルタイムメッセージ配信

#### 接続URL
```
ws://localhost:3001/cable
```

#### チャンネル購読
```javascript
// 接続
const cable = ActionCable.createConsumer('ws://localhost:3001/cable');

// ルームチャンネルに購読
const subscription = cable.subscriptions.create(
  {
    channel: 'RoomChannel',
    room_id: 1
  },
  {
    connected() {
      console.log('Connected to room');
    },
    
    disconnected() {
      console.log('Disconnected from room');
    },
    
    received(data) {
      // 新しいメッセージを受信
      console.log('New message:', data.message);
    }
  }
);
```

#### 配信データ形式
```json
{
  "type": "new_message",
  "message": {
    "id": 2,
    "room_id": 1,
    "session_id": "def456",
    "text_body": "リアルタイムメッセージ",
    "user": {
      "session_id": "def456",
      "nickname": "すてきイヌ789"
    },
    "created_at": "2025-06-25T09:40:00Z"
  }
}
```

---

## 5. エラーコード一覧

| コード | HTTPステータス | 説明 |
|--------|----------------|------|
| VALIDATION_ERROR | 422 | バリデーションエラー |
| NOT_FOUND | 404 | リソースが見つからない |
| UNAUTHORIZED | 401 | 認証エラー |
| FORBIDDEN | 403 | アクセス権限がない |
| INTERNAL_SERVER_ERROR | 500 | サーバー内部エラー |

---

## 6. 実装ノート

### セッション管理
- セッションIDはフロントエンドで生成（英数字6桁）
- ニックネームはフロントエンドで生成またはユーザー入力
- IPアドレスとUser-Agentは自動収集

### ルーム管理
- share_tokenはルーム作成時に自動生成
- 論理削除（discard）により履歴保持
- メッセージ数と最終活動時刻は集計値

### メッセージ
- リアルタイム配信はActionCableを使用
- 論理削除対応
- ページネーション対応（before IDベース）

### セキュリティ
- XSS対策：入力値のサニタイゼーション
- CSRF対策：Rails標準機能を使用
- Rate Limiting：必要に応じて実装