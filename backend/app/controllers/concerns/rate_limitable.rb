module RateLimitable
  extend ActiveSupport::Concern

  private

  def rate_limit_key(action, identifier = nil)
    id = identifier || (current_session_id rescue request.remote_ip)
    "rate_limit:#{action}:#{id}"
  end

  def check_rate_limit(action, limit: nil, window: nil)
    config = RATE_LIMITS[action]
    return true unless config

    limit ||= config[:limit]
    window ||= config[:window]
    
    key = rate_limit_key(action)
    
    # Redisが利用可能な場合はRedisを使用、そうでなければメモリ内で管理
    if defined?(Redis) && Rails.cache.class.name.include?('Redis')
      count = Rails.cache.increment(key, 1, expires_in: window) || 1
      Rails.cache.write(key, 1, expires_in: window) if count.nil?
    else
      # メモリ内での簡易レート制限
      @rate_limit_store ||= {}
      now = Time.current.to_i
      window_start = now - (now % window)
      
      key_with_window = "#{key}:#{window_start}"
      @rate_limit_store[key_with_window] ||= 0
      @rate_limit_store[key_with_window] += 1
      count = @rate_limit_store[key_with_window]
      
      # 古いエントリを削除
      @rate_limit_store.keys.each do |k|
        window_from_key = k.split(':').last.to_i
        @rate_limit_store.delete(k) if window_from_key < window_start - window
      end
    end

    if count > limit
      Rails.logger.warn "Rate limit exceeded for #{action}: #{key} (#{count}/#{limit})"
      render json: {
        error: {
          message: "Rate limit exceeded. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED"
        }
      }, status: :too_many_requests
      return false
    end

    true
  end

  def log_security_event(event_type, details = {})
    Rails.logger.info "SECURITY: #{event_type} - #{details.merge(
      ip: request.remote_ip,
      user_agent: request.user_agent,
      session_id: (current_session_id rescue 'unknown'),
      timestamp: Time.current.iso8601
    )}"
  end
end