require "activerecord/session_store"

class Session < ActiveRecord::SessionStore::Session
  validates :nickname, length: { maximum: 32 }, allow_blank: true

  has_many :created_rooms, class_name: "Room", foreign_key: "creator_session_id", primary_key: "session_id"
  has_many :messages, foreign_key: "session_id", primary_key: "session_id"

  before_create :generate_display_name

  def self.find_by_raw_session_id(raw_session_id)
    session_id_object = Rack::Session::SessionId.new(raw_session_id)
    private_session_id = session_id_object.private_id
    where(session_id: private_session_id).first
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

  private

  def generate_display_name
    # 8桁の英数字でdisplay_nameを生成
    self.display_name = SecureRandom.alphanumeric(8)
  end
end

ActionDispatch::Session::ActiveRecordStore.session_class = Session
