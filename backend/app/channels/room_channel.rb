class RoomChannel < ApplicationCable::Channel
  def subscribed
    room = Room.kept.find(params[:room_id])
    stream_from "room_#{room.id}"
  rescue ActiveRecord::RecordNotFound
    reject
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
