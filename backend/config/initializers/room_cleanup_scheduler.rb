# ルーム自動削除の定期実行設定
# 本番環境ではcronジョブまたはSidekiq等のジョブスケジューラーを使用することを推奨

if Rails.env.production?
  # 本番環境では外部のジョブスケジューラー（cron等）からタスクを実行
  Rails.logger.info "Room cleanup scheduler: Production mode - use external cron jobs"
elsif Rails.env.development?
  # 開発環境では簡易的なスケジューラーを使用（デモ用）
  Rails.logger.info "Room cleanup scheduler: Development mode - scheduler disabled for manual testing"
end

# 使用例:
# 毎時警告通知: 0 * * * * cd /path/to/app && bundle exec rake rooms:warn_inactive
# 毎時削除処理: 30 * * * * cd /path/to/app && bundle exec rake rooms:cleanup
# 
# または
# 毎時警告通知: RoomWarningJob.perform_later
# 毎時削除処理: RoomCleanupJob.perform_later