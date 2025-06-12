# オープンチャットサービス（opcha）

誰でも気軽に参加・閲覧できるチャットルームサービス

## 技術スタック

- **フロントエンド**: Next.js (TypeScript)
- **バックエンド**: Ruby on Rails (API)
- **データベース**: PostgreSQL
- **デプロイ**: Google Cloud (Cloud Run + Cloud SQL)

## 開発環境のセットアップ

### 前提条件

- Docker Desktop
- Docker Compose

### 開発環境の起動

```bash
# リポジトリをクローン
git clone <repository-url>
cd opcha-claude

# Docker環境を起動
docker-compose up --build

# データベースのセットアップ（初回のみ）
docker-compose exec backend rails db:create db:migrate
```

### アクセス先

- **フロントエンド**: http://localhost:3001
- **バックエンド API**: http://localhost:3000
- **PostgreSQL**: localhost:5432

### 開発時のコマンド

```bash
# ログを確認
docker-compose logs -f

# Rails コンソールにアクセス
docker-compose exec backend rails console

# フロントエンドのシェルにアクセス
docker-compose exec frontend sh

# 環境を停止
docker-compose down

# ボリュームも含めて完全にクリア
docker-compose down -v
```

## Google Cloud へのデプロイ

### 前提条件

- Google Cloud Platform アカウント
- Google Cloud CLI (gcloud) のインストール
- プロジェクトの作成と請求の有効化

### 必要なサービスの有効化

```bash
# 必要なAPIを有効化
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable sql-component.googleapis.com
gcloud services enable sqladmin.googleapis.com
```

### Cloud SQL (PostgreSQL) のセットアップ

```bash
# Cloud SQL インスタンスを作成
gcloud sql instances create opcha-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=asia-northeast1

# データベースを作成
gcloud sql databases create opcha_production --instance=opcha-db

# ユーザーを作成
gcloud sql users create opcha-user --instance=opcha-db --password=<secure-password>
```

### Secret Manager の設定

```bash
# RAILS_MASTER_KEY を設定
echo -n "your-rails-master-key" | gcloud secrets create RAILS_MASTER_KEY --data-file=-
```

### Cloud Build を使用したデプロイ

```bash
# cloudbuild.yaml の環境変数を更新
# PROJECT_ID, REGION, INSTANCE_NAME などを適切に設定

# デプロイ実行
gcloud builds submit --config cloudbuild.yaml
```

### 手動デプロイ（開発・テスト用）

```bash
# バックエンドのビルドとデプロイ
cd backend
gcloud builds submit --tag gcr.io/PROJECT_ID/opcha-backend
gcloud run deploy opcha-backend \
    --image gcr.io/PROJECT_ID/opcha-backend \
    --platform managed \
    --region asia-northeast1 \
    --allow-unauthenticated

# フロントエンドのビルドとデプロイ
cd ../frontend
gcloud builds submit --tag gcr.io/PROJECT_ID/opcha-frontend
gcloud run deploy opcha-frontend \
    --image gcr.io/PROJECT_ID/opcha-frontend \
    --platform managed \
    --region asia-northeast1 \
    --allow-unauthenticated
```

## 環境変数

### 開発環境 (.env.local)

```bash
# フロントエンド用
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 本番環境

Cloud Run サービスで以下の環境変数を設定：

#### バックエンド
- `RAILS_ENV=production`
- `DATABASE_URL=postgresql://user:password@/opcha_production?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME`
- `RAILS_MASTER_KEY` (Secret Manager から)

#### フロントエンド
- `NEXT_PUBLIC_API_URL=https://your-backend-service-url`

## 機能要件

- [x] チャットルームの一覧表示
- [x] 誰でもルーム作成可能（ランダムなURL生成）
- [x] 誰でもルーム参加可能
- [x] メッセージの送信・リアルタイム表示
- [x] メッセージの削除（投稿者本人のみ）
- [x] メッセージの一覧表示（最大50件まで保持）
- [x] 匿名ユーザー機能
- [x] シンプルなチャットUI
- [x] モバイル対応

## ライセンス

MIT License 