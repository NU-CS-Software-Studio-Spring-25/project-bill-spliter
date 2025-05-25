class Api::V1::RegistrationsController < ApplicationController
    include Authentication
    skip_before_action :authenticate_user!
    skip_before_action :verify_authenticity_token
  
    def create
      user = User.new(user_params)
      
      if user.save
        log_in(user)
        render json: {
          message: 'Account created successfully',
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        }, status: :created
      else
        render json: { 
          error: 'Registration failed',
          details: user.errors.full_messages 
        }, status: :unprocessable_entity
      end
    end
  
    private
  
    def user_params
      params.require(:user).permit(:name, :email, :password, :password_confirmation)
    end
  end