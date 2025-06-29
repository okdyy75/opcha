class Message < ApplicationRecord
  include Discard::Model

  validates :text_body, presence: true

  belongs_to :room
  belongs_to :session

  scope :recent, -> { order(created_at: :desc) }
  scope :in_room, ->(room_id) { where(room_id: room_id) }
end
