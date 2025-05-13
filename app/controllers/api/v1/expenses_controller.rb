class Api::V1::ExpensesController < ApplicationController
    skip_before_action :verify_authenticity_token
  
    # GET /api/v1/expenses or /api/v1/expenses?group_id=1
    def index
      expenses = if params[:group_id]
                   Expense.where(group_id: params[:group_id])
                 else
                   Expense.all
                 end
  
      render json: expenses
    end
  
    # GET /api/v1/expenses/:id
    def show
      expense = Expense.find_by(id: params[:id])
      if expense
        render json: expense
      else
        render json: { error: "Expense not found" }, status: :not_found
      end
    end
  
    # POST /api/v1/expenses
    def create
      expense = Expense.new(expense_params)
  
      if params[:expense][:added_by]
        user = User.find_by(id: params[:expense][:added_by])
        if user
          expense.added_by_user = user
        else
          render json: { error: "User not found" }, status: :unprocessable_entity and return
        end
      end
  
      if expense.save
        render json: expense, status: :created
      else
        render json: { errors: expense.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    # DELETE /api/v1/expenses/:id
    def destroy
      expense = Expense.find_by(id: params[:id])
      if expense
        expense.destroy
        render json: { message: "Expense deleted successfully" }, status: :ok
      else
        render json: { error: "Expense not found" }, status: :not_found
      end
    end
  
    private
  
    def expense_params
      params.require(:expense).permit(:description, :total_amount, :group_id)
    end
  end
  