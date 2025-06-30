class RoomWarningJob < ApplicationJob
  queue_as :default

  def perform
    cutoff_time = 23.hours.ago # 削除1時間前に警告
    
    rooms_to_warn = Room.kept
                        .left_joins(:messages)
                        .group(:id)
                        .having("COALESCE(MAX(messages.created_at), rooms.created_at) < ?", cutoff_time)
    
    warned_count = 0
    rooms_to_warn.find_each do |room|
      # ログ出力（実際のプロダクションではPusher通知やメール送信などを行う）
      Rails.logger.info "Warning: Room #{room.id} (#{room.name}) will be deleted in 1 hour due to inactivity"
      warned_count += 1
    end
    
    Rails.logger.info "Room warning job completed. #{warned_count} rooms warned."
  end
end