class Api::V1::UsersController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_user, only: [:show, :destroy, :groups, :balance]

  def index
    users = User.all.order(:name)
    render json: users.as_json(only: [:id, :name, :email])
  end

  def show
    render json: @user.as_json(only: [:id, :name, :email, :created_at])
  end

  def groups
    groups = @user.groups.includes(:members, :creator)
    render json: groups.as_json(
      include: {
        members: { only: [:id, :name, :email] },
        creator: { only: [:id, :name] }
      },
      methods: [:total_spending]
    )
  end

  def balance
    total_balance = @user.total_balance
    group_balances = @user.groups.map do |group|
      {
        group: { id: group.id, name: group.group_name },
        balance: @user.balance_in_group(group)
      }
    end

    render json: {
      user: { id: @user.id, name: @user.name },
      total_balance: total_balance,
      group_balances: group_balances
    }
  end

  def create
    user = User.new(user_params)

    if user.save
      render json: user.as_json(only: [:id, :name, :email]), status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    ActiveRecord::Base.transaction do
      # Remove user from all groups
      @user.group_members.destroy_all
      
      # Delete the user
      @user.destroy!
      render json: { message: "User deleted successfully" }
    end
  end

  private

  def set_user
    @user = User.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "User not found" }, status: :not_found
  end

  def user_params
    params.require(:user).permit(:name, :email, :password)
  end
end
