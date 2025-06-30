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
    rooms_to_delete.find_each do |room|
      room.discard
      deleted_count += 1
      Rails.logger.info "Room #{room.id} (#{room.name}) deleted due to inactivity"
    end
    
    Rails.logger.info "Room cleanup completed. #{deleted_count} rooms deleted."
    puts "Room cleanup completed. #{deleted_count} rooms deleted."
  end
end