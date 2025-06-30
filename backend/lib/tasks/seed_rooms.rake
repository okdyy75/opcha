namespace :db do
  namespace :seed do
    desc "Create random rooms for testing infinite scroll"
    task rooms: :environment do
      puts "Creating random rooms for testing..."

      # テスト用セッションを作成
      test_session_id = 'test_session_001'
      test_session = Session.find_by_raw_session_id(test_session_id)
      
      if test_session.nil?
        session_id_object = Rack::Session::SessionId.new(test_session_id)
        test_session = Session.create!(
          session_id: session_id_object.private_id,
          nickname: 'テストユーザー',
          display_name: 'TEST001',
          ip_address: '127.0.0.1',
          user_agent: 'Seed Generator'
        )
      end

      # ランダムなルーム名のパターン
      room_topics = [
        'プログラミング', 'ゲーム', '映画', '音楽', 'スポーツ', '料理', '旅行', '読書',
        'アニメ', 'マンガ', '写真', 'アート', '科学', '歴史', '言語学習', 'ペット',
        'ファッション', '健康', 'フィットネス', 'ガーデニング', 'DIY', 'テクノロジー',
        'カフェ', 'グルメ', 'ドライブ', 'ショッピング', '恋愛', '仕事', '副業', '資格'
      ]

      room_types = [
        '雑談', '相談', '情報交換', '質問', '議論', '共有', '企画', '募集',
        '実況', 'レビュー', 'おすすめ', '初心者', '上級者', 'まったり', 'ガチ', 'のんびり'
      ]

      # 部屋数を指定可能にする（デフォルト50）
      room_count = ENV['COUNT']&.to_i || 50
      
      created_rooms = 0
      existing_rooms = 0

      room_count.times do |i|
        topic = room_topics.sample
        type = room_types.sample
        
        room_name = case rand(4)
        when 0
          "#{topic}#{type}ルーム"
        when 1
          "【#{topic}】#{type}しませんか？"
        when 2
          "#{type}中心の#{topic}部屋"
        else
          "#{topic}好きの#{type}場所"
        end

        # ルームを作成（重複チェック）
        room = Room.find_by(name: room_name)
        if room
          existing_rooms += 1
        else
          room = Room.create!(
            name: room_name,
            creator_session_id: test_session.id
          )
          created_rooms += 1

          # 各ルームにランダムな数のメッセージを追加
          message_count = rand(0..10)
          message_count.times do |j|
            messages = [
              "#{topic}について話しましょう！",
              "こんにちは、よろしくお願いします",
              "初心者ですが参加させてください",
              "いい情報ありがとうございます",
              "#{topic}はいいですよね",
              "詳しく教えてください",
              "参考になります",
              "同じ趣味の人がいて嬉しいです",
              "みなさんはどう思いますか？",
              "おすすめがあれば教えてください"
            ]

            Message.create!(
              room: room,
              session_id: test_session.id,
              text_body: messages.sample,
              created_at: rand(7.days.ago..Time.current)
            )
          end
        end

        print "." if (i + 1) % 10 == 0
      end

      puts "\n✅ Room creation completed!"
      puts "📊 Results:"
      puts "   - #{created_rooms} new rooms created"
      puts "   - #{existing_rooms} rooms already existed"
      puts "   - Total rooms in database: #{Room.count}"
      puts "   - Total messages in database: #{Message.count}"
      
      if created_rooms > 0
        puts "\n🚀 New rooms are ready for infinite scroll testing!"
      else
        puts "\n💡 All requested rooms already exist. Try a larger COUNT or reset the database."
      end
    end

    desc "Clear all test rooms (only rooms created by test session)"
    task clear_test_rooms: :environment do
      puts "Clearing test rooms..."
      
      test_session = Session.find_by(session_id: 'test_session_001')
      if test_session
        rooms = Room.where(creator_session_id: test_session.id)
        room_count = rooms.count
        
        rooms.destroy_all
        
        puts "✅ Cleared #{room_count} test rooms"
        puts "📊 Remaining rooms: #{Room.count}"
      else
        puts "No test session found. Nothing to clear."
      end
    end
  end
end