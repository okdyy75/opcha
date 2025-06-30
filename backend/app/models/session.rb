require "activerecord/session_store"

class Session < ActiveRecord::SessionStore::Session
  validates :nickname, length: { maximum: 32 }, allow_blank: true

  has_many :created_rooms, class_name: "Room", foreign_key: "creator_session_id", primary_key: "session_id"
  has_many :messages, foreign_key: "session_id", primary_key: "session_id"

  before_create :generate_display_name
  before_save :update_last_accessed_at

  # セッション有効期限（デフォルト7日）
  EXPIRY_TIME = 7.days

  scope :active, -> { where('updated_at > ?', EXPIRY_TIME.ago) }
  scope :expired, -> { where('updated_at <= ?', EXPIRY_TIME.ago) }

  def self.find_by_raw_session_id(raw_session_id)
    session_id_object = Rack::Session::SessionId.new(raw_session_id)
    private_session_id = session_id_object.private_id
    active.where(session_id: private_session_id).first
  end

  def expired?
    updated_at <= EXPIRY_TIME.ago
  end

  def active?
    !expired?
  end

  def touch_last_access!
    touch(:updated_at)
  end

  # ActiveRecord::SessionStore::Sessionでは、dataにアクセスしてloaded状態にする必要がある
  def update(...)
    # loaded状態にするためにdataにアクセスすることでthrow :abortされなくなる
    data unless loaded?
    super
  end

  def update!(...)
    # loaded状態にするためにdataにアクセスすることでthrow :abortされなくなる
    data unless loaded?
    super
  end

  # 期限切れセッションの削除
  def self.cleanup_expired_sessions
    expired_count = expired.delete_all
    Rails.logger.info "Cleaned up #{expired_count} expired sessions"
    expired_count
  end

  private

  def generate_display_name
    # 8桁の英数字でdisplay_nameを生成
    self.display_name = SecureRandom.alphanumeric(8)
  end

  def update_last_accessed_at
    # セッションが更新される際に最終アクセス時刻を更新
    self.updated_at = Time.current if will_save_change_to_data? || will_save_change_to_nickname?
  end
end

ActionDispatch::Session::ActiveRecordStore.session_class = Session
