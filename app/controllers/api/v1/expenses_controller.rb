# app/controllers/api/v1/expenses_controller.rb
class Api::V1::ExpensesController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_expense, only: [:show, :destroy, :update]

  def index
    expenses = if params[:group_id]
                 Expense.includes(:payer, :expense_splits, :group)
                        .where(group_id: params[:group_id])
               elsif params[:user_id]
                 user_expense_ids = ExpenseSplit.where(user_id: params[:user_id]).pluck(:expense_id)
                 payer_expense_ids = Expense.where(payer_id: params[:user_id]).pluck(:id)
                 all_expense_ids = (user_expense_ids + payer_expense_ids).uniq

                 Expense.includes(:payer, :expense_splits, :group)
                        .where(id: all_expense_ids)
               else
                 Expense.includes(:payer, :expense_splits, :group).all
               end

    expenses = expenses.order(created_at: :desc)

    render json: expenses.map { |e| expense_json(e) }
  end

  def show
    render json: expense_json(@expense)
  end

  def create
    expense = Expense.new(expense_params)

    if params[:image]
      expense.image.attach(params[:image])
    end

    if expense.save
      render json: {
        data: expense_json(expense),
        message: "Expense #{expense.description} created and split among #{expense.expense_splits.count} members"
      }, status: :created
    else
      render json: { error: expense.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @expense.update(expense_params)
      if params[:image]
        @expense.image.purge if @expense.image.attached?
        @expense.image.attach(params[:image])
      end

      render json: {
        message: "Expense #{@expense.description} updated successfully",
        data: expense_json(@expense)
      }, status: :ok
    else
      render json: { error: @expense.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    group_name = @expense.group.group_name
    @expense.destroy
    render json: {
      message: "Expense #{@expense.description} deleted successfully from group '#{group_name}'"
    }
  end

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
    params.require(:expense).permit(:description, :total_amount, :group_id, :payer_id, :expense_date, :image)
  end
  
  def expense_json(expense)
    {
      id: expense.id,
      description: expense.description,
      total_amount: expense.total_amount,
      group: {
        id: expense.group.id,
        group_name: expense.group.group_name
      },
      payer: {
        id: expense.payer.id,
        name: expense.payer.name
      },
      expense_date: expense.expense_date,
      created_at: expense.created_at,
      updated_at: expense.updated_at,
      image_url: expense.image.attached? ? url_for(expense.image) : nil,
      expense_splits: expense.expense_splits.map do |split|
        {
          id: split.id,
          amount: split.amount,
          paid_amount: split.paid_amount,
          is_settled: split.is_settled,
          user: {
            id: split.user.id,
            name: split.user.name
          }
        }
      end
    }
  end
end
