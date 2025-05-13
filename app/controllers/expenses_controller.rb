class ExpensesController < ApplicationController
    def index
        @expenses = Expense.all
    end

    def new 
        @expense = Expense.new(group_id: params[:group_id])
        @groups = Group.all
        @users = User.all
    end

    def create
        @expense = Expense.new(expense_params)
        if @expense.save
            redirect_to expenses_path, notice: "Expense was successfully created."
        else
            render :new, status: :unprocessable_entity
        end
    end

    def destroy
        @expense = Expense.find(params[:id])
        @expense.destroy
        redirect_to expenses_path, notice: "Expense was successfully deleted."
    end

    def show
        @expense = Expense.find(params[:id])
    end

    private

    def expense_params
        params.require(:expense).permit(:description, :total_amount, :group_id, :added_by)
    end
end