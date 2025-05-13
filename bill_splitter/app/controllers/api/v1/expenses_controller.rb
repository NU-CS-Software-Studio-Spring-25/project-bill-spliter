class Api::V1::ExpensesController < ApplicationController
    skip_before_action :verify_authenticity_token

    def index
        if params[:group_id]
            expenses = Expense.where(group_id: params[:group_id])
        else
            expenses = Expense.all
        end
        render json: expenses
    end
    def create
        expense = Expense.new(expense_params)
        expense.added_by_user = User.find(params[:expense][:added_by]) if params[:expense][:added_by]

        if expense.save
            render json: expense, status: :created
        else
            render json: { errors: expense.errors.full_messages }, status: :unprocessable_entity
        end
    end
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
        params.require(:expense).permit(:description, :total_amount, :group_id, :added_by)
    end
    
    
end
