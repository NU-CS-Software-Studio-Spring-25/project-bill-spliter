# app/controllers/api/v1/expenses_controller.rb
class Api::V1::ExpensesController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_expense, only: [:show, :destroy]

  def index
    expenses = if params[:group_id]
                 Expense.includes(:payer, :expense_splits, :group)
                        .where(group_id: params[:group_id])
               elsif params[:user_id]
                 # Get expenses where user is either the payer or involved in splits
                 user_expense_ids = ExpenseSplit.where(user_id: params[:user_id]).pluck(:expense_id)
                 payer_expense_ids = Expense.where(payer_id: params[:user_id]).pluck(:id)
                 all_expense_ids = (user_expense_ids + payer_expense_ids).uniq
                 
                 Expense.includes(:payer, :expense_splits, :group)
                        .where(id: all_expense_ids)
               else
                 Expense.includes(:payer, :expense_splits, :group).all
               end

    expenses = expenses.order(created_at: :desc)

    render json: expenses.as_json(
      include: {
        payer: { only: [:id, :name] },
        group: { only: [:id, :group_name] },
        expense_splits: { 
          include: { user: { only: [:id, :name] } },
          only: [:id, :amount, :paid_amount, :is_settled]
        }
      }
    )
  end

  def show
    render json: @expense.as_json(
      include: {
        payer: { only: [:id, :name] },
        group: { only: [:id, :group_name] },
        expense_splits: { 
          include: { user: { only: [:id, :name] } },
          only: [:id, :amount, :paid_amount, :is_settled]
        }
      }
    )
  end

  def create
    expense = Expense.new(expense_params)

    if expense.save
      render json: {
        expense: expense.as_json(
          include: {
            payer: { only: [:id, :name] },
            group: { only: [:id, :group_name] },
            expense_splits: { 
              include: { user: { only: [:id, :name] } }
            }
          }
        ),
        message: "Expense created and split among #{expense.expense_splits.count} members"
      }, status: :created
    else
      render json: { errors: expense.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    group_name = @expense.group.group_name
    @expense.destroy
    render json: { 
      message: "Expense deleted successfully from group '#{group_name}'" 
    }
  end

  # Additional endpoint to get expense summary for a group
  def summary
    group_id = params[:group_id]
    
    if group_id.blank?
      render json: { error: "Group ID is required" }, status: :bad_request
      return
    end

    group = Group.find_by(id: group_id)
    unless group
      render json: { error: "Group not found" }, status: :not_found
      return
    end

    expenses = group.expenses.includes(:payer, :expense_splits)
    total_amount = expenses.sum(:total_amount)
    expense_count = expenses.count
    
    # Get spending by member
    member_spending = {}
    group.members.each do |member|
      member_spending[member.id] = {
        name: member.name,
        paid: expenses.where(payer: member).sum(:total_amount),
        owes: ExpenseSplit.joins(:expense)
                         .where(expenses: { group: group }, user: member)
                         .sum(:amount)
      }
    end

    render json: {
      group: { id: group.id, name: group.group_name },
      summary: {
        total_amount: total_amount,
        expense_count: expense_count,
        member_spending: member_spending
      }
    }
  end

  private

  def set_expense
    @expense = Expense.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Expense not found" }, status: :not_found
  end

  def expense_params
    params.require(:expense).permit(:description, :total_amount, :group_id, :payer_id, :expense_date)
  end
end