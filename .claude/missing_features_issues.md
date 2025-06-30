# opcha プロジェクト - 不足機能 Issue 一覧

### Issue 1: Pusherを使用したリアルタイム通信機能の実装
**Priority**: Critical  
**Label**: `enhancement`, `backend`, `frontend`, `critical`

**概要**:
画面仕様書で要求されている「リアルタイム表示」機能をPusherを使用して実装。

**実装が必要な項目**:
- [ ] Pusher設定とチャンネル作成
- [ ] メッセージリアルタイムブロードキャスト
- [ ] フロントエンドPusher接続実装
- [ ] ユーザー在線状態管理
- [ ] リアルタイム参加者数更新
- [ ] メッセージ送信時の即座反映

**技術仕様**:
- バックエンド: Pusher Ruby SDK
- フロントエンド: pusher-js
- チャンネル: プライベートチャンネル（ルーム単位）
- 認証: セッションベース

**影響範囲**:
- `backend/config/initializers/pusher.rb` (新規作成)
- `backend/app/controllers/api/messages_controller.rb`
- `frontend/src/lib/pusher.ts` (新規作成)
- `frontend/src/app/rooms/[id]/page.tsx`


### Issue 2: ルーム一覧の無限スクロール対応
**Priority**: Medium  
**Label**: `enhancement`, `frontend`, `backend`, `ux`

**概要**:
ルーム一覧ページでの無限スクロール機能実装によるユーザビリティ向上。

**実装が必要な項目**:
- [ ] バックエンドページネーション改善
- [ ] Intersection Observer API実装
- [ ] ローディング状態管理
- [ ] エラーハンドリングの強化
- [ ] スクロール位置保持機能

**技術仕様**:
- 初期読み込み: 20件
- 追加読み込み: 10件ずつ
- API: cursor-based pagination
- フロントエンド: Intersection Observer

**影響範囲**:
- `backend/app/controllers/api/rooms_controller.rb`
- `frontend/src/app/rooms/page.tsx`
- `frontend/src/hooks/useInfiniteScroll.ts` (新規作成)

---

### Issue 3: メッセージ表示の最適化（最新50件制限）
**Priority**: Medium  
**Label**: `enhancement`, `frontend`, `backend`, `performance`

**概要**:
メッセージ表示を最新50件に制限し、パフォーマンスとユーザビリティを向上。

**実装が必要な項目**:
- [ ] バックエンドメッセージ取得の制限実装
- [ ] 過去メッセージ読み込み機能
- [ ] スクロール位置管理
- [ ] 新着メッセージの自動表示
- [ ] メッセージキャッシュ戦略

**技術仕様**:
- 初期表示: 最新50件
- 過去メッセージ: 20件ずつ読み込み
- 自動削除: 表示件数上限超過時
- スクロール: 新着時は最下部へ自動移動

**影響範囲**:
- `backend/app/controllers/api/messages_controller.rb`
- `frontend/src/app/rooms/[id]/page.tsx`
- `frontend/src/hooks/useMessages.ts` (新規作成)

---

### Issue 4: 24時間以上非アクティブなルームの自動削除
**Priority**: Medium  
**Label**: `enhancement`, `backend`, `maintenance`

**概要**:
データベース容量管理とシステムパフォーマンス向上のため、非アクティブルームの自動削除機能実装。

**実装が必要な項目**:
- [ ] ルーム最終アクティビティ時刻追跡
- [ ] 自動削除バッチ処理
- [ ] 削除前の警告通知機能
- [ ] 削除ログ機能
- [ ] cron job設定

**技術仕様**:
- 削除条件: 最終メッセージから24時間経過
- バッチ処理: 毎時実行
- 論理削除: discard gem使用
- 通知: 削除1時間前にアクティブユーザーに通知

**影響範囲**:
- `backend/app/models/room.rb`
- `backend/lib/tasks/room_cleanup.rake` (新規作成)
- `backend/app/jobs/room_cleanup_job.rb` (新規作成)
- `backend/app/jobs/room_warning_job.rb` (新規作成)

---

### Issue 5: メッセージの削除機能実装
**Priority**: Medium  
**Label**: `enhancement`, `backend`, `api`

**概要**:
メッセージの削除機能実装でユーザーコントロールを向上。

**実装が必要な項目**:
- [ ] メッセージ削除API (`DELETE /api/rooms/:room_id/messages/:id`)
- [ ] 削除権限チェック（投稿者のみ）
- [ ] フロントエンド削除UI実装
- [ ] 削除確認モーダル

**技術仕様**:
- 論理削除の利用（discard gem）
- セッション認証による権限制御
- リアルタイム削除通知（Pusher）

**影響範囲**:
- `backend/app/controllers/api/messages_controller.rb`
- `backend/config/routes.rb`
- `frontend/src/app/rooms/[id]/page.tsx`

---

### Issue 6: セッション管理の強化
**Priority**: Medium  
**Label**: `enhancement`, `backend`, `security`

**概要**:
セッション有効期限管理とクリーンアップ機能の実装。

**実装が必要な項目**:
- [ ] セッション自動削除バッチ処理
- [ ] 期限切れセッション検知機能
- [ ] セッション延長機能
- [ ] 不要セッション定期削除（cron job）

**技術仕様**:
- 有効期限: 24時間（仕様書通り）
- バッチ処理: 毎日深夜実行
- セッション延長: アクティビティ検知時

**影響範囲**:
- `backend/app/models/session.rb`
- `backend/lib/tasks/session_cleanup.rake` (新規作成)
- `backend/app/jobs/session_cleanup_job.rb` (新規作成)

---

## 📝 重要度：低（改善提案）

### Issue 7: セキュリティ強化
**Priority**: Low  
**Label**: `enhancement`, `backend`, `security`

**概要**:
セキュリティ対策の追加実装。

**実装が必要な項目**:
- [ ] レート制限実装
- [ ] スパム対策
- [ ] XSS対策強化
- [ ] CSRF対策確認

**技術仕様**:
- レート制限: rack-attack gem
- スパム対策: 連続投稿制限、NGワード検知
