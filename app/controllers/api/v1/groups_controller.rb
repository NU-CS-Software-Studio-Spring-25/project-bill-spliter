class Api::V1::GroupsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_group, only: [:show, :destroy, :balances, :expenses, :settlements]

  def index
    groups = Group.includes(:members, :creator).page(params[:page]).per(12)
    render json: {
      groups: groups.as_json(
        include: {
          members: { only: [:id, :name, :email] },
          creator: { only: [:id, :name] }
        }
      ),
      current_page: groups.current_page,
      total_pages: groups.total_pages
    }
  end

  def show
    render json: @group.as_json(
      include: {
        members: { only: [:id, :name, :email] },
        creator: { only: [:id, :name] },
        expenses: { 
          include: { payer: { only: [:id, :name] } }
        },
        settlements: {
          include: {
            payer: { only: [:id, :name] },
            payee: { only: [:id, :name] }
          }
        }
      },
      methods: [:total_spending]
    )
  end

  def balances
    balances = @group.calculate_group_balances
    simplified_debts = @group.simplified_debts
    
    render json: {
      group_id: @group.id,
      group_name: @group.group_name,
      balances: balances.map do |user_id, balance|
        user = User.find(user_id)
        {
          user: { id: user.id, name: user.name, email: user.email },
          balance: balance,
          status: balance > 0 ? 'owes_to_others' : balance < 0 ? 'others_owe' : 'settled'
        }
      end,
      simplified_debts: simplified_debts.map do |debt|
        {
          debtor: { id: debt[:debtor].id, name: debt[:debtor].name },
          creditor: { id: debt[:creditor].id, name: debt[:creditor].name },
          amount: debt[:amount]
        }
      end,
      total_spending: @group.total_spending
    }
  end

  def expenses
    expenses = @group.expenses.includes(:payer, :expense_splits)
                             .order(created_at: :desc)
    
    render json: expenses.as_json(
      include: {
        payer: { only: [:id, :name] },
        expense_splits: {
          include: { user: { only: [:id, :name] } },
          only: [:id, :amount, :paid_amount, :is_settled]
        }
      }
    )
  end

  def settlements
    settlements = @group.settlements.includes(:payer, :payee)
                                   .order(created_at: :desc)
    
    render json: settlements.as_json(
      include: {
        payer: { only: [:id, :name] },
        payee: { only: [:id, :name] }
      }
    )
  end

  def my_groups
    user_id = params[:user_id]
    if user_id.blank?
      render json: { error: "User ID is required" }, status: :bad_request
      return
    end

    user = User.find_by(id: user_id)
    unless user
      render json: { error: "User not found" }, status: :not_found
      return
    end

    groups = user.groups.includes(:members, :creator)
    render json: groups.as_json(
      include: {
        members: { only: [:id, :name, :email] },
        creator: { only: [:id, :name] }
      },
      methods: [:total_spending]
    )
  end

  def create
    group = Group.new(group_params.except(:member_emails))
    
    ActiveRecord::Base.transaction do
      if group.save
        # Add creator as member
        group.group_members.create!(user: group.creator)
        
        # Add other members by email
        if params[:member_emails].present?
          emails = params[:member_emails].reject(&:blank?)
          users = User.where(email: emails)
          
          users.each do |user|
            group.group_members.find_or_create_by(user: user)
          end
        end
        
        render json: group.as_json(
          include: {
            members: { only: [:id, :name, :email] },
            creator: { only: [:id, :name] }
          }
        ), status: :created
      else
        render json: { errors: group.errors.full_messages }, status: :unprocessable_entity
        raise ActiveRecord::Rollback
      end
    end
  end

  def destroy
    @group.destroy
    render json: { message: "Group deleted successfully" }
  end

  private

  def set_group
    @group = Group.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Group not found" }, status: :not_found
  end

  def group_params
    params.require(:group).permit(:group_name, :creator_id, member_emails: [])
  end
end