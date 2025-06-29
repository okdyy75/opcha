class CreateMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :messages do |t|
      t.references :room, null: false, foreign_key: true
      t.references :session, null: false, foreign_key: true
      t.text :text_body, null: false
      t.timestamp :discarded_at
      t.timestamps
    end

    add_index :messages, :discarded_at
    add_index :messages, [ :room_id, :created_at ]
  end
end
