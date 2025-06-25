require "test_helper"

class Api::MessagesControllerTest < ActionDispatch::IntegrationTest
  def setup
    @session = Session.create!(session_id: "test123", nickname: "テストユーザー")
    @room = Room.create!(name: "テストルーム", creator_session_id: @session.session_id)
    @message = Message.create!(
      room: @room,
      session_id: @session.session_id,
      text_body: "テストメッセージ"
    )
  end

  test "should get messages index" do
    get "/api/rooms/#{@room.id}/messages"

    assert_response :success
    json = JSON.parse(response.body)
    assert json["messages"].is_a?(Array)
    assert_equal 1, json["messages"].size
    assert_equal "テストメッセージ", json["messages"][0]["text_body"]
  end

  test "should create message" do
    message_data = {
      message: {
        session_id: @session.session_id,
        text_body: "新しいメッセージ"
      }
    }

    post "/api/rooms/#{@room.id}/messages", params: message_data, as: :json

    assert_response :created
    json = JSON.parse(response.body)
    assert_equal "新しいメッセージ", json["message"]["text_body"]
    assert_equal @session.session_id, json["message"]["session_id"]
    assert_equal @session.nickname, json["message"]["user"]["nickname"]
  end

  test "should return error for invalid room" do
    get "/api/rooms/999999/messages"

    assert_response :not_found
    json = JSON.parse(response.body)
    assert_equal "NOT_FOUND", json["error"]["code"]
  end

  test "should return error for empty message" do
    message_data = {
      message: {
        session_id: @session.session_id,
        text_body: ""
      }
    }

    post "/api/rooms/#{@room.id}/messages", params: message_data, as: :json

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert_equal "VALIDATION_ERROR", json["error"]["code"]
  end
end
