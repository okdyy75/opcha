class OptimizeIndexes < ActiveRecord::Migration[8.0]
  def change
    # messagesテーブルのインデックス追加
    add_index :messages, [:session_id, :created_at]
    add_index :messages, [:updated_at]
    
    # roomsテーブルのインデックス追加
    add_index :rooms, [:created_at]
    add_index :rooms, [:updated_at]
  end
end
