class Room < ApplicationRecord
  include Discard::Model

  validates :name, presence: true, length: { maximum: 50 }
  validates :share_token, uniqueness: true, allow_blank: true
  validate :no_malicious_content

  before_save :sanitize_content

  belongs_to :creator_session, class_name: "Session", optional: true
  has_many :messages, dependent: :destroy

  before_create :generate_share_token

  private

  def no_malicious_content
    return unless name.present?
    
    # 危険なタグやスクリプトの検出
    dangerous_patterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ]
    
    dangerous_patterns.each do |pattern|
      if name.match?(pattern)
        errors.add(:name, "contains prohibited content")
        break
      end
    end
  end

  def sanitize_content
    return unless name.present?
    
    # HTMLタグの除去とエスケープ
    self.name = ActionController::Base.helpers.strip_tags(name).strip
  end

  def generate_share_token
    # 6桁の英数字でユニークなshare_tokenを生成
    loop do
      token = SecureRandom.alphanumeric(6).downcase
      break self.share_token = token unless Room.exists?(share_token: token)
    end
  end

  def to_param
    share_token
  end
end
