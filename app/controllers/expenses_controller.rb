class Api::V1::ExpensesController < ApplicationController
    before_action :set_expense, only: [:show, :destroy]
  
    def index
      expenses = if params[:group_id]
                   group = current_user.groups.find(params[:group_id])
                   group.expenses.includes(:payer, :expense_splits)
                 else
                   # Get all expenses from user's groups
                   user_group_ids = current_user.groups.pluck(:id)
                   Expense.includes(:payer, :expense_splits, :group)
                          .where(group_id: user_group_ids)
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
      group = current_user.groups.find(params[:expense][:group_id])
      expense = group.expenses.build(expense_params)
      expense.payer = current_user
  
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
      if @expense.payer == current_user
        group_name = @expense.group.group_name
        @expense.destroy
        render json: { 
          message: "Expense deleted successfully from group '#{group_name}'" 
        }
      else
        render json: { error: "You can only delete your own expenses" }, status: :forbidden
      end
    end
  
    def summary
      group = current_user.groups.find(params[:group_id])
      
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
      @expense = current_user.groups.joins(:expenses)
                            .find_by!(expenses: { id: params[:id] })
                            .expenses.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Expense not found or access denied" }, status: :not_found
    end
  
    def expense_params
      params.require(:expense).permit(:description, :total_amount, :group_id, :expense_date)
    end
  end