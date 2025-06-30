class ApplicationController < ActionController::API
  include RateLimitable
  
  rescue_from StandardError, with: :handle_internal_server_error
  
  before_action :set_security_headers

  private

  def current_session_id
    # セッションが初期化されていない場合は新しく生成
    if !session[:_initialized]
      session[:_initialized] = true
      logger.info("session initialized: #{session[:session_id]}")
      @session = Session.find_by_raw_session_id(session[:session_id])
      @session.update!(ip_address: request.remote_ip, user_agent: request.user_agent)
    end

    session[:session_id]
  end

  def set_security_headers
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['X-Permitted-Cross-Domain-Policies'] = 'none'
  end

  def validate_content_type
    return true if request.content_type.blank? || request.content_type.include?('application/json')
    
    log_security_event('invalid_content_type', { content_type: request.content_type })
    render json: {
      error: {
        message: "Invalid content type. Expected application/json.",
        code: "INVALID_CONTENT_TYPE"
      }
    }, status: :bad_request
    false
  end

  def sanitize_params(params_hash)
    return params_hash unless params_hash.is_a?(Hash)
    
    params_hash.transform_values do |value|
      if value.is_a?(String)
        # HTMLタグの除去とXSS対策
        ActionController::Base.helpers.strip_tags(value).strip
      elsif value.is_a?(Hash)
        sanitize_params(value)
      else
        value
      end
    end
  end

  def handle_internal_server_error(exception)
    Rails.logger.error "Internal Server Error: #{exception.message}"
    Rails.logger.error exception.backtrace.join("\n")

    render json: {
      error: {
        message: "Internal server error",
        code: "INTERNAL_SERVER_ERROR"
      }
    }, status: :internal_server_error
  end
end
