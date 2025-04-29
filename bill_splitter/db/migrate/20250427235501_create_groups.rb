class CreateGroups < ActiveRecord::Migration[8.0]
  def change
    create_table :groups do |t|
      t.string :group_name
      t.uuid :created_by

      t.timestamps
    end
  end
end
