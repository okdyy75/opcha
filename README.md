## ローカル開発環境の起動方法

1. 環境変数ファイルをコピー

```sh
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Docker Composeで起動

```sh
docker-compose up --build
```

- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:3001
- DB: localhost:5432（開発用PostgreSQL）

## Google Cloudデプロイ補足

- 本番DBはCloud SQL(PostgreSQL)を利用し、`db`サービスは不要です。
- Cloud Run用には各サービスのDockerfileをそのまま利用できます。
- Railsの`DATABASE_URL`はCloud SQL接続情報に書き換えてください。
- master.key等のシークレットはGoogle Secret Manager等で管理してください。

## Google Cloud Build/Run での自動デプロイ手順

1. 必要なGoogle Cloudリソースを作成
   - Artifact Registry（Docker用リポジトリ）
   - Cloud SQL（PostgreSQL）
   - Secret Manager（RAILS_MASTER_KEY等）
   - Cloud Run（サービスは自動作成されます）

2. cloudbuild.yaml の変数を編集
   - プロジェクトID、リージョン、リポジトリ名、Cloud SQL接続名など

3. Cloud Buildトリガーを作成
   - GCPコンソール「Cloud Build」→「トリガー」→「新しいトリガー」
   - リポジトリとブランチ、cloudbuild.yamlを指定
   - 必要に応じてサービスアカウント権限を付与

4. pushやPRで自動ビルド・デプロイ

### 注意点
- Artifact Registryのリポジトリは事前に作成してください
- Cloud SQLのユーザー名・パスワード・DB名はSecret Managerや環境変数で安全に管理してください
- RAILS_MASTER_KEYはSecret Managerで管理し、Cloud Runのデプロイ時に`--set-secrets`で渡します
- Cloud SQLの接続は`--add-cloudsql-instances`でCloud Runに紐付けます
- backend, frontendともDockerfileはそのまま利用できます

### 参考: cloudbuild.yaml
詳しくは`cloudbuild.yaml`を参照してください 