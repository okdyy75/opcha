class Session < ApplicationRecord
  validates :session_id, presence: true, uniqueness: true
  validates :nickname, length: { maximum: 32 }
  
  has_many :created_rooms, class_name: 'Room', foreign_key: 'creator_session_id', primary_key: 'session_id'
  has_many :messages, foreign_key: 'session_id', primary_key: 'session_id'
end
