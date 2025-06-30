class Message < ApplicationRecord
  include Discard::Model

  validates :text_body, presence: true, length: { maximum: 1000 }
  validate :no_malicious_content
  validate :rate_limit_validation

  belongs_to :room
  belongs_to :session

  scope :recent, -> { order(created_at: :desc) }
  scope :in_room, ->(room_id) { where(room_id: room_id) }

  before_save :sanitize_content

  private

  def no_malicious_content
    return unless text_body.present?
    
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
      if text_body.match?(pattern)
        errors.add(:text_body, "contains prohibited content")
        break
      end
    end
  end

  def rate_limit_validation
    return unless session_id.present?
    
    # 1分以内の投稿数をチェック
    recent_count = Message.kept
      .where(session_id: session_id)
      .where('created_at > ?', 1.minute.ago)
      .count
    
    if recent_count >= 30 # 1分間に30回まで
      errors.add(:base, "Too many messages. Please slow down.")
    end
  end

  def sanitize_content
    return unless text_body.present?
    
    # HTMLタグの除去とエスケープ
    self.text_body = ActionController::Base.helpers.strip_tags(text_body).strip
    
    # 改行文字の正規化
    self.text_body = text_body.gsub(/\r\n|\r/, "\n")
    
    # 連続する改行の制限（最大3つまで）
    self.text_body = text_body.gsub(/\n{4,}/, "\n\n\n")
  end
end
