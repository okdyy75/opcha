class ApplicationController < ActionController::API
  rescue_from StandardError, with: :handle_internal_server_error

  private

  def current_session_id
    # セッションが初期化されていない場合は新しく生成
    if !session[:_initialized]
      session[:_initialized] = true
      logger.info("session initialized: #{session[:session_id]}")
      
      # セッションが存在しない場合は作成
      @session = Session.find_by_raw_session_id(session[:session_id])
      if @session.nil?
        @session = Session.create!(
          session_id: Rack::Session::SessionId.new(session[:session_id]).private_id,
          ip_address: request.remote_ip,
          user_agent: request.user_agent
        )
      else
        @session.update!(ip_address: request.remote_ip, user_agent: request.user_agent)
      end
    end

    session[:session_id]
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
