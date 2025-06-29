require 'pusher'

Pusher.app_id = ENV.fetch('PUSHER_APP_ID', '123')
Pusher.key = ENV.fetch('PUSHER_KEY', 'your-pusher-key')
Pusher.secret = ENV.fetch('PUSHER_SECRET', 'your-pusher-secret')
Pusher.cluster = ENV.fetch('PUSHER_CLUSTER', 'ap3')
Pusher.encrypted = true

Rails.logger.info "Pusher initialized with cluster: #{Pusher.cluster}"