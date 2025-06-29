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
    assert [true, false].include?(json["pagination"]["has_more"])
    assert json["pagination"]["next_before"].is_a?(Integer) if json["pagination"]["next_before"]
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

  test "should get messages with pagination" do
    get "/api/rooms/#{@room.share_token}/messages?limit=1"

    assert_response :success
    json = JSON.parse(response.body)
    assert json["messages"].is_a?(Array)
    assert json["messages"].size <= 1
    assert [true, false].include?(json["pagination"]["has_more"])
  end
end
