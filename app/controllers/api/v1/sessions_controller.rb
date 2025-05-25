class Api::V1::SessionsController < ApplicationController
    include Authentication
    skip_before_action :authenticate_user!, only: [:create]
    skip_before_action :verify_authenticity_token
  
    def create
      user = User.find_by(email: params[:email]&.downcase&.strip)
      
      if user&.authenticate(params[:password])
        log_in(user)
        render json: {
          message: 'Logged in successfully',
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        }
      else
        render json: { 
          error: 'Invalid email or password' 
        }, status: :unauthorized
      end
    end
    
    def destroy
      log_out
      render json: { message: 'Logged out successfully' }
    end
    
    def show
      if current_user
        render json: {
          user: {
            id: current_user.id,
            name: current_user.name,
            email: current_user.email
          },
          logged_in: true
        }
      else
        render json: { 
          error: 'Not logged in',
          logged_in: false 
        }, status: :unauthorized
      end
    end
  end