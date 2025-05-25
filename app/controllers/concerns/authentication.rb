module Authentication
    extend ActiveSupport::Concern
  
    included do
      before_action :authenticate_user!
    end
  
    private
  
    def current_user
      @current_user ||= User.find(session[:user_id]) if session[:user_id]
    rescue ActiveRecord::RecordNotFound
      session[:user_id] = nil
      nil
    end
  
    def authenticate_user!
      unless current_user
        render json: { error: 'Please log in to access this resource' }, status: :unauthorized
      end
    end
  
    def logged_in?
      !!current_user
    end
  
    def log_in(user)
      session[:user_id] = user.id
      @current_user = user
    end
  
    def log_out
      session.delete(:user_id)
      @current_user = nil
    end
  end