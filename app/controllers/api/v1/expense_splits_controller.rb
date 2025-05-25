class Api::V1::ExpenseSplitsController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :set_expense_split, only: [:show, :update, :mark_settled, :mark_unsettled]
  
    def index
      expense_splits = if params[:expense_id]
                        ExpenseSplit.includes(:user, :expense)
                                   .where(expense_id: params[:expense_id])
                      elsif params[:user_id]
                        ExpenseSplit.includes(:user, :expense)
                                   .where(user_id: params[:user_id])
                      else
                        ExpenseSplit.includes(:user, :expense).all
                      end
  
      render json: expense_splits.as_json(
        include: {
          user: { only: [:id, :name] },
          expense: { only: [:id, :description, :total_amount] }
        }
      )
    end
  
    def show
      render json: @expense_split.as_json(
        include: {
          user: { only: [:id, :name] },
          expense: { 
            only: [:id, :description, :total_amount],
            include: { payer: { only: [:id, :name] } }
          }
        }
      )
    end
  
    def update
      if @expense_split.update(expense_split_params)
        render json: @expense_split.as_json(
          include: {
            user: { only: [:id, :name] },
            expense: { only: [:id, :description] }
          }
        )
      else
        render json: { errors: @expense_split.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    def mark_settled
      @expense_split.update!(
        paid_amount: @expense_split.amount,
        is_settled: true
      )
      
      render json: {
        expense_split: @expense_split.as_json(
          include: {
            user: { only: [:id, :name] },
            expense: { only: [:id, :description] }
          }
        ),
        message: "Split marked as settled"
      }
    end
  
    def mark_unsettled
      @expense_split.update!(
        paid_amount: 0,
        is_settled: false
      )
      
      render json: {
        expense_split: @expense_split.as_json(
          include: {
            user: { only: [:id, :name] },
            expense: { only: [:id, :description] }
          }
        ),
        message: "Split marked as unsettled"
      }
    end
  
    private
  
    def set_expense_split
      @expense_split = ExpenseSplit.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Expense split not found" }, status: :not_found
    end
  
    def expense_split_params
      params.require(:expense_split).permit(:amount, :paid_amount, :is_settled)
    end
  end