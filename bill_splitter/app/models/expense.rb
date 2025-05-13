class Expense < ApplicationRecord
  belongs_to :group
  belongs_to :added_by, class_name: 'User', foreign_key: 'added_by_id', optional: false
  validates :added_by, presence: true

  has_many :expense_splits
end
