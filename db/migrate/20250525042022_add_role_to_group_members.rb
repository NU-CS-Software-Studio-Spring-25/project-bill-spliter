class AddRoleToGroupMembers < ActiveRecord::Migration[8.0]
  def change
    add_column :group_members, :role, :string
  end
end
