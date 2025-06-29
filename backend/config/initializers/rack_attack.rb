# rack-attack設定
class Rack::Attack
  # メモリストア使用（本番環境ではRedisを推奨）
  Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new

  # ログ出力設定
  ActiveSupport::Notifications.subscribe('rack.attack') do |name, start, finish, request_id, payload|
    Rails.logger.info "[Rack::Attack] #{payload[:request].env['REQUEST_METHOD']} #{payload[:request].fullpath} #{name} discriminator: #{payload[:discriminator]}"
  end

  ### レート制限設定 ###

  # API全体のレート制限（IPアドレス単位）
  throttle('api/ip', limit: 300, period: 5.minutes) do |req|
    req.ip if req.path.start_with?('/api/')
  end

  # メッセージ送信のレート制限（IPアドレス単位）
  throttle('messages/ip', limit: 30, period: 1.minute) do |req|
    if req.path.match?(/\/api\/rooms\/[^\/]+\/messages$/) && req.post?
      req.ip
    end
  end

  # ルーム作成のレート制限（IPアドレス単位）
  throttle('rooms/ip', limit: 5, period: 1.hour) do |req|
    if req.path == '/api/rooms' && req.post?
      req.ip
    end
  end

  # セッション更新のレート制限（IPアドレス単位）
  throttle('sessions/ip', limit: 20, period: 1.minute) do |req|
    if req.path == '/api/sessions' && req.put?
      req.ip
    end
  end

  ### スパム対策 ###

  # 同一IPからの短時間での大量リクエスト
  throttle('req/ip', limit: 100, period: 1.minute) do |req|
    req.ip
  end

  # 同一User-Agentからの大量リクエスト
  throttle('req/user_agent', limit: 500, period: 5.minutes) do |req|
    req.user_agent if req.user_agent.present?
  end

  ### セキュリティ対策 ###

  # 特定のIPアドレスをブロック（環境変数で設定可能）
  blocklist('block_bad_ips') do |req|
    blocked_ips = ENV.fetch('BLOCKED_IPS', '').split(',').map(&:strip)
    blocked_ips.include?(req.ip)
  end

  # User-Agentが空のリクエストをブロック
  blocklist('block_empty_user_agent') do |req|
    req.user_agent.blank?
  end

  ### カスタムレスポンス ###

  # レート制限に引っかかった場合のレスポンス
  self.throttled_responder = lambda do |env|
    [
      429, # Too Many Requests
      { 'Content-Type' => 'application/json' },
      [{ error: { message: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' } }.to_json]
    ]
  end

  # ブロックされた場合のレスポンス
  self.blocklisted_responder = lambda do |env|
    [
      403, # Forbidden
      { 'Content-Type' => 'application/json' },
      [{ error: { message: 'Forbidden', code: 'BLOCKED' } }.to_json]
    ]
  end
end

# 開発環境では無効化（必要に応じて有効化）
if Rails.env.development?
  Rails.logger.info "Rack::Attack is enabled in development mode"
end