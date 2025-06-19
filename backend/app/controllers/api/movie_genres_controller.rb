class Api::MovieGenresController < ApplicationController
  before_action :set_api_movie_genre, only: %i[ show update destroy ]

  # GET /api/movie_genres
  def index
    @api_movie_genres = MovieGenre.all

    render json: @api_movie_genres
  end

  # GET /api/movie_genres/1
  def show
    render json: @api_movie_genre
  end

  # POST /api/movie_genres
  def create
    @api_movie_genre = MovieGenre.new(api_movie_genre_params)

    if @api_movie_genre.save
      render json: @api_movie_genre, status: :created, location: @api_movie_genre
    else
      render json: @api_movie_genre.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/movie_genres/1
  def update
    if @api_movie_genre.update(api_movie_genre_params)
      render json: @api_movie_genre
    else
      render json: @api_movie_genre.errors, status: :unprocessable_entity
    end
  end

  # DELETE /api/movie_genres/1
  def destroy
    @api_movie_genre.destroy!
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_api_movie_genre
      @api_movie_genre = MovieGenre.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def api_movie_genre_params
      params.fetch(:api_movie_genre, {})
    end
end
