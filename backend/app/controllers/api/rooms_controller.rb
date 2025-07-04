class Api::RoomsController < ApplicationController
  before_action :set_session
  before_action :set_room, only: [ :show ]

  def index
    limit = params[:limit]&.to_i || 50
    offset = params[:offset]&.to_i || 0

    @rooms = Room.kept
                 .includes(:messages)
                 .limit(limit)
                 .offset(offset)
                 .order(created_at: :desc)

    total_count = Room.kept.count

    set_grouped_rooms(@rooms.pluck(:id).uniq)
    render json: {
      rooms: @rooms.map { |room| room_json(room, @message_counts, @session_counts, @last_message_ats) },
      pagination: {
        total: total_count,
        limit: limit,
        offset: offset
      }
    }
  end

  def show
    set_grouped_rooms([ @room.id ])
    render json: { room: room_json(@room, @message_counts, @session_counts, @last_message_ats) }
  end

  def create
    @room = Room.new(room_params)
    @room.creator_session_id = @session.id

    if @room.save
      set_grouped_rooms([ @room.id ])
      render json: { room: room_json(@room, @message_counts, @session_counts, @last_message_ats) }, status: :created
    else
      render json: { error: { message: @room.errors.full_messages.join(", "), code: "VALIDATION_ERROR" } }, status: :unprocessable_entity
    end
  end

  private

  def set_session
    @session = Session.find_by_raw_session_id(current_session_id)
  end

  def set_room
    @room = Room.kept.find_by!(share_token: params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: { message: "Room not found", code: "NOT_FOUND" } }, status: :not_found
  end

  def set_grouped_rooms(room_ids)
    @message_counts = Message.kept.where(room_id: room_ids).group(:room_id).count
    @session_counts = Message.kept.where(room_id: room_ids).group(:room_id).distinct.count(:session_id)
    @last_message_ats = Message.kept.where(room_id: room_ids).group(:room_id).maximum(:updated_at)
  end

  def room_params
    params.require(:room).permit(:name)
  end

  def room_json(room, message_counts, session_counts, last_message_ats)
    {
      id: room.id,
      name: room.name,
      share_token: room.share_token,
      creator_session_id: room.creator_session_id,
      message_count: message_counts[room.id] || 0,
      participant_count: session_counts[room.id] || 0,
      last_activity: last_message_ats[room.id] || nil,
      created_at: room.created_at
    }
  end
end
