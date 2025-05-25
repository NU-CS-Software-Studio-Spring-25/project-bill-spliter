class RedesignExpenseSplits < ActiveRecord::Migration[8.0]
  def change
    # Drop existing expense_splits table
    drop_table :expense_splits
    
    # Create new expense_splits table
    create_table :expense_splits do |t|
      t.references :expense, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: { to_table: :users }, type: :uuid
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.decimal :paid_amount, precision: 10, scale: 2, default: 0.0
      t.boolean :is_settled, default: false
      
      t.timestamps
    end
    
    # Add unique constraint to prevent duplicate splits
    add_index :expense_splits, [:expense_id, :user_id], unique: true
  end
end