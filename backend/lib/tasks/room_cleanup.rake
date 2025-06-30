namespace :rooms do
  desc "24時間以上非アクティブなルームを自動削除"
  task cleanup: :environment do
    cutoff_time = 24.hours.ago
    
    # 最後のメッセージが24時間以上前のルームを削除
    rooms_to_delete = Room.kept
                          .left_joins(:messages)
                          .group(:id)
                          .having("COALESCE(MAX(messages.created_at), rooms.created_at) < ?", cutoff_time)
    
    deleted_count = 0
    deleted_messages_count = 0
    
    rooms_to_delete.find_each do |room|
      # ルームのメッセージ数をカウント
      message_count = room.messages.kept.count
      
      # ルームに関連するメッセージを削除
      room.messages.kept.find_each(&:discard)
      deleted_messages_count += message_count
      
      # ルームを削除
      room.discard
      deleted_count += 1
      Rails.logger.info "Room #{room.id} (#{room.name}) and #{message_count} messages deleted due to inactivity"
    end
    
    Rails.logger.info "Room cleanup completed. #{deleted_count} rooms and #{deleted_messages_count} messages deleted."
    puts "Room cleanup completed. #{deleted_count} rooms and #{deleted_messages_count} messages deleted."
  end
end