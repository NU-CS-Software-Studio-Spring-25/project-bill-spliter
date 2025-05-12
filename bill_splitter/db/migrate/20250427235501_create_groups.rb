class CreateGroups < ActiveRecord::Migration[8.0]
  def change
    create_table :groups do |t|
      t.string :group_name
      t.bigint :created_by, null: false

      t.timestamps
    end
    add_foreign_key :groups, :users, column: :created_by
  end
end
