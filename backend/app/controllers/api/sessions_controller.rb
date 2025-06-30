class Api::SessionsController < ApplicationController
  before_action :set_session

  def show
    render json: { session: session_json(@session) }
  end

  def update
    @session.update!(session_params)
    render json: { session: session_json(@session) }
  end

  private

  def set_session
    @session = Session.find_by_raw_session_id(current_session_id)
    
    # セッションが見つからない場合は新規作成
    if @session.nil?
      @session = Session.create!(
        session_id: Rack::Session::SessionId.new(current_session_id).private_id,
        ip_address: request.remote_ip,
        user_agent: request.user_agent
      )
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
      updated_at: session.updated_at
    }
  end
end
