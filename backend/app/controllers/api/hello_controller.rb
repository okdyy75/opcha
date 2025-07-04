require "socket"

class Api::HelloController < ApplicationController
  def hello
    hostname = Socket.gethostname
    current_time = Time.now.in_time_zone("Asia/Tokyo")
    session[:test] = "test"

    render json: {
      message: "Hello World",
      version: Rails.version,
      hostname: hostname,
      current_time: current_time,
      session: session[:session_id]
    }
  end
end
