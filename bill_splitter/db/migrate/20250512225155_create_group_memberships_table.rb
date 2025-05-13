# db/migrate/[timestamp]_create_group_memberships_table.rb
class CreateGroupMembershipsTable < ActiveRecord::Migration[8.0]
  def change
    # Create the group_memberships join table
    create_table :group_memberships do |t|
      t.references :group, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.datetime :joined_at
      t.string :role, default: "member"
      t.timestamps
    end

    # Add a unique index to prevent duplicate memberships
    add_index :group_memberships, [:group_id, :user_id], unique: true

    # Remove the array columns from users and groups tables
    remove_column :users, :group_ids, :integer, array: true, default: []
    remove_column :groups, :member_ids, :uuid, array: true, default: []
  end
end