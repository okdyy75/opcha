namespace :sessions do
  desc "期限切れセッションを削除"
  task cleanup: :environment do
    cutoff_time = 24.hours.ago
    
    # 24時間以上前に作成されたセッションを削除
    deleted_count = Session.where("created_at < ?", cutoff_time).delete_all
    
    Rails.logger.info "Session cleanup completed. #{deleted_count} sessions deleted."
    puts "Session cleanup completed. #{deleted_count} sessions deleted."
  end
  
  desc "孤立したセッション（関連するメッセージがないもの）を削除"
  task cleanup_orphaned: :environment do
    # メッセージが関連付けられていないセッションを削除
    orphaned_sessions = Session.left_joins(:messages)
                              .where(messages: { id: nil })
                              .where("sessions.created_at < ?", 1.hour.ago) # 1時間の猶予
    
    deleted_count = orphaned_sessions.delete_all
    
    Rails.logger.info "Orphaned session cleanup completed. #{deleted_count} orphaned sessions deleted."
    puts "Orphaned session cleanup completed. #{deleted_count} orphaned sessions deleted."
  end
end