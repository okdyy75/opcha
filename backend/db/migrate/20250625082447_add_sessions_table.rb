class AddSessionsTable < ActiveRecord::Migration[8.0]
  def change
    create_table :sessions do |t|
      t.string :session_id, null: false, limit: 255
      t.text :data
      t.string :ip_address, limit: 45
      t.text :user_agent
      t.string :nickname, limit: 32
      t.timestamps
    end

    add_index :sessions, :session_id, unique: true
    add_index :sessions, :updated_at
  end
end
