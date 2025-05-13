class ExpensesController < ApplicationController
  before_action :set_users_and_groups, only: [:new, :create]

  def index
    @expenses = Expense.all
  end

  def new
    @expense = Expense.new
  end

  def create
    @expense = Expense.new(expense_params)    
    if @expense.save
      redirect_to expenses_path, notice: 'Expense added successfully.'
    else
      @groups = Group.all
      @users = User.all
      render :new
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

  def set_users_and_groups
    @users = User.all # Fetch all users from the database
    @groups = Group.all # Fetch all groups from the database
  end

  def expense_params
    params.require(:expense).permit(:description, :total_amount, :group_id, :added_by_id)
  end
end
