# db/migrate/xxxx_fix_expenses_model.rb
class FixExpensesModel < ActiveRecord::Migration[8.0]
  def change
    # Fix the added_by reference
    remove_column :expenses, :added_by, :uuid
    add_reference :expenses, :payer, null: false, foreign_key: { to_table: :users }, type: :uuid
    
    # Add expense date
    add_column :expenses, :expense_date, :date, default: -> { 'CURRENT_DATE' }
  end
end