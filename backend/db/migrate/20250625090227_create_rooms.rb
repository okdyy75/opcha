class CreateRooms < ActiveRecord::Migration[8.0]
  def change
    create_table :rooms do |t|
      t.string :name, null: false, limit: 100
      t.string :share_token, limit: 64
      t.string :creator_session_id, limit: 255
      t.timestamp :discarded_at
      t.timestamps
    end

    add_index :rooms, :share_token, unique: true
    add_index :rooms, :creator_session_id
    add_index :rooms, :discarded_at
  end
end
