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
      begin
        # Pusherで警告通知を送信
        Pusher.trigger("room-#{room.share_token}", 'room-warning', {
          message: "このルームは1時間後に自動削除されます。継続する場合はメッセージを送信してください。"
        })
        warned_count += 1
        Rails.logger.info "Warning sent to room #{room.id} (#{room.name})"
      rescue Pusher::Error => e
        Rails.logger.error "Failed to send warning to room #{room.id}: #{e.message}"
      end
    end
    
    Rails.logger.info "Room warning completed. #{warned_count} rooms warned."
    puts "Room warning completed. #{warned_count} rooms warned."
  end
end