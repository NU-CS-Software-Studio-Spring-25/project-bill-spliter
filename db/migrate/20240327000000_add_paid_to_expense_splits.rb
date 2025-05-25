class AddPaidToExpenseSplits < ActiveRecord::Migration[6.1]
  def change
    add_column :expense_splits, :paid, :boolean, default: false
  end
end 