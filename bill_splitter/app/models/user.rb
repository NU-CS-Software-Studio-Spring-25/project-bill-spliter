class User < ApplicationRecord
    has_secure_password
  
    has_many :group_members
    has_many :groups, through: :group_members
    has_many :expenses, foreign_key: :added_by
    has_many :expense_splits
  end
  