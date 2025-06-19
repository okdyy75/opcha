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
gcloud sql instances create opcha-db \
  --edition=enterprise \
  --database-version=POSTGRES_17 \
  --storage-type=HDD  \
  --storage-size=10 \
  --tier=db-f1-micro \
  --region=asia-east1
```

3. データベースの作成
```bash
gcloud sql databases create opcha_production --instance=opcha-db
```

4. postgresユーザーのパスワード設定
```bash
gcloud sql users set-password postgres \
  --instance=opcha-db \
  --password=xxxxx
```

5. データベース操作用ユーザー作成
```sql
-- ユーザー作成
CREATE USER <user> WITH PASSWORD <password>;

-- データベース作成権限
ALTER USER <user> CREATEDB;
```

6. Cloud Build を使用してデプロイ
```bash
gcloud builds submit --config cloudbuild.yaml
```

### 環境変数設定

以下の環境変数をCloud Runサービスに設定してください：

- Cloud SQLの接続情報
  - `DB_NAME`: データベース名
  - `DB_USERNAME`: DBユーザー名
  - `DB_PASSWORD`: DBパスワード
- `RAILS_MASTER_KEY`: Rails のマスターキー
- `PUSHER_*`: Pusher設定（リアルタイム通信用）

```bash
# secret作成
echo -n 'xxxxx' | gcloud secrets create RAILS_MASTER_KEY --data-file=-

# secret更新
echo -n 'xxxxx' | gcloud secrets versions add RAILS_MASTER_KEY --data-file=-
```

### ジョブの実行

```bash
# ジョブの作成
gcloud run jobs create opcha-job \
    --image gcr.io/<プロジェクトID>/opcha-backend:latest \
    --region=asia-east1 \
    --set-cloudsql-instances=<CloudSQLインスタンス> \
    --set-env-vars=RAILS_ENV=production \
    --set-env-vars=DB_HOST=/cloudsql/<CloudSQLインスタンス> \
    --set-env-vars=DB_PORT=5432 \
    --set-secrets=RAILS_MASTER_KEY=RAILS_MASTER_KEY:latest \
    --set-secrets=DB_NAME=DB_NAME:latest \
    --set-secrets=DB_USERNAME=DB_USERNAME:latest \
    --set-secrets=DB_PASSWORD=DB_PASSWORD:latest

# ジョブの実行
gcloud run jobs execute opcha-job \
    --region=asia-east1 \
    --args=bin/rails,db:migrate

# ジョブの削除
gcloud run jobs delete opcha-job  \
    --region=asia-east1 \
    --quiet
```


## 開発Tips

```
# モデル作成
bin/rails g model MovieGenre name:string

# コントローラー作成
bin/rails g scaffold_controller api/MovieGenre --api
```

### Cloud SQLのDB接続
#### CLI経由

```
gcloud sql connect opcha-db --user=xxxxx --database=opcha_production 
```

#### GUI経由

下記ドキュメントを元に
- サービスアカウントの作成（opcha-local-key.jsonの取得）
- Cloud SQL Auth Proxyの設定をする

サービス アカウントを設定する - ローカル コンピュータから Cloud SQL for PostgreSQL に接続する
https://cloud.google.com/sql/docs/postgres/connect-instance-local-computer?hl=ja#set_up_a_service_account

Mac M1 - Cloud SQL Auth Proxy を使用して接続する
https://cloud.google.com/sql/docs/mysql/connect-auth-proxy?hl=ja#mac-m1

Cloud SQLのデータベースにローカルから接続する方法
https://qiita.com/ryu-yama/items/f635a7608469bf019de7


1. プロキシを起動
```
./.google_cloud/cloud-sql-proxy \
  --credentials-file ./.google_cloud/opcha-local-key.json \
  --port 1234 \
  <CloudSQLインスタンス>
```

2. クライアント側は下記設定で接続
```
Host：localhost
Port：1234
ユーザー名：xxxxx
パスワード：xxxxx
```

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