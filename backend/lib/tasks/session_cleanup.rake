namespace :sessions do
  desc "Clean up expired sessions"
  task cleanup: :environment do
    puts "Starting session cleanup..."
    
    cleaned_count = Session.cleanup_expired_sessions
    
    puts "Session cleanup completed. Removed #{cleaned_count} expired sessions."
  end

  desc "Show session statistics"
  task stats: :environment do
    total_sessions = Session.count
    active_sessions = Session.active.count
    expired_sessions = Session.expired.count
    
    puts "Session Statistics:"
    puts "  Total sessions: #{total_sessions}"
    puts "  Active sessions: #{active_sessions}"
    puts "  Expired sessions: #{expired_sessions}"
    puts "  Expiry threshold: #{Session::EXPIRY_TIME.inspect}"
  end
end