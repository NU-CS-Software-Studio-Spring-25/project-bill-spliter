# db/migrate/xxxx_create_settlements.rb
class CreateSettlements < ActiveRecord::Migration[8.0]
  def change
    create_table :settlements do |t|
      t.references :payer, null: false, foreign_key: { to_table: :users }, type: :uuid
      t.references :payee, null: false, foreign_key: { to_table: :users }, type: :uuid
      t.references :group, null: false, foreign_key: true
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.text :description
      t.date :settlement_date, default: -> { 'CURRENT_DATE' }
      
      t.timestamps
    end
    
    # Add constraint to prevent self-payments
    add_check_constraint :settlements, "payer_id != payee_id", name: "check_no_self_payment"
  end
end