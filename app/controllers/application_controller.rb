class ApplicationController < ActionController::Base
  include Authentication
  
  # Allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern
  
  # Skip authenticity token for API requests but keep sessions
  protect_from_forgery with: :null_session, if: :api_request?
  
  private
  
  def api_request?
    request.path.start_with?('/api/')
  end
end