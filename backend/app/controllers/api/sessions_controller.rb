class Api::SessionsController < ApplicationController
  before_action :set_session
  before_action :validate_content_type, only: [:update]
  before_action :check_session_rate_limit, only: [:update]

  def show
    render json: { session: session_json(@session) }
  end

  def update
    # パラメータのサニタイズ
    sanitized_params = sanitize_params(session_params.to_h)
    
    @session.update!(sanitized_params)
    
    log_security_event('session_updated', { 
      nickname: @session.nickname 
    })
    
    render json: { session: session_json(@session) }
  end

  private

  def set_session
    @session = Session.find_by_raw_session_id(current_session_id)
  rescue ActiveRecord::RecordNotFound
    render json: { error: { message: "Session not found", code: "NOT_FOUND" } }, status: :not_found
  end

  def check_session_rate_limit
    check_rate_limit(:session_update)
  end

  def session_params
    params.permit(:nickname)
  end

  def session_json(session)
    {
      id: session.id,
      session_id: session.session_id,
      display_name: session.display_name,
      nickname: session.nickname,
      created_at: session.created_at,
      updated_at: session.updated_at
    }
  end
end
