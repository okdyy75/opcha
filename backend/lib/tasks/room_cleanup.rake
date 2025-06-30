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

  desc "削除予定のルームに警告通知を送信"
  task warn_inactive: :environment do
    cutoff_time = 23.hours.ago # 削除1時間前に警告
    
    rooms_to_warn = Room.kept
                        .left_joins(:messages)
                        .group(:id)
                        .having("COALESCE(MAX(messages.created_at), rooms.created_at) < ?", cutoff_time)
    
    warned_count = 0
    rooms_to_warn.find_each do |room|
      # ログ出力（Pusher実装はIssue 1で行われているため、ここでは基本的なログのみ）
      Rails.logger.info "Warning: Room #{room.id} (#{room.name}) will be deleted in 1 hour due to inactivity"
      warned_count += 1
    end
    
    Rails.logger.info "Room warning completed. #{warned_count} rooms warned."
    puts "Room warning completed. #{warned_count} rooms warned."
  end
end