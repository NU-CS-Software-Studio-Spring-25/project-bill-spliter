class ChangeGroupIdsToIntegerArray < ActiveRecord::Migration[6.0]
  def change
    remove_column :users, :group_ids
    add_column :users, :group_ids, :integer, array: true, default: [], null: false
  end
end
