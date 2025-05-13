class DropGroupMembersTable < ActiveRecord::Migration[6.0]
  def change
    drop_table :group_members
  end
end
