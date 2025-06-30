# セキュリティ強化設定

Rails.application.configure do
  # CSRF保護を有効化
  config.force_ssl = false # 開発環境では無効

  # セキュリティヘッダーの設定
  config.force_ssl = Rails.env.production?
  
  # デフォルトヘッダーの設定（CORSで上書きされる可能性あり）
  config.public_file_server.headers = {
    'X-Frame-Options' => 'DENY',
    'X-Content-Type-Options' => 'nosniff',
    'X-XSS-Protection' => '1; mode=block',
    'Referrer-Policy' => 'strict-origin-when-cross-origin'
  }
end

# レート制限設定
RATE_LIMITS = {
  message_creation: { limit: 30, window: 60 }, # 1分間に30回
  room_creation: { limit: 5, window: 300 },    # 5分間に5回
  session_update: { limit: 10, window: 60 }    # 1分間に10回
}.freeze