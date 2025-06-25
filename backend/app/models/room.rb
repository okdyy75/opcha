class Room < ApplicationRecord
  include Discard::Model
  
  validates :name, presence: true, length: { maximum: 100 }
  validates :share_token, uniqueness: true, allow_blank: true
  
  belongs_to :creator_session, class_name: 'Session', foreign_key: 'creator_session_id', primary_key: 'session_id', optional: true
  has_many :messages, dependent: :destroy
  
  before_create :generate_share_token
  
  private
  
  def generate_share_token
    self.share_token = SecureRandom.urlsafe_base64(48)
  end
end
