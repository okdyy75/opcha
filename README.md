# オープンチャットサービス (opcha)

匿名で気軽に参加・閲覧できるチャットルームサービス

## 技術構成

- **フロントエンド**: Next.js (TypeScript)
- **バックエンド**: Ruby on Rails (API)
- **データベース**: PostgreSQL
- **リアルタイム通信**: Pusher / ActionCable
- **デプロイ**: Google Cloud (Cloud Run + Cloud SQL)
  - 最安のDBインスタンスを使用するために台湾リージョン（asia-east1）で構築

## 開発環境構築

### 必要な環境

- Docker & Docker Compose
- Git

### セットアップ手順

1. リポジトリをクローン
```bash
git clone https://github.com/your-username/opcha-claude-code.git
cd opcha-claude-code
```

2. 環境変数ファイルをコピー
```bash
cp .env.example .env.development
```

3. Docker環境を起動
```bash
docker-compose up -d
```

4. データベースのセットアップ
```bash
docker-compose exec backend rails db:create db:migrate db:seed
```

### 開発サーバーアクセス

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:3001
- **PostgreSQL**: localhost:5432

### よく使うコマンド

```bash
# 全サービス起動
docker-compose up -d

# ログ確認
docker-compose logs -f [サービス名]

# サービス停止
docker-compose down

# データベースリセット
docker-compose exec backend rails db:drop db:create db:migrate db:seed

# バックエンドのコンソール
docker-compose exec backend rails console

# フロントエンドのシェル
docker-compose exec frontend sh
```

## 本番環境デプロイ (Google Cloud)

### 前提条件

- Google Cloud CLI (`gcloud`) がインストール済み
- Docker がインストール済み
- Google Cloud プロジェクトが作成済み

### セットアップ手順

1. Google Cloud プロジェクトの設定
```bash
gcloud config set project YOUR_PROJECT_ID
gcloud auth configure-docker
```

2. Cloud SQL インスタンスの作成
```bash
gcloud sql instances create opcha-db \\
  --database-version=POSTGRES_17 \\
  --tier=db-f1-micro \\
  --region=asia-east1
```

3. データベースの作成
```bash
gcloud sql databases create opcha_production --instance=opcha-db
```

4. Cloud Build を使用してデプロイ
```bash
gcloud builds submit --config cloudbuild.yaml
```

### 環境変数設定

以下の環境変数をCloud Runサービスに設定してください：

- `DATABASE_URL`: Cloud SQLの接続URL
- `RAILS_MASTER_KEY`: Rails のマスターキー
- `PUSHER_*`: Pusher設定（リアルタイム通信用）

## プロジェクト構成

```
opcha-claude-code/
├── backend/              # Rails API
├── frontend/             # Next.js アプリ
├── docs/                 # ドキュメント
├── docker-compose.yml    # 開発環境用
├── docker-compose.prod.yml # 本番環境用
├── cloudbuild.yaml       # Google Cloud Build設定
├── .env.example          # 環境変数のテンプレート
└── README.md
```

## 機能

- [ ] チャットルームの作成・参加
- [ ] リアルタイムメッセージング
- [ ] 匿名ユーザー対応
- [ ] URLシェア機能
- [ ] モバイル対応

## 開発ルール

- シンプルな実装を心がける
- 適切な粒度でコミットする
- テストを書いてから実装する