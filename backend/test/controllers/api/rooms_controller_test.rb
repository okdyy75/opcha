require "test_helper"

class Api::RoomsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @session = Session.create!(session_id: "test123", nickname: "テストユーザー")
    @room = Room.create!(name: "テストルーム", creator_session_id: @session.session_id)
  end
  
  test "should get rooms index" do
    get "/api/rooms"
    
    assert_response :success
    json = JSON.parse(response.body)
    assert json["rooms"].is_a?(Array)
    assert json["pagination"]["total"] >= 1
  end
  
  test "should create room" do
    room_data = {
      room: {
        name: "新しいルーム",
        creator_session_id: @session.session_id
      }
    }
    
    post "/api/rooms", params: room_data, as: :json
    
    assert_response :created
    json = JSON.parse(response.body)
    assert_equal "新しいルーム", json["room"]["name"]
    assert_not_nil json["room"]["share_token"]
  end
  
  test "should show room" do
    get "/api/rooms/#{@room.id}"
    
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal @room.name, json["room"]["name"]
  end
  
  test "should return error for non-existent room" do
    get "/api/rooms/999999"
    
    assert_response :not_found
    json = JSON.parse(response.body)
    assert_equal "NOT_FOUND", json["error"]["code"]
  end
end
