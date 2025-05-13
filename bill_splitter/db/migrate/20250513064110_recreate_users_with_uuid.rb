class RecreateUsersWithUuid < ActiveRecord::Migration[7.0]
  def change
    # Drop dependent tables first
    drop_table :expense_splits
    drop_table :expenses
    drop_table :group_memberships
    drop_table :groups
    drop_table :users

    # Recreate users with UUID
    create_table :users, id: :uuid do |t|
      t.string :name
      t.string :email
      t.string :password_digest
      t.timestamps
    end

    # Recreate groups with UUID foreign key to users
    create_table :groups do |t|
      t.string :group_name
      t.references :creator, null: false, foreign_key: { to_table: :users }, type: :uuid
      t.timestamps
    end

    # Recreate group_memberships with UUID user_id
    create_table :group_memberships do |t|
      t.references :group, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.datetime :joined_at
      t.string :role, default: "member"
      t.timestamps
    end

    # Recreate expenses with UUID added_by
    create_table :expenses do |t|
      t.references :group, null: false, foreign_key: true
      t.references :added_by, null: false, foreign_key: { to_table: :users }, type: :uuid
      t.string :description
      t.decimal :total_amount
      t.date :date
      t.timestamps
    end

    # Recreate expense_splits with UUID user_id
    create_table :expense_splits do |t|
      t.references :expense, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.decimal :amount
      t.boolean :paid
      t.timestamps
    end
  end
end
