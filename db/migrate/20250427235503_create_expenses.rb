class CreateExpenses < ActiveRecord::Migration[8.0]
  def change
    create_table :expenses do |t|
      t.references :group, null: false, foreign_key: true
      t.uuid :added_by
      t.string :description
      t.decimal :total_amount

      t.timestamps
    end
  end
end
