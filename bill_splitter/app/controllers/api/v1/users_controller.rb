class Api::V1::UsersController < ApplicationController
    skip_before_action :verify_authenticity_token

    def index
        users = User.all
        render json: users
    end
    
    def show
        user = User.find_by(id: params[:id])
        
        if user
            render json: user
        else
            render json: { error: "User not found" }, status: :not_found
        end
    end

    def create
      user = User.new(user_params)
  
      if user.save
        render json: { id: user.id, name: user.name, email: user.email }, status: :created
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
        user = User.find_by(id: params[:id])
      
        if user
            ActiveRecord::Base.transaction do
            # Only touch groups the user is already part of
                Group.where(id: user.group_ids).find_each do |group|
                    group.member_ids.delete(user.id)
                    group.save!
                end
      
                user.destroy!
                render json: { message: "User deleted successfully" }, status: :ok
            end
        else
            render json: { error: "User not found" }, status: :not_found
        end
    end
  
    private
  
    def user_params
      params.require(:user).permit(:name, :email, :password)
    end
  end
  