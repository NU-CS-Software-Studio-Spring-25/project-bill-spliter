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
          # 모든 그룹에서 이 유저를 멤버에서 제거
          user.groups.each do |group|
            group.members.delete(user)
          end
  
          user.destroy!
          render json: { message: "User deleted successfully" }, status: :ok
        end
      else
        render json: { error: "User not found" }, status: :not_found
      end
    end
  
    def groups
      user = User.find_by(id: params[:user_id])
      
      if user
        render json: user.groups
      else
        render json: { error: "User not found" }, status: :not_found
      end
    end
  
    private
  
    def user_params
      params.require(:user).permit(:name, :email, :password)
    end
  end
  