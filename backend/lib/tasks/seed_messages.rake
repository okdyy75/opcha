namespace :db do
  namespace :seed do
    desc "Create rooms with many messages for testing message display"
    task messages: :environment do
      puts "Creating rooms with many messages for testing..."

      # テスト用セッションを作成
      test_session_id = 'test_session_messages'
      test_session = Session.find_by_raw_session_id(test_session_id)
      if test_session.nil?
        session_id_object = Rack::Session::SessionId.new(test_session_id)
        test_session = Session.new(
          session_id: session_id_object.private_id,
          nickname: 'メッセージテスター',
          display_name: 'MSG001',
          ip_address: '127.0.0.1',
          user_agent: 'Seed Generator'
        )
        # データを設定してからsave
        test_session.data = {}
        test_session.save!
        test_session.reload
      end

      # 追加のテストユーザーセッション
      test_users = []
      5.times do |i|
        user_session_id = "test_user_#{i}"
        user = Session.find_by_raw_session_id(user_session_id)
        unless user
          session_id_object = Rack::Session::SessionId.new(user_session_id)
          user = Session.new(
            session_id: session_id_object.private_id,
            nickname: "テストユーザー#{i + 1}",
            display_name: "USR#{sprintf('%03d', i + 1)}",
            ip_address: '127.0.0.1',
            user_agent: 'Seed Generator'
          )
          # データを設定してからsave
          user.data = {}
          user.save!
          user.reload
        end
        test_users << user
      end

      # メッセージの多いテストルームを作成
      test_rooms = [
        { name: "【テスト】大量メッセージルーム", message_count: 100 },
        { name: "【テスト】活発な議論部屋", message_count: 80 },
        { name: "【テスト】雑談ルーム", message_count: 60 }
      ]

      # メッセージパターン
      message_patterns = [
        "こんにちは！よろしくお願いします",
        "とても興味深い話題ですね",
        "私もそう思います",
        "詳しく教えてください",
        "なるほど、勉強になります",
        "いい情報をありがとうございます",
        "参考になりました",
        "同じ経験があります",
        "質問があるのですが...",
        "おすすめがあれば教えてください",
        "今日はいい天気ですね",
        "お疲れ様です",
        "また明日お話ししましょう",
        "素晴らしいアイデアですね",
        "一緒に頑張りましょう！",
        "ありがとうございました",
        "楽しい時間でした",
        "また参加したいです",
        "皆さんのおかげで成長できました",
        "次回も楽しみにしています"
      ]

      created_rooms = 0
      total_messages = 0

      test_rooms.each do |room_data|
        # ルームを作成（重複チェック）
        room = Room.find_by(name: room_data[:name])
        
        if room
          puts "  Room '#{room_data[:name]}' already exists, skipping..."
          next
        end

        room = Room.create!(
          name: room_data[:name],
          creator_session_id: test_session.id
        )

        puts "  Creating room: #{room.name}"
        
        # 指定された数のメッセージを作成
        message_count = room_data[:message_count]
        created_count = 0

        message_count.times do |i|
          # ランダムなユーザーを選択（テストセッション含む）
          all_users = [test_session] + test_users
          sender = all_users.sample
          
          # メッセージ内容をランダムに選択
          text_body = message_patterns.sample
          
          # 番号付きメッセージも混ぜる
          if i % 10 == 0
            text_body = "メッセージ #{i + 1}: #{text_body}"
          end

          # 過去7日間の範囲でランダムな作成日時
          created_time = rand(7.days.ago..Time.current)

          message = Message.new(
            room: room,
            session_id: sender.id,
            text_body: text_body,
            created_at: created_time,
            updated_at: created_time
          )
          message.save!
          
          created_count += 1
          print "." if created_count % 20 == 0
        end

        puts "\n  ✅ Created #{created_count} messages for '#{room.name}'"
        created_rooms += 1
        total_messages += created_count
      end

      puts "\n🎉 Message seed creation completed!"
      puts "📊 Results:"
      puts "   - #{created_rooms} rooms created"
      puts "   - #{total_messages} messages created"
      puts "   - Total rooms in database: #{Room.count}"
      puts "   - Total messages in database: #{Message.count}"
      puts "\n🧪 Test the 50-message limit by visiting the created rooms!"
    end

    desc "Clear test message data (rooms and messages created by message seeder)"
    task clear_test_messages: :environment do
      puts "Clearing test message data..."
      
      test_session = Session.find_by(session_id: 'test_session_messages')
      test_rooms = Room.where(name: [
        "【テスト】大量メッセージルーム",
        "【テスト】活発な議論部屋", 
        "【テスト】雑談ルーム"
      ])
      
      message_count = 0
      room_count = test_rooms.count
      
      test_rooms.each do |room|
        message_count += room.messages.count
        room.destroy
      end
      
      # テストユーザーセッションも削除
      Session.where(session_id: ['test_session_messages'] + (0..4).map { |i| "test_user_#{i}" }).destroy_all
      
      puts "✅ Cleared #{room_count} test rooms and #{message_count} test messages"
      puts "📊 Remaining rooms: #{Room.count}"
      puts "📊 Remaining messages: #{Message.count}"
    end
  end
end