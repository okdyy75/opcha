class Api::RoomsController < ApplicationController
  before_action :set_room, only: [ :show ]

  def index
    limit = params[:limit]&.to_i || 20
    offset = params[:offset]&.to_i || 0

    @rooms = Room.kept
                 .includes(:messages)
                 .limit(limit)
                 .offset(offset)
                 .order(created_at: :desc)

    total_count = Room.kept.count

    render json: {
      rooms: @rooms.map { |room| room_json(room) },
      pagination: {
        total: total_count,
        limit: limit,
        offset: offset
      }
    }
  end

  def show
    render json: { room: room_json(@room) }
  end

  def create
    @room = Room.new(room_params)

    if @room.save
      render json: { room: room_json(@room) }, status: :created
    else
      render json: { error: { message: @room.errors.full_messages.join(", "), code: "VALIDATION_ERROR" } }, status: :unprocessable_entity
    end
  end

  private

  def set_room
    @room = Room.kept.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: { message: "Room not found", code: "NOT_FOUND" } }, status: :not_found
  end

  def room_params
    params.require(:room).permit(:name, :creator_session_id)
  end

  def room_json(room)
    last_message = room.messages.kept.order(created_at: :desc).first

    {
      id: room.id,
      name: room.name,
      share_token: room.share_token,
      creator_session_id: room.creator_session_id,
      message_count: room.messages.kept.count,
      last_activity: last_message&.created_at,
      created_at: room.created_at
    }
  end
end
