class ApplicationController < ActionController::API
  rescue_from StandardError, with: :handle_internal_server_error
  
  private
  
  def handle_internal_server_error(exception)
    Rails.logger.error "Internal Server Error: #{exception.message}"
    Rails.logger.error exception.backtrace.join("\n")
    
    render json: { 
      error: { 
        message: 'Internal server error', 
        code: 'INTERNAL_SERVER_ERROR' 
      } 
    }, status: :internal_server_error
  end
end
