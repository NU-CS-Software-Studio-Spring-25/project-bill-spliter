class AddGroupIdsToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :group_ids, :uuid, array: true, default: []
  end
end
