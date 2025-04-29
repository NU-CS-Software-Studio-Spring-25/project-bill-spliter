class User < ApplicationRecord
    has_secure_password
  
    def groups
      Group.where(id: group_ids)
    end
    has_many :expenses, foreign_key: :added_by
    has_many :expense_splits
  end
  