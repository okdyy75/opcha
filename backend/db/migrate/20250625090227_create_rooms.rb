class CreateRooms < ActiveRecord::Migration[8.0]
  def change
    create_table :rooms do |t|
      t.string :name, null: false, limit: 100
      t.string :share_token, null: false, limit: 32
      t.references :creator_session, null: true, foreign_key: { to_table: :sessions }
      t.timestamp :discarded_at
      t.timestamps
    end

    add_index :rooms, :share_token, unique: true
    add_index :rooms, :discarded_at
  end
end
