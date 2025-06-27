class Api::MessagesController < ApplicationController
  before_action :set_session
  before_action :set_room

  def index
    limit = params[:limit]&.to_i || 50
    before_id = params[:before]&.to_i

    @messages = @room.messages.kept.includes(:session)
    @messages = @messages.where("id < ?", before_id) if before_id
    @messages = @messages.order(created_at: :desc).limit(limit)

    render json: {
      messages: @messages.reverse.map { |message| message_json(message) },
      pagination: {
        has_more: @messages.size == limit,
        next_before: @messages.last&.id
      }
    }
  end

  def create
    @message = @room.messages.build(message_params)
    @message.session_id = @session.id

    if @message.save
      render json: { message: message_json(@message) }, status: :created
    else
      render json: { error: { message: @message.errors.full_messages.join(", "), code: "VALIDATION_ERROR" } }, status: :unprocessable_entity
    end
  end

  private

  def set_session
    @session = Session.find_by_raw_session_id(current_session_id)
  end

  def set_room
    @room = Room.kept.find_by!(share_token: params[:room_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: { message: "Room not found", code: "NOT_FOUND" } }, status: :not_found
  end

  def message_params
    params.require(:message).permit(:text_body)
  end

  def message_json(message)
    {
      id: message.id,
      room_id: message.room_id,
      text_body: message.text_body,
      session: message.session ? {
        display_name: message.session.display_name,
        nickname: message.session.nickname
      } : {
        display_name: "unknown",
        nickname: "Unknown User"
      },
      is_own: message.session.id == @session.id,
      created_at: message.created_at
    }
  end
end
