# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# 開発環境でのみテストデータを作成
if Rails.env.development?
  puts "Creating seed data for development environment..."

  # テスト用セッションを作成
  test_session = Session.find_or_create_by!(session_id: 'test_session_001') do |session|
    session.nickname = 'テストユーザー'
    session.display_name = 'TEST001'
    session.ip_address = '127.0.0.1'
    session.user_agent = 'Seed Generator'
  end

  # ランダムなルーム名のパターン
  room_topics = [
    'プログラミング', 'ゲーム', '映画', '音楽', 'スポーツ', '料理', '旅行', '読書',
    'アニメ', 'マンガ', '写真', 'アート', '科学', '歴史', '言語学習', 'ペット',
    'ファッション', '健康', 'フィットネス', 'ガーデニング', 'DIY', 'テクノロジー'
  ]

  room_types = [
    '雑談', '相談', '情報交換', '質問', '議論', '共有', '企画', '募集',
    '実況', 'レビュー', 'おすすめ', '初心者', '上級者', 'まったり'
  ]

  # 50個のランダムなルームを作成
  50.times do |i|
    topic = room_topics.sample
    type = room_types.sample
    
    room_name = case rand(3)
    when 0
      "#{topic}#{type}ルーム"
    when 1
      "【#{topic}】#{type}しませんか？"
    else
      "#{type}中心の#{topic}部屋"
    end

    # ルームを作成（重複チェック）
    room = Room.find_or_create_by!(name: room_name) do |r|
      r.creator_session_id = test_session.id
    end

    # 各ルームにランダムな数のメッセージを追加
    message_count = rand(0..15)
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

      Message.find_or_create_by!(
        room: room,
        session_id: test_session.id,
        text_body: messages.sample,
        created_at: rand(30.days.ago..Time.current)
      )
    end

    print "." if (i + 1) % 10 == 0
  end

  puts "\n✅ Seed data created successfully!"
  puts "📊 Created:"
  puts "   - #{Room.count} rooms"
  puts "   - #{Message.count} messages"
  puts "   - #{Session.count} sessions"
  puts "\n🚀 Run 'rails server' and visit /rooms to see the infinite scroll in action!"

else
  puts "Skipping seed data creation (not in development environment)"
end
