class AddStatusToSettlements < ActiveRecord::Migration[6.1]
  def change
    add_column :settlements, :status, :string, default: 'pending'
  end
end 