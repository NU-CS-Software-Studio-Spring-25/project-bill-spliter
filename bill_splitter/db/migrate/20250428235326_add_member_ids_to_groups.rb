class AddMemberIdsToGroups < ActiveRecord::Migration[6.0]
  def change
    add_column :groups, :member_ids, :uuid, array: true, default: []
  end
end
