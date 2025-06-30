require "test_helper"

class Api::MessagesControllerTest < ActionDispatch::IntegrationTest
  fixtures :sessions, :rooms, :messages

  def setup
    @session = sessions(:one)
    @room = rooms(:one)
    @message = messages(:one)
  end

  test "should get messages index" do
    get "/api/rooms/#{@room.share_token}/messages"

    assert_response :success
    json = JSON.parse(response.body)
    assert json["messages"].is_a?(Array)
    # シンプル化によりpagination情報は不要
    assert_nil json["pagination"]
    assert_equal "Hello World", json["messages"][0]["text_body"]
    assert_equal "User1", json["messages"][0]["session"]["nickname"]
  end

  test "should create message" do
    message_data = {
      message: {
        text_body: "新しいメッセージ"
      }
    }

    post "/api/rooms/#{@room.share_token}/messages", params: message_data, as: :json

    assert_response :created
    json = JSON.parse(response.body)
    assert_equal "新しいメッセージ", json["message"]["text_body"]
    assert_not_nil json["message"]["session"]
    assert [true, false].include?(json["message"]["is_own"])
  end

  test "should return error for invalid room" do
    get "/api/rooms/invalid_token/messages"

    assert_response :not_found
    json = JSON.parse(response.body)
    assert_equal "NOT_FOUND", json["error"]["code"]
  end

  test "should return error for empty message" do
    message_data = {
      message: {
        text_body: ""
      }
    }

    post "/api/rooms/#{@room.share_token}/messages", params: message_data, as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_equal "VALIDATION_ERROR", json["error"]["code"]
  end

  test "should get messages with 20 item limit" do
    get "/api/rooms/#{@room.share_token}/messages"

    assert_response :success
    json = JSON.parse(response.body)
    assert json["messages"].is_a?(Array)
    # 最大20件の制限をテスト
    assert json["messages"].size <= 20
    # pagination情報は返されない
    assert_nil json["pagination"]
  end

  test "should limit messages to 20 items when room has more messages" do
    # 30件のメッセージを作成
    30.times do |i|
      Message.create!(
        room: @room,
        session_id: @session.id,
        text_body: "Test message #{i + 1}"
      )
    end

    get "/api/rooms/#{@room.share_token}/messages"

    assert_response :success
    json = JSON.parse(response.body)
    assert json["messages"].is_a?(Array)
    # 正確に20件のメッセージが返されることを確認
    assert_equal 20, json["messages"].size
    # 最新のメッセージが含まれることを確認（降順で取得後reverse）
    assert_match(/Test message/, json["messages"].last["text_body"])
  end
end
