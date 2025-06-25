class Message < ApplicationRecord
  include Discard::Model

  validates :text_body, presence: true
  validates :session_id, presence: true

  belongs_to :room
  belongs_to :session, foreign_key: "session_id", primary_key: "session_id", optional: true

  scope :recent, -> { order(created_at: :desc) }
  scope :in_room, ->(room_id) { where(room_id: room_id) }
end
