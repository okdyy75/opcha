require "test_helper"

class Api::SessionsControllerTest < ActionDispatch::IntegrationTest
  test "should get current session" do
    get "/api/sessions/current", as: :json

    assert_response :success
    json = JSON.parse(response.body)
    assert_not_nil json["session"]["session_id"]
    assert_not_nil json["session"]["display_name"]
    assert json["session"].key?("nickname")
  end

  test "should update session nickname" do
    put "/api/sessions", params: { nickname: "新しいニックネーム" }, as: :json

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "新しいニックネーム", json["session"]["nickname"]
    assert_not_nil json["session"]["display_name"]
    assert_not_nil json["session"]["session_id"]
  end

  test "should return success for session update" do
    put "/api/sessions", params: { nickname: "テストユーザー" }, as: :json

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "テストユーザー", json["session"]["nickname"]
    assert_not_nil json["session"]["display_name"]
    assert_not_nil json["session"]["session_id"]
  end

  test "should handle empty nickname" do
    put "/api/sessions", params: { nickname: "" }, as: :json

    assert_response :success
    json = JSON.parse(response.body)
    assert_not_nil json["session"]["display_name"]
    assert_not_nil json["session"]["session_id"]
    assert_equal "", json["session"]["nickname"]
  end
end
