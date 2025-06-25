class Api::SessionsController < ApplicationController
  before_action :set_session, only: [ :update ]

  def create
    @session = Session.find_or_initialize_by(session_id: session_params[:session_id])

    @session.assign_attributes(session_params)
    @session.ip_address = request.remote_ip
    @session.user_agent = request.user_agent

    if @session.save
      render json: { session: session_json(@session) }, status: :created
    else
      render json: { error: { message: @session.errors.full_messages.join(", "), code: "VALIDATION_ERROR" } }, status: :unprocessable_entity
    end
  end

  def update
    if @session.update(nickname: params[:nickname])
      render json: { session: session_json(@session) }
    else
      render json: { error: { message: @session.errors.full_messages.join(", "), code: "VALIDATION_ERROR" } }, status: :unprocessable_entity
    end
  end

  private

  def set_session
    @session = Session.find_by!(session_id: params[:session_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: { message: "Session not found", code: "NOT_FOUND" } }, status: :not_found
  end

  def session_params
    params.require(:session).permit(:session_id, :nickname, :data)
  end

  def session_json(session)
    {
      id: session.id,
      session_id: session.session_id,
      nickname: session.nickname,
      created_at: session.created_at,
      updated_at: session.updated_at
    }
  end
end
