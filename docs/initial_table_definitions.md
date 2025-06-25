# テーブル定義仕様書（初版）

## 1. sessions テーブル

匿名・登録ユーザー問わず、セッション単位でユーザー情報やアクセス情報を管理します。

| カラム名       | 型            | 制約         | 説明                                 |
|---------------|--------------|--------------|--------------------------------------|
| id            | BIGINT       | PRIMARY KEY  | セッション管理用ID（自動採番）       |
| session_id    | VARCHAR(255) | UNIQUE       | セッションID                      |
| data          | TEXT         |              | セッションデータ                   |
| ip_address    | VARCHAR(45)  |              | IPアドレス                           |
| user_agent    | TEXT         |              | ユーザーエージェント                 |
| nickname      | VARCHAR(32)  |              | ニックネーム                         |
| created_at    | TIMESTAMP    | NOT NULL     | 作成日時                             |
| updated_at    | TIMESTAMP    | NOT NULL     | 更新日時                             |

---

## 2. rooms テーブル

チャットルームの情報を管理するテーブル。論理削除により履歴を保持します。

| カラム名             | 型           | 制約         | 説明                                 |
|---------------------|--------------|--------------|--------------------------------------|
| id                  | BIGINT       | PRIMARY KEY  | ルームID（自動採番）                 |
| name                | VARCHAR(100) | NOT NULL     | ルーム名                             |
| share_token         | VARCHAR(64)  | UNIQUE       | ルーム共有用トークン                 |
| creator_session_id  | VARCHAR(255) | FOREIGN KEY  | 作成者のセッションID                 |
| created_at          | TIMESTAMP    | NOT NULL     | 作成日時                             |
| updated_at          | TIMESTAMP    | NOT NULL     | 更新日時                             |
| discarded_at        | TIMESTAMP    |              | 論理削除日時（NULLなら有効）         |

---

## 3. messages テーブル

各チャットルーム内のメッセージを管理するテーブル。論理削除により履歴を保持します。

| カラム名       | 型           | 制約         | 説明                                 |
|---------------|--------------|--------------|--------------------------------------|
| id            | BIGINT       | PRIMARY KEY  | メッセージID（自動採番）             |
| room_id       | BIGINT       | FOREIGN KEY  | ルームID（rooms.id）                 |
| session_id    | VARCHAR(255) | FOREIGN KEY  | 投稿者のセッションID                 |
| text_body     | TEXT         | NOT NULL     | メッセージ本文                       |
| created_at    | TIMESTAMP    | NOT NULL     | 投稿日時                             |
| updated_at    | TIMESTAMP    | NOT NULL     | 更新日時                             |
| discarded_at  | TIMESTAMP    |              | 論理削除日時（NULLなら有効）         |
