require "test_helper"

class Api::MovieGenresControllerTest < ActionDispatch::IntegrationTest
  setup do
    @api_movie_genre = api_movie_genres(:one)
  end

  test "should get index" do
    get api_movie_genres_url, as: :json
    assert_response :success
  end

  test "should create api_movie_genre" do
    assert_difference("MovieGenre.count") do
      post api_movie_genres_url, params: { api_movie_genre: {} }, as: :json
    end

    assert_response :created
  end

  test "should show api_movie_genre" do
    get api_movie_genre_url(@api_movie_genre), as: :json
    assert_response :success
  end

  test "should update api_movie_genre" do
    patch api_movie_genre_url(@api_movie_genre), params: { api_movie_genre: {} }, as: :json
    assert_response :success
  end

  test "should destroy api_movie_genre" do
    assert_difference("MovieGenre.count", -1) do
      delete api_movie_genre_url(@api_movie_genre), as: :json
    end

    assert_response :no_content
  end
end
