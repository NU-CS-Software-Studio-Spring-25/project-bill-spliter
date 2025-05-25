class FixGroupsModel < ActiveRecord::Migration[8.0]
  def up
    # First remove the array columns
    remove_column :groups, :member_ids, :uuid, array: true
    remove_column :groups, :created_by, :uuid

    # Add creator reference as nullable first
    add_reference :groups, :creator, foreign_key: { to_table: :users }, type: :uuid, null: true

    # Update existing records to set a creator (using the first user as default)
    execute <<-SQL
      UPDATE groups 
      SET creator_id = (SELECT id FROM users LIMIT 1)
      WHERE creator_id IS NULL;
    SQL

    # Now make the column non-nullable
    change_column_null :groups, :creator_id, false
  end

  def down
    remove_reference :groups, :creator
    add_column :groups, :created_by, :uuid
    add_column :groups, :member_ids, :uuid, array: true, default: []
  end
end 