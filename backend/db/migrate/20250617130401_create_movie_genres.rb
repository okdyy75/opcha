class CreateMovieGenres < ActiveRecord::Migration[8.0]
  def change
    create_table :movie_genres do |t|
      t.string :name

      t.timestamps
    end
  end
end
