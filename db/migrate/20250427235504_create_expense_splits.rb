class CreateExpenseSplits < ActiveRecord::Migration[8.0]
  def change
    create_table :expense_splits do |t|
      t.references :expense, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.decimal :amount
      t.boolean :paid

      t.timestamps
    end
  end
end
