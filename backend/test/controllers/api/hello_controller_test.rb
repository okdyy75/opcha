require "test_helper"

class Api::HelloControllerTest < ActionDispatch::IntegrationTest
  test "should get hello" do
    get api_hello_hello_url
    assert_response :success
  end
end
