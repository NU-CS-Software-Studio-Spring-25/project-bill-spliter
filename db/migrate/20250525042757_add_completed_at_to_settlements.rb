class AddCompletedAtToSettlements < ActiveRecord::Migration[8.0]
  def change
    add_column :settlements, :completed_at, :datetime
  end
end
