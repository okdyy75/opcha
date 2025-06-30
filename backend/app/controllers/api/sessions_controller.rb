class Api::SessionsController < ApplicationController
  before_action :set_session

  def show
    # セッションアクセス時刻を更新
    @session.touch_last_access!
    render json: { session: session_json(@session) }
  end

  def update
    @session.update!(session_params)
    render json: { session: session_json(@session) }
  end

  private

  def set_session
    @session = Session.find_by_raw_session_id(current_session_id)
    
    if @session.nil?
      render json: { error: { message: "Session not found or expired", code: "SESSION_EXPIRED" } }, status: :unauthorized
      return
    end
    
    if @session.expired?
      render json: { error: { message: "Session expired", code: "SESSION_EXPIRED" } }, status: :unauthorized
      return
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: { message: "Session not found", code: "NOT_FOUND" } }, status: :not_found
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
      updated_at: session.updated_at,
      expires_at: session.updated_at + Session::EXPIRY_TIME,
      active: session.active?
    }
  end
end
