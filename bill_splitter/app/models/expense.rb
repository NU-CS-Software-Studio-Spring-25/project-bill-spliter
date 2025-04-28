class Expense < ApplicationRecord
  belongs_to :group
  belongs_to :added_by_user, class_name: "User", foreign_key: :added_by

  has_many :expense_splits
end
