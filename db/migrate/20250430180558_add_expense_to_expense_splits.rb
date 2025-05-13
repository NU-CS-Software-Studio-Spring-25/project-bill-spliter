class AddExpenseToExpenseSplits < ActiveRecord::Migration[8.0]
  def change
    add_reference :expense_splits, :expense, null: false, foreign_key: true
  end
end
