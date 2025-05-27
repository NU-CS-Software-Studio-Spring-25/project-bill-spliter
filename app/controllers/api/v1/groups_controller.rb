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
        }
      },
      methods: [:total_spending]
    )
  end

  def my_groups
    groups = current_user.groups.includes(:members, :creator)
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
    group.creator = current_user
    
    ActiveRecord::Base.transaction do
      if group.save
        # Add creator as member
        group.group_members.create!(user: current_user)
        
        # Add other members by email
        invalid_emails = []
        if group_params[:member_emails].present?
          emails = group_params[:member_emails].reject(&:blank?)
          users = User.where(email: emails)

          found_emails = users.pluck(:email)
          invalid_emails = emails - found_emails

          if invalid_emails.any?
            render json: { error: "The group was not created. The following emails do not correspond to existing users: #{invalid_emails.join(', ')}" }, status: :unprocessable_entity
            raise ActiveRecord::Rollback
          end

          users.each do |user|
            group.group_members.find_or_create_by(user: user)
          end
        end
        
        render json: {
          message: "Group created successfully",
          data: group.as_json(
            include: {
              members: { only: [:id, :name, :email] },
              creator: { only: [:id, :name] }
            }
          )
        }, status: :created
      else
        render json: { error: group.errors.full_messages }, status: :unprocessable_entity
        raise ActiveRecord::Rollback
      end
    end
  end

  def destroy
    if @group.creator == current_user
      @group.destroy
      render json: { message: "Group deleted successfully" }
    else
      render json: { error: "Only group creator can delete the group" }, status: :forbidden
    end
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

  # GET /api/v1/groups/:id/expenses
  def expenses
    expenses = @group.expenses.includes(:payer)
    render json: expenses.as_json(
      include: { payer: { only: [:id, :name, :email] } },
      only:   [:id, :description, :total_amount, :expense_date]
    )
  end

  # GET /api/v1/groups/:id/settlements
  def settlements
    settlements = @group.settlements.includes(:payer, :payee)
    render json: settlements.as_json(
      include: {
        payer: { only: [:id, :name, :email] },
        payee: { only: [:id, :name, :email] }
      },
      only:   [:id, :amount, :settlement_date]
    )
  end

  private

  def set_group
    @group = current_user.groups.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Group not found or access denied" }, status: :not_found
  end

  def group_params
    params.require(:group).permit(:group_name, member_emails: [])
  end
end
