require "test_helper"

class Api::SessionsControllerTest < ActionDispatch::IntegrationTest
  test "should create session" do
    session_data = {
      session: {
        session_id: "test123",
        nickname: "テストユーザー"
      }
    }

    post "/api/sessions", params: session_data, as: :json

    assert_response :created
    json = JSON.parse(response.body)
    assert_equal "test123", json["session"]["session_id"]
    assert_equal "テストユーザー", json["session"]["nickname"]
  end

  test "should update session nickname" do
    session = Session.create!(session_id: "test456", nickname: "古いニックネーム")

    put "/api/sessions/test456", params: { nickname: "新しいニックネーム" }, as: :json

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "新しいニックネーム", json["session"]["nickname"]
  end

  test "should return error for invalid session_id" do
    put "/api/sessions/nonexistent", params: { nickname: "テスト" }, as: :json

    assert_response :not_found
    json = JSON.parse(response.body)
    assert_equal "NOT_FOUND", json["error"]["code"]
  end
end
