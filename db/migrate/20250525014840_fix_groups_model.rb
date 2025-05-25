# db/migrate/xxxx_fix_groups_model.rb
class FixGroupsModel < ActiveRecord::Migration[8.0]
  def change
    # Remove the array-based member_ids column
    remove_column :groups, :member_ids, :uuid, array: true
    
    # Change created_by to reference users properly
    remove_column :groups, :created_by, :uuid
    add_reference :groups, :creator, null: false, foreign_key: { to_table: :users }, type: :uuid
  end
end