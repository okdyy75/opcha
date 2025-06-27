require "test_helper"

class Api::RoomsControllerTest < ActionDispatch::IntegrationTest
  fixtures :sessions, :rooms

  def setup
    @session = sessions(:one)
    @room = rooms(:one)
  end

  test "should get rooms index" do
    get "/api/rooms"

    assert_response :success
    json = JSON.parse(response.body)
    assert json["rooms"].is_a?(Array)
    assert json["pagination"]["total"] >= 1
    assert json["pagination"]["limit"].is_a?(Integer)
    assert json["pagination"]["offset"].is_a?(Integer)
  end

  test "should create room" do
    room_data = {
      room: {
        name: "新しいルーム"
      }
    }

    post "/api/rooms", params: room_data, as: :json

    assert_response :created
    json = JSON.parse(response.body)
    assert_equal "新しいルーム", json["room"]["name"]
    assert_not_nil json["room"]["share_token"]
    assert_not_nil json["room"]["creator_session_id"]
    assert_equal 0, json["room"]["message_count"]
    assert_equal 0, json["room"]["participant_count"]
  end

  test "should show room" do
    get "/api/rooms/#{@room.share_token}"

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal @room.name, json["room"]["name"]
    assert_equal @room.share_token, json["room"]["share_token"]
    assert_not_nil json["room"]["message_count"]
    assert_not_nil json["room"]["participant_count"]
  end

  test "should return error for non-existent room" do
    get "/api/rooms/invalid_token"

    assert_response :not_found
    json = JSON.parse(response.body)
    assert_equal "NOT_FOUND", json["error"]["code"]
  end

  test "should get rooms with pagination" do
    get "/api/rooms?limit=1&offset=0"

    assert_response :success
    json = JSON.parse(response.body)
    assert json["rooms"].is_a?(Array)
    assert json["rooms"].size <= 1
    assert_equal 1, json["pagination"]["limit"]
    assert_equal 0, json["pagination"]["offset"]
  end
end
